const argparse = require('argparse'),
      firebaseAdmin = require('firebase-admin');

function parseArgs() {
  var parser = new argparse.ArgumentParser();
  parser.addArgument(
    '--event',
    {
      required: true,
      help: 'target event name'
    }
  );
  parser.addArgument(
    '--prod',
    {
      action: 'storeTrue',
      help: 'apply to production'
    }
  );
  return parser.parseArgs();
}

function initFirebase(prod) {
  let accountConfig,
      databaseURL;
  if (prod) {
    accountConfig = require('./firebaseConfig/firebaseAccountConfig-prod.json');
    databaseURL = 'https://jmr-register-live.firebaseio.com';
  } else {
    accountConfig = require('./firebaseConfig/firebaseAccountConfig-dev.json');
    databaseURL = 'https://jmr-register.firebaseio.com';
  }

  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(accountConfig),
    databaseURL
  });
  return firebaseAdmin;
};

const args = parseArgs();
const eventName = args.event;

const firebase = initFirebase(args.prod);
const db = firebase.database();

const usersRef = db.ref('users');
const registrationsRef = db.ref('event-registrations').child(eventName);

let users;

usersRef.once('value')
.then(snapshot => {
  users = snapshot.val();
  return registrationsRef.once('value')
})
.then(snapshot => {
  let registrations = snapshot.val();
  Object.keys(registrations).forEach(uid => {
    let registration = registrations[uid];
    if (!!registration.order && !!registration.order.donation) {
      const user = users[uid];
      console.log(`${user.email} - $${0.01 * registration.order.donation}`);
    }
  });
  process.exit();
})
.catch(err => {
  console.log(err);
});

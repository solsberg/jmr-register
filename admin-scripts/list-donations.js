const argparse = require('argparse'),
      moment = require('moment'),
      sortBy = require('lodash/sortBy'),
      has = require('lodash/has'),
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
  let total = 0;
  let registrationKeysWithDonations = Object.keys(registrations).filter(uid => has(registrations[uid], 'order.donation'));
  sortBy(registrationKeysWithDonations, uid => registrations[uid].order.created_at).forEach(uid => {
    let registration = registrations[uid];
    const user = users[uid];
    console.log(`${moment(registration.order.created_at).format('MM-DD-YYYY')} ${user.profile.first_name} ${user.profile.last_name} (${user.email}) - $${0.01 * registration.order.donation}`);
    total += registration.order.donation;
  });
  console.log(`Total: $${0.01 * total}`);
  process.exit();
})
.catch(err => {
  console.log(err);
});

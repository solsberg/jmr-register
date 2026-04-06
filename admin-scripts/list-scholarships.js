const argparse = require('argparse'),
      moment = require('moment'),
      sortBy = require('lodash/sortBy'),
      has = require('lodash/has'),
      partition = require('lodash/partition'),
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
  let ymlTotal = 0, aidTotal = 0;
  const registrationKeysWithScholarships = Object.keys(registrations)
    .filter(uid => has(registrations[uid], 'order.created_at') && has(registrations[uid], 'scholarship.type') && has(registrations[uid], 'account.credits'));
  const [ ymlKeys, aidKeys ] = partition(registrationKeysWithScholarships, uid => registrations[uid].scholarship.type === 'yml');
  console.log("YML Scholarships:");
  sortBy(ymlKeys, uid => registrations[uid].order.created_at).forEach(uid => {
    let registration = registrations[uid];
    const user = users[uid];
    const totalCredit = Object.values(registration.account.credits).reduce((acc, d) => acc + d.amount, 0);
    console.log(`${moment(registration.order.created_at).format('MM-DD-YYYY')} ${user.profile.first_name} ${user.profile.last_name} (${user.email}) - $${0.01 * totalCredit}`);
    ymlTotal += totalCredit;
  });
  console.log(`Total YML Credits: $${(0.01 * ymlTotal).toFixed(2)}`);
  console.log(`Number of YML Recipients: ${ymlKeys.length}`);
  console.log("");
  console.log("Financial Aid:");
  sortBy(aidKeys, uid => registrations[uid].order.created_at).forEach(uid => {
    let registration = registrations[uid];
    const user = users[uid];
    const totalCredit = Object.values(registration.account.credits).reduce((acc, d) => acc + d.amount, 0);
    console.log(`${moment(registration.order.created_at).format('MM-DD-YYYY')} ${user.profile.first_name} ${user.profile.last_name} (${user.email}) - $${0.01 * totalCredit}`);
    aidTotal += totalCredit;
  });
  console.log(`Total Financial Aid Amounts: $${(0.01 * aidTotal).toFixed(2)}`);
  console.log(`Number of Financial Aid Recipients: ${aidKeys.length}`);
  process.exit();
})
.catch(err => {
  console.log(err);
});

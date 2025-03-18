const argparse = require('argparse'),
      firebaseAdmin = require('firebase-admin'),
      moment = require('moment'),
      get = require('lodash/get'),
      has = require('lodash/has');

function parseArgs() {
  var parser = new argparse.ArgumentParser();
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
const firebase = initFirebase(args.prod);
const db = firebase.database();

const usersRef = db.ref('users');

usersRef.once('value')
.then(snapshot => {
  let users = snapshot.val();
  console.log("email,first_name,last_name,phone,city,state,last_login");
  Object.values(users).forEach(user => {
    const values = [
      user.email,
      get(user, 'profile.first_name'),
      get(user, 'profile.last_name'),
      get(user, 'profile.phone'),
      get(user, 'profile.city'),
      get(user, 'profile.state'),
      user.last_login ? moment(user.last_login).format('MM-DD-YYYY') : ""
    ];
    console.log(values.join(","));
  });
  process.exit();
})
.catch(err => {
  console.log(err);
});

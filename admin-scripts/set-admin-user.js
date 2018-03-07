const argparse = require('argparse'),
      firebaseAdmin = require('firebase-admin');

function parseArgs() {
  var parser = new argparse.ArgumentParser();
  parser.addArgument(
    'email',
    {
      help: 'email of user to make admin'
    }
  );
  parser.addArgument(
    '--prod',
    {
      action: 'storeTrue',
      help: 'apply to production'
    }
  );
  parser.addArgument(
    '--query',
    {
      action: 'storeTrue',
      help: 'queries if the user is an admin'
    }
  );
  parser.addArgument(
    '--revoke',
    {
      action: 'storeTrue',
      help: 'revoke admin access'
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
const envName = args.prod ? 'prod' : 'dev';

const firebase = initFirebase(args.prod);
const auth = firebase.auth();

const fetchUser = auth.getUserByEmail(args.email);

if (args.query) {
  fetchUser.then((user) => {
    const isAdmin = user.customClaims && user.customClaims.admin;
    console.log(`${args.email} is ${isAdmin ? '' : 'not '}an admin in ${envName}`);
    process.exit();
  }).catch((err) => {
    console.log(err);
  });
} else {
  fetchUser.then((user) => auth.setCustomUserClaims(user.uid, {admin: !args.revoke}))
  .then(() => {
    console.log(`${args.email} is ${args.revoke ? 'no longer' : 'now'} an admin in ${envName}`);
    process.exit();
  }).catch((err) => {
    console.log(err);
  });
}

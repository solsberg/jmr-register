const argparse = require('argparse'),
      firebaseAdmin = require('firebase-admin'),
      moment = require('moment'),
      get = require('lodash/get'),
      has = require('lodash/has');

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

const eventRef = db.ref('events').child(eventName);
const usersRef = db.ref('users');
const registrationsRef = db.ref('event-registrations').child(eventName);

let event;
let users;

eventRef.once('value')
.then(snapshot => {
  event = snapshot.val();
  return usersRef.once('value')
})
.then(snapshot => {
  users = snapshot.val();
  return registrationsRef.once('value')
})
.then(snapshot => {
  let registrations = snapshot.val();
  Object.keys(registrations).forEach(uid => {
    let registration = registrations[uid];
    if (!!registration.order && !registration.cancelled) {
      const user = users[uid];

      let lineItems = calculateStatement(registration, event);
      if (lineItems.balance > 0) {
        console.log(`${user.email} - ${user.profile.first_name} ${user.profile.last_name}`);
        console.log('Registration Fee' + formatMoney(lineItems.charges).padStart(8, ' '));
        console.log('Amount Paid' + ('(' + formatMoney(lineItems.payments - lineItems.refunds)).padStart(13, ' ') + ')');
        if (lineItems.credits > 0) {
          console.log('Credit Applied' + ('(' + formatMoney(lineItems.credits)).padStart(10, ' ') + ')');
        }
        console.log('-'.padStart(25, '-'));
        console.log('Balance Due' + formatMoney(lineItems.balance).padStart(13, ' '));
        console.log('');
      }
    }
  });
  process.exit();
})
.catch(err => {
  console.log(err);
});

function calculateStatement(registration, event) {
  //main registration
  let totalCharges = 0;
  let totalPayments = 0;
  let totalCredits = 0;
  let totalRefunds = 0;

  let order = registration.order;

  totalCharges += event.priceList.roomChoice[order.roomChoice];

  let discountCode;
  if (!!order.discountCode) {
    let discountCodes = Object.keys(event.discountCodes)
      .map(k => event.discountCodes[k]);
    discountCode = discountCodes.find(c => c.name === order.discountCode);
  }
  if (!!discountCode) {
    totalCharges -= discountCode.amount;
  }

  let earlyDiscount;
  const orderTime = moment(get(order, 'created_at'));
  if (has(event, 'earlyDiscount') && orderTime.isSameOrBefore(event.earlyDiscount.endDate, 'day')) {
    earlyDiscount = event.earlyDiscount;
  } else if (has(event, 'earlyDiscount.extended') &&
      orderTime.isSameOrBefore(event.earlyDiscount.extended.endDate, 'day')) {
    earlyDiscount = event.earlyDiscount.extended;
  }
  if (!!earlyDiscount && !get(discountCode, 'exclusive')) {
    let amount = event.priceList.roomChoice[order.roomChoice];
    if (earlyDiscount.amount > 1) {
      amount = earlyDiscount.amount;
    } else {
      amount *= earlyDiscount.amount;
    }
    totalCharges -= amount;
  }

  if (order.singleSupplement) {
    totalCharges += event.priceList.singleRoom[order.roomChoice];
  }

  if (order.refrigerator) {
    totalCharges += event.priceList.refrigerator;
  }

  if (order.thursdayNight) {
    totalCharges += event.priceList.thursdayNight;
  }

  if (order.donation) {
    totalCharges += order.donation;
  }

  //previous payments
  let payments = get(registration, "account.payments", {});
  Object.keys(payments)
    .map(k => payments[k])
    .filter(p => p.status === 'paid')
    .forEach(p => {
      totalPayments += p.amount;
    });

  //refunds
  let refunds = get(registration, "account.refunds", {});
  Object.keys(refunds)
    .map(k => refunds[k])
    .forEach(p => {
      totalRefunds -= p.amount;
    });

  //credits
  let credits = get(registration, "account.credits", {});
  let creditsList = Object.keys(credits)
    .map(k => credits[k])
    .forEach(p => {
      totalCredits += p.amount;
    });

  const balance = totalCharges - totalPayments - totalCredits + totalRefunds;

  return {
    charges: totalCharges,
    payments: totalPayments,
    credits: totalCredits,
    refunds: totalRefunds,
    balance: balance
  };
}

function formatMoney(amountInCents) {
  return '$' + (0.01 * amountInCents).toFixed(0).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}

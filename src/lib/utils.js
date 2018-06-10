import moment from 'moment';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import ROOM_DATA from '../roomData.json';

export const isMobile = () => /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

export const validateEmail = (email) => {
  var re = /^(?:[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&amp;'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/;
  return re.test(email);
}

export function log() {
  if (process.env.NODE_ENV !== 'production' || !!process.env.REACT_APP_STAGING) {
    console.log.apply(this, arguments);
  }
}

export function b64DecodeUnicode(str) {
  // from https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/Base64_encoding_and_decoding
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}

export function formatMoney(amountInCents, scale=2) {
  return '$' + (0.01 * amountInCents).toFixed(scale).replace(/(\d)(?=(\d{3})+\.)/g, '$1,');
}

export function isEarlyDiscountAvailable(event, order, serverTimestamp) {
  const currentTime = moment(get(order, 'created_at') || serverTimestamp);
  return currentTime.isSameOrBefore(event.earlyDiscount.endDate);
}

export function isBambamDiscountAvailable(bambam, event, order, serverTimestamp) {
  debugger;
  if (!!bambam.inviter) {
    const currentTime = moment(get(order, 'created_at') || serverTimestamp);
    if (moment(currentTime).isSameOrBefore(moment(bambam.inviter.invited_at)
        .add(event.bambamDiscount.registerByAmount, event.bambamDiscount.registerByUnit)
        .endOf('day'))) {
      return true;
    }
  }
  if (!!bambam.invitees && !!bambam.invitees.find(i =>
      i.registered &&
      moment(i.registered_at).isSameOrBefore(moment(i.invited_at)
        .add(event.bambamDiscount.registerByAmount, event.bambamDiscount.registerByUnit)
        .endOf('day')))) {
    return true;
  }
}

export function calculateBalance(registration, eventInfo) {
  const { balance } = buildStatement(registration, eventInfo);
  return balance;
}

export function buildStatement(registration, event, serverTimestamp) {
  let order = Object.assign({}, registration.order, registration.cart);
  if (!order.roomChoice) {
    return;
  }
  let lineItems = [];

  //main registration
  let totalCharges = 0;
  let totalCredits = 0;
  lineItems.push({
    description: "Lodging type: " + ROOM_DATA[order.roomChoice].title,
    amount: event.priceList.roomChoice[order.roomChoice],
    type: "order"
  });
  totalCharges += event.priceList.roomChoice[order.roomChoice];

  if (isEarlyDiscountAvailable(event, order, serverTimestamp)) {
    const amount = event.priceList.roomChoice[order.roomChoice] * event.earlyDiscount.amount;
    lineItems.push({
      description: `${event.earlyDiscount.amount * 100}% early registration discount`,
      amount,
      type: "discount"
    });
    totalCharges -= amount;
  }

  const bambam = get(registration, "bambam", {});
  if (isBambamDiscountAvailable(bambam, event, order, serverTimestamp)) {
    const amount = event.priceList.roomChoice[order.roomChoice] * event.bambamDiscount.amount;
    lineItems.push({
      description: `${event.bambamDiscount.amount * 100}% 'Be a Mensch, Bring a Mensch' discount`,
      amount,
      type: "discount"
    });
    totalCharges -= amount;
  }

  if (order.singleSupplement) {
    lineItems.push({
      description: "Single room supplement",
      amount: event.priceList.singleRoom[order.roomChoice],
      type: "order"
    });
    totalCharges += event.priceList.singleRoom[order.roomChoice];
  }

  if (order.refrigerator) {
    lineItems.push({
      description: "Mini-fridge",
      amount: event.priceList.refrigerator,
      type: "order"
    });
    totalCharges += event.priceList.refrigerator;
  }

  if (order.thursdayNight) {
    lineItems.push({
      description: "Thursday evening arrival",
      amount: event.priceList.thursdayNight,
      type: "order"
    });
    totalCharges += event.priceList.thursdayNight;
  }

  if (order.donation) {
    lineItems.push({
      description: "Donation",
      amount: order.donation,
      type: "order"
    });
    totalCharges += order.donation;
  }

  lineItems.push({
    description: "Total charges",
    amount: totalCharges,
    type: "subtotal"
  });

  //early deposit credit
  if (registration.earlyDeposit && registration.earlyDeposit.status === 'paid') {
    lineItems.push({
      description: "Pre-registration credit",
      amount: 3600,
      type: "credit"
    });
    totalCredits += 3600;
  }

  //previous payments
  let payments = get(registration, "account.payments", {});
  let paymentsList = Object.keys(payments)
    .map(k => payments[k]);
  sortBy(paymentsList, p => p.created_at)
    .filter(p => p.status === 'paid')
    .forEach(p => {
      lineItems.push({
        description: "Payment received on " + moment(p.created_at).format("MMM D, Y"),
        amount: p.amount,
        type: "credit"
      });
      totalCredits += p.amount;
    });

  const balance = totalCharges - totalCredits;
  if (balance >= 0) {
    lineItems.push({
      description: "Balance due",
      amount: balance,
      type: "balance"
    });
  } else {
    lineItems.push({
      description: "Refund due",
      amount: balance * -1,
      type: "refund"
    });
  }

  return {
    lineItems,
    balance
  };
}

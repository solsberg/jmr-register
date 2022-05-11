import moment from 'moment';
import get from 'lodash/get';
import has from 'lodash/has';
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
  return !!getEarlyDiscount(event, order, serverTimestamp);
}

export function getEarlyDiscount(event, order, serverTimestamp) {
  const currentTime = moment(get(order, 'created_at') || serverTimestamp);
  if (get(order, 'roomChoice') && get(event, `roomTypes.${order.roomChoice}.noEarlyDiscount`)) {
    return null;
  }
  if (has(event, 'earlyDiscount') &&
      currentTime.isSameOrBefore(event.earlyDiscount.endDate, 'day')) {
    return event.earlyDiscount;
  }
  if (has(event, 'earlyDiscount.extended') &&
      currentTime.isSameOrBefore(event.earlyDiscount.extended.endDate, 'day')) {
    return event.earlyDiscount.extended;
  }
}

export function getLateCharge(event, order, serverTimestamp) {
  const currentTime = moment(get(order, 'created_at') || serverTimestamp);
  if (get(order, 'roomChoice') && get(event, `roomTypes.${order.roomChoice}.noLateCharge`)) {
    return null;
  }
  if (has(event, 'priceList.lateCharge') &&
      currentTime.isSameOrAfter(event.priceList.lateCharge.startDate, 'day')) {
    return event.priceList.lateCharge;
  }
}

export function isBambamDiscountAvailable(bambam, event, order, serverTimestamp) {
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

export function calculateBalance(registration, eventInfo, user) {
  const { balance } = buildStatement(registration, eventInfo, user);
  return balance;
}

export function buildStatement(registration, event, user, serverTimestamp, roomUpgrade, appliedDiscountCode) {
  let order = Object.assign({}, registration.order, registration.cart);
  if (!order.roomChoice) {
    return;
  }
  let lineItems = [];

  //main registration
  let totalCharges = 0;
  let totalCredits = 0;
  let lodgingType = ROOM_DATA[order.roomChoice].title;
  if (isRoomUpgradeAvailable(roomUpgrade, order, event)) {
    const upgradeType = ROOM_DATA[order.roomChoice].upgradeTo;
    if (!!upgradeType) {
      lodgingType = `${lodgingType} (upgraded to ${ROOM_DATA[upgradeType].title})`
    }
  }
  let prefix = "";
  if (!event.onlineOnly) {
    prefix = "Lodging type: ";
  }
  lineItems.push({
    description: prefix + lodgingType,
    amount: event.priceList.roomChoice[order.roomChoice],
    type: "order"
  });
  totalCharges += event.priceList.roomChoice[order.roomChoice];

  const discountCodeName = order.discountCode || appliedDiscountCode;
  let discountCode;
  if (!!discountCodeName) {
    let discountCodes = Object.keys(event.discountCodes)
      .map(k => event.discountCodes[k]);
    discountCode = discountCodes.find(c => c.name === discountCodeName);
  }
  if (!!discountCode) {
    lineItems.push({
      description: 'Discount code applied',
      amount: discountCode.amount,
      type: "discount"
    });
    totalCharges -= discountCode.amount;
  }

  let preRegistrationDiscount = getPreRegistrationDiscount(user, event, order, serverTimestamp);
  if (!!preRegistrationDiscount && !get(discountCode, 'exclusive')) {
    let amount = event.priceList.roomChoice[order.roomChoice];
    let description;
    if (event.onlineOnly && order.roomChoice !== "online_base") {
      amount = 0
    } else if (preRegistrationDiscount.amount > 1) {
      amount = preRegistrationDiscount.amount;
      description = 'Pre-registration discount';
    } else {
      amount *= preRegistrationDiscount.amount;
      description = `${preRegistrationDiscount.amount * 100}% pre-registration discount`;
    }
    if (amount > 0) {
      lineItems.push({
        description,
        amount,
        type: "discount"
      });
    }
    totalCharges -= amount;
  }

  let earlyDiscount = getEarlyDiscount(event, order, serverTimestamp);
  if (!!earlyDiscount && !preRegistrationDiscount && !get(discountCode, 'exclusive')) {
    let amount = event.priceList.roomChoice[order.roomChoice];
    let description;
    if (event.onlineOnly && order.roomChoice !== "online_base") {
      amount = 0
    } else if (earlyDiscount.amount > 1) {
      amount = earlyDiscount.amount;
      description = 'Early registration discount';
    } else {
      amount *= earlyDiscount.amount;
      description = `${earlyDiscount.amount * 100}% early registration discount`;
    }
    if (amount > 0) {
      lineItems.push({
        description,
        amount,
        type: "discount"
      });
    }
    totalCharges -= amount;
  }

  let lateCharge = getLateCharge(event, order, serverTimestamp);
  if (!!lateCharge) {
    let amount = event.priceList.roomChoice[order.roomChoice];
    let description;
    if (lateCharge.amount > 1) {
      amount = lateCharge.amount;
      description = 'Late charge';
    } else {
      amount *= lateCharge.amount;
      description = `${lateCharge.amount * 100}% late charge`;
    }
    if (amount > 0) {
      lineItems.push({
        description,
        amount,
        type: "supplement"
      });
    }
    totalCharges += amount;
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
    let thursdayNightRate = event.priceList.thursdayNight;
    if (order.singleSupplement && has(event, 'priceList.thursdayNightSingle')) {
      thursdayNightRate = event.priceList.thursdayNightSingle;
    }
    lineItems.push({
      description: "Thursday evening arrival",
      amount: thursdayNightRate,
      type: "order"
    });
    totalCharges += thursdayNightRate;
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

  if (isPreRegistered(user, event)) {
    lineItems.push({
      description: "Pre-registration credit",
      amount: event.preRegistration.depositAmount,
      type: "credit"
    });
    totalCredits += event.preRegistration.depositAmount;
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

  //refunds
  let refunds = get(registration, "account.refunds", {});
  let refundsList = Object.keys(refunds)
    .map(k => refunds[k]);
  sortBy(refundsList, p => p.created_at)
    .forEach(p => {
      lineItems.push({
        description: "Refund applied on " + moment(p.created_at).format("MMM D, Y"),
        amount: p.amount,
        type: "refund"
      });
      totalCredits -= p.amount;
    });

  //credits
  let credits = get(registration, "account.credits", {});
  let creditsList = Object.keys(credits)
    .map(k => credits[k]);
  sortBy(creditsList, p => p.created_at)
    .forEach(p => {
      lineItems.push({
        description: "Credit applied on " + moment(p.created_at).format("MMM D, Y"),
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
    const onlineExtraDonated = order.roomChoice.indexOf("online") >= 0 && !!order.onlineExtraDonated;
    lineItems.push({
      description: !onlineExtraDonated ? "Refund due" : "Overpayment as donation",
      amount: balance * -1,
      type: "due"
    });
  }

  return {
    lineItems,
    balance
  };
}

export function isRegistered(reg) {
  return (has(reg, 'account.payments') ||
    (has(reg, 'account.credits') && has(reg, 'order')) ||
    has(reg, 'external_payment.registration')) &&
    !has(reg, 'order.cancelled');
}

export function isRoomUpgradeAvailable(currentRoomUpgrade, order, event) {
  return (!!currentRoomUpgrade && currentRoomUpgrade.available &&
    (!currentRoomUpgrade.eventId || currentRoomUpgrade.eventId === event.eventId))
      || order.roomUpgrade;
}

export function isPreRegistered(user, event, onlyDiscount = false) {
  if (!user || !has(event, 'preRegistration.users')) {
    return false;
  }
  let entry = Object.keys(event.preRegistration.users)
    .find(k => event.preRegistration.users[k].toLowerCase() === user.email.toLowerCase());
  if (!entry && !onlyDiscount && has(event, 'preRegistration.usersNoDiscount')) {
    entry = Object.keys(event.preRegistration.usersNoDiscount)
      .find(k => event.preRegistration.usersNoDiscount[k].toLowerCase() === user.email.toLowerCase());
  }
  return entry != null;
}

export function getPreRegistrationDiscount(user, event, order, serverTimestamp) {
  const currentTime = moment(get(order, 'created_at') || serverTimestamp);
  if (get(order, 'roomChoice') && get(event, `roomTypes.${order.roomChoice}.noEarlyDiscount`)) {
    return null;
  }
  if (isPreRegistered(user, event, true) && has(event, 'preRegistration.discount') &&
      currentTime.isSameOrBefore(event.preRegistration.discount.endDate, 'day')) {
    return event.preRegistration.discount;
  }
}

export function isPreRegistrationDiscountAvailable(user, event, order, serverTimestamp) {
  return !!getPreRegistrationDiscount(user, event, order, serverTimestamp);
}
export function getRegistrationTime(registration) {
  if (has(registration, 'account.payments')) {
    return registration.order.created_at;
  } else {
    let externalPayment = get(registration, 'external_payment.registration');
    if (!!externalPayment && !!externalPayment.type) {
      return externalPayment.timestamp;
    }
  }
}

export function getRegistrationDate(registration) {
  const timestamp = getRegistrationTime(registration);
  return timestamp && moment(timestamp).format("MMM D, Y");
}

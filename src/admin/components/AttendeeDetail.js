import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router';
import classNames from "classnames";
import moment from 'moment';
import get from 'lodash/get';

import ROOM_DATA from '../../roomData.json';
import { buildStatement, isRegistered } from '../../lib/utils';
import { reconcileExternalPayment, cancelRegistration } from '../../lib/api';
import StatementTable from '../../components/StatementTable';
import MoneyField from '../../components/MoneyField';
import { PaymentContext } from '../../contexts/PaymentContext';

const CARD_NONE = 'CARD_NONE';
const CARD_EXTERNAL = 'CARD_EXTERNAL';
const CARD_CREDIT = 'CARD_CREDIT';
const CARD_CHECKOUT = 'CARD_CHECKOUT';

const AttendeeField = ({name, label, value}) => {
  return (
    <div className="form-group row">
      <label htmlFor={name} className="col-md-3 col-form-label">{label}</label>
      <div className="col-md-9">
        <input type="text" readOnly className="form-control-plaintext" id={name}
          value={value || ''} />
      </div>
    </div>
  );
}

const AttendeeDetail = ({
  registration,
  event,
  user,
  onReload
}) => {
  const [currentTab, setCurrentTab] = useState("registration");
  const [accountCardType, setAccountCardType] = useState(CARD_NONE);
  const [paymentDate, setPaymentDate] = useState(moment(get(registration, "external_payment.registration.timestamp")).format('YYYY-MM-DD'));
  const [creditDate, setCreditDate] = useState(moment().format('YYYY-MM-DD'));
  const [amount, setAmount] = useState();
  const [externalType, setExternalType] = useState(get(registration, "external_payment.registration.type"));

  const { setupCheckout } = useContext(PaymentContext);
  const navigate = useNavigate();

  const selectTab = (evt, type) => {
    evt.preventDefault();
    setCurrentTab(type);
  };

  const openExternalPaymentCard = () => {
    setAccountCardType(CARD_EXTERNAL);
  };

  const openCreditCard = () => {
    setAccountCardType(CARD_CREDIT);
  };

  const openCheckoutCard = () => {
    setAccountCardType(CARD_CHECKOUT);
  };

  const renderRegistrationTab = () => {
    const order = Object.assign({}, registration.order, registration.cart);

    let roomType = ROOM_DATA[order.roomChoice].title;
    if (order.roomUpgrade && !!ROOM_DATA[order.roomChoice].upgradeTo) {
      roomType = `${roomType} (upgraded to ${ROOM_DATA[ROOM_DATA[order.roomChoice].upgradeTo].title})`
    }

    return (
      <div>
        <AttendeeField name="roomChoice" label="Room Type" value={roomType} />
        <AttendeeField name="singleRoom" label="Single Room" value={order.singleSupplement} />
        <AttendeeField name="refrigerator" label="Refrigerator" value={order.refrigerator} />
        <AttendeeField name="thursday" label="Thursday Night" value={order.thursdayNight} />
        <AttendeeField name="roommate" label="Roommate Request" value={order.roommate} />
        <AttendeeField name="first_jmr" label="First JMR?" value={registration.personal && registration.personal.first_jmr} />
        <AttendeeField name="extra_info" label="Welcome suggestion" value={registration.personal && registration.personal.extra_info} />
        <AttendeeField name="dietary" label="Dietary Preference" value={user.profile.dietary_preference} />
        <AttendeeField name="gluten_free" label="Gluten Free" value={user.profile.gluten_free} />
        <AttendeeField name="additional_dietary" label="Additional Dietary Info" value={user.profile.dietary_additional} />
      </div>
    );
  };

  const renderPersonalTab = () => {
    const profile = user.profile;

    const elements = [profile.address_1, profile.address_2, [profile.city, profile.state, profile.post_code].join(' ').trim()];
    const address = elements
      .filter(f => !!f)
      .join(', ');

    return (
      <div>
        <AttendeeField name="email" label="Email" value={user.email} />
        <AttendeeField name="address" label="Address" value={address} />
        <AttendeeField name="phone" label="Phone" value={profile.phone} />
        <AttendeeField name="phone_2" label="Alternate Phone" value={profile.phone_2} />
        <AttendeeField name="emergency_name" label="Emergency Contact" value={profile.emergency_name} />
        <AttendeeField name="emergency_phone" label="Emergency Phone" value={profile.emergency_phone} />
        <AttendeeField name="dob" label="Date of Birth" value={profile.date_of_birth} />
        <AttendeeField name="religious" label="Religious Identiification" value={profile.religious_identity} />
        <AttendeeField name="roster" label="Roster Preference" value={profile.contact_share} />
      </div>
    );
  };

  const updatePaymentDate = (evt) => {
    setPaymentDate(evt.target.value);
  };

  const updateCreditDate = (evt) => {
    setCreditDate(evt.target.value);
  };

  const updateExternalType = (evt) => {
    setExternalType(evt.target.value);
  };

  const submitExternalPayment = () => {
    //validate
    if (!moment(paymentDate).isValid()) {
      alert("Invalid date: " + paymentDate);
      return;
    }

    let usePaymentDate = paymentDate;
    let timestamp = get(registration, "external_payment.registration.timestamp");
    if (moment(timestamp).isSame(paymentDate, 'day')) {
      usePaymentDate = timestamp;
    }

    if (amount > 0) {
      reconcileExternalPayment(event.eventId, user.uid, amount, usePaymentDate, externalType)
      .then(() => {
        if (!!onReload) {
          onReload(user);
        }
        setAccountCardType(CARD_NONE);
        setAmount(0);
      })
      .catch((err) => {
        alert("Error recording payment: " + err);
      })
    }
  };

  const submitCredit = () => {
    //validate
    if (!moment(creditDate).isValid()) {
      alert("Invalid date: " + creditDate);
      return;
    }

    if (amount > 0) {
      reconcileExternalPayment(event.eventId, user.uid, amount, creditDate, 'CREDIT')
      .then(() => {
        if (!!onReload) {
          onReload(user);
        }
        setAccountCardType(CARD_NONE);
        setAmount(0);
      })
      .catch((err) => {
        alert("Error recording credit: " + err);
      })
    }
  };

  const submitCheckout = () => {
    if (amount > 0) {
      setupCheckout(event, user, amount);
      navigate('/admin/checkout');
    }
  };

  const handleCancel = () => {
    if (isRegistered(registration) && window.confirm("Are you sure you want to cancel this registration?")) {
      cancelRegistration(event.eventId, user.uid)
      .then(() => {
        if (!!onReload) {
          onReload(user);
        }
      }).catch((err) => {
        alert("Error recording payment: " + err);
      });
    }
  };

  const renderExternalPaymentCard = () => {
    return (
      <div className="row mt-3">
        <div className="card col-md-6 offset-md-3">
          <div className="card-header">External Payment</div>
          <div className="card-body">
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor='amount'>Amount</label>
              <MoneyField id="external_payment_amount" className="col-md-6" amount={amount} onChange={setAmount} />
            </div>
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor="externalType">Type</label>
              <select className="form-control col-md-6" id="externalType"
                  value={externalType} onChange={updateExternalType} >
                <option value='PAYPAL' key='PAYPAL'>PayPal</option>
                <option value='CHECK' key='CHECK'>Check</option>
              </select>
            </div>
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor='paymentDate'>Payment Date</label>
              <input id='paymentDate' type='text' className="form-control col-md-6" value={paymentDate} onChange={updateCreditDate} />
            </div>
            <button type='submit' className="btn btn-success" onClick={submitExternalPayment}>Submit</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCreditCard = () => {
    return (
      <div className="row mt-3">
        <div className="card col-md-6 offset-md-3">
          <div className="card-header">Grant Credit</div>
          <div className="card-body">
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor='amount'>Amount</label>
              <MoneyField id="credit_amount" className="col-md-6" amount={amount} onChange={setAmount} />
            </div>
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor='creditDate'>Date</label>
              <input id='creditDate' type='text' className="form-control col-md-6" value={creditDate} onChange={updatePaymentDate} />
            </div>
            <button type='submit' className="btn btn-success" onClick={submitCredit}>Submit</button>
          </div>
        </div>
      </div>
    );
  };

  const renderCheckout = () => {
    return (
      <div className="row mt-3">
        <div className="card col-md-6 offset-md-3">
          <div className="card-header">Amount to Charge</div>
          <div className="card-body">
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor='amount'>Amount</label>
              <MoneyField id="checkout_amount" className="col-md-6" amount={amount} onChange={setAmount} />
            </div>
            <button type='submit' className="btn btn-success" onClick={submitCheckout}>Submit</button>
          </div>
        </div>
      </div>
    );
  };

  const renderAccountTab = () => {
    const { lineItems } = buildStatement(registration, event, user);
    if (lineItems) {
      return (
        <div>
          <StatementTable lineitems={lineItems} />
          <div>
            <button className="btn btn-sm btn-info" type="button" onClick={openExternalPaymentCard}>
              Record External Payment >>
            </button>
            <button className="btn btn-sm btn-info ml-3" type="button" onClick={openCreditCard}>
              Record Credit >>
            </button>
            <button className="btn btn-sm btn-info ml-3" type="button" onClick={openCheckoutCard}>
              Make Credit Card Payment >>
            </button>
            <button className="btn btn-sm btn-info ml-3" type="button" onClick={handleCancel}>
              Cancel Registration >>
            </button>
          </div>
          { accountCardType === CARD_EXTERNAL && renderExternalPaymentCard() }
          { accountCardType === CARD_CREDIT && renderCreditCard() }
          { accountCardType === CARD_CHECKOUT && renderCheckout() }
        </div>
      );
    }
  };

  let tabContent;
  switch(currentTab) {
    case 'registration':
      tabContent = renderRegistrationTab();
      break;
    case 'personal':
      tabContent = renderPersonalTab();
      break;
    case 'account':
      tabContent = renderAccountTab();
      break;
    default:
  }

  return (
    <div className="mt-3">
      <Link className="nav-link float-right" to={`/admin/full`}>&lt;&lt;&nbsp;Back to Attendee List</Link>
      <h5 className="my-4">
        Registration for {user.profile.first_name} {user.profile.last_name} (<small><em>{user.uid}</em></small>)
      </h5>
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <a className={classNames("nav-link", currentTab === "registration" && "active")}
              href="" onClick={(evt) => selectTab(evt, "registration")}>
            Registration
          </a>
        </li>
        <li className="nav-item">
          <a className={classNames("nav-link", currentTab === "personal" && "active")}
              href="" onClick={(evt) => selectTab(evt, "personal")}>
            Personal Info
          </a>
        </li>
        <li className="nav-item">
          <a className={classNames("nav-link", currentTab === "account" && "active")}
              href="" onClick={(evt) => selectTab(evt, "account")}>
            Statement
          </a>
        </li>
      </ul>
      <div className="offset-md-1 col-md-10 my-4">
        {tabContent}
      </div>
    </div>
  );
};

export default AttendeeDetail;

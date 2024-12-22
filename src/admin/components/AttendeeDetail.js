import React, { Component } from 'react';
import { Link } from 'react-router';
import classNames from "classnames";
import moment from 'moment';
import get from 'lodash/get';

import ROOM_DATA from '../../roomData.json';
import { buildStatement } from '../../lib/utils';
import { reconcileExternalPayment } from '../../lib/api';
import StatementTable from '../../components/StatementTable';
import MoneyField from '../../components/MoneyField';

const CARD_NONE = 'CARD_NONE';
const CARD_EXTERNAL = 'CARD_EXTERNAL';
const CARD_CREDIT = 'CARD_CREDIT';

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

class AttendeeDetail extends Component {
  constructor(props) {
    super(props);

    const { registration } = this.props;
    let timestamp = get(registration, "external_payment.registration.timestamp");
    let externalType = get(registration, "external_payment.registration.type");
    this.state = {
      currentTab: "registration",
      accountCardType: CARD_NONE,
      paymentDate: moment(timestamp).format('YYYY-MM-DD'),
      creditDate: moment().format('YYYY-MM-DD'),
      amount: 0,
      externalType
    };
  }

  selectTab = (evt, type) => {
    evt.preventDefault();
    this.setState({
      currentTab: type
    });
  }

  openExternalPaymentCard = () => {
    this.setState({
      accountCardType: CARD_EXTERNAL
    });
  }

  openCreditCard = () => {
    this.setState({
      accountCardType: CARD_CREDIT
    });
  }

  renderRegistrationTab = () => {
    const { registration, user } = this.props;

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
  }

  renderPersonalTab = () => {
    const { user } = this.props;

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
  }

  updateAmount = (amount) => {
    this.setState({
      amount
    })
  }

  updatePaymentDate = (evt) => {
    this.setState({
      paymentDate: evt.target.value
    });
  }

  updateCreditDate = (evt) => {
    this.setState({
      creditDate: evt.target.value
    });
  }

  updateExternalType = (evt) => {
    this.setState({
      externalType: evt.target.value
    });
  }

  submitExternalPayment = () => {
    const { amount, paymentDate, externalType } = this.state;
    const { user, event, registration, onReload } = this.props;

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
        this.setState({
          accountCardType: CARD_NONE,
          amount: 0
        });
      })
      .catch((err) => {
        alert("Error recording payment: " + err);
      })
    }
  }

  submitCredit = () => {
    const { amount, creditDate } = this.state;
    const { user, event, onReload } = this.props;

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
        this.setState({
          accountCardType: CARD_NONE,
          amount: 0
        });
      })
      .catch((err) => {
        alert("Error recording credit: " + err);
      })
    }
  }

  renderExternalPaymentCard = () => {
    const { amount, paymentDate, externalType } = this.state;
    return (
      <div className="row mt-3">
        <div className="card col-md-6 offset-md-3">
          <div className="card-header">External Payment</div>
          <div className="card-body">
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor='amount'>Amount</label>
              <MoneyField id="payment_amount" className="col-md-6" amount={amount} onChange={this.updateAmount} />
            </div>
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor="externalType">Type</label>
              <select className="form-control col-md-6" id="externalType"
                  value={externalType} onChange={this.updateExternalType} >
                <option value='PAYPAL' key='PAYPAL'>PayPal</option>
                <option value='CHECK' key='CHECK'>Check</option>
              </select>
            </div>
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor='paymentDate'>Payment Date</label>
              <input id='paymentDate' type='text' className="form-control col-md-6" value={paymentDate} onChange={this.updateCreditDate} />
            </div>
            <button type='submit' className="btn btn-success" onClick={this.submitExternalPayment}>Submit</button>
          </div>
        </div>
      </div>
    );
  }

  renderCreditCard = () => {
    const { amount, creditDate } = this.state;
    return (
      <div className="row mt-3">
        <div className="card col-md-6 offset-md-3">
          <div className="card-header">Grant Credit</div>
          <div className="card-body">
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor='amount'>Amount</label>
              <MoneyField id="payment_amount" className="col-md-6" amount={amount} onChange={this.updateAmount} />
            </div>
            <div className="form-group row">
              <label className="col-md-4 col-form-label" htmlFor='creditDate'>Date</label>
              <input id='creditDate' type='text' className="form-control col-md-6" value={creditDate} onChange={this.updatePaymentDate} />
            </div>
            <button type='submit' className="btn btn-success" onClick={this.submitCredit}>Submit</button>
          </div>
        </div>
      </div>
    );
  }

  renderAccountTab = () => {
    const { registration, event, user } = this.props;
    const { accountCardType } = this.state;

    const { lineItems } = buildStatement(registration, event, user);
    if (lineItems) {
      return (
        <div>
          <StatementTable lineitems={lineItems} />
          <div>
            <button className="btn btn-sm btn-info" type="button" onClick={this.openExternalPaymentCard}>
              Record External Payment >>
            </button>
            <button className="btn btn-sm btn-info ml-3" type="button" onClick={this.openCreditCard}>
              Record Credit >>
            </button>
          </div>
          { accountCardType === CARD_EXTERNAL && this.renderExternalPaymentCard() }
          { accountCardType === CARD_CREDIT && this.renderCreditCard() }
        </div>
      );
    }
  }

  render() {
    const { user } = this.props;
    const { currentTab } = this.state;

    let tabContent;
    switch(currentTab) {
      case 'registration':
        tabContent = this.renderRegistrationTab();
        break;
      case 'personal':
        tabContent = this.renderPersonalTab();
        break;
      case 'account':
        tabContent = this.renderAccountTab();
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
                href="" onClick={(evt) => this.selectTab(evt, "registration")}>
              Registration
            </a>
          </li>
          <li className="nav-item">
            <a className={classNames("nav-link", currentTab === "personal" && "active")}
                href="" onClick={(evt) => this.selectTab(evt, "personal")}>
              Personal Info
            </a>
          </li>
          <li className="nav-item">
            <a className={classNames("nav-link", currentTab === "account" && "active")}
                href="" onClick={(evt) => this.selectTab(evt, "account")}>
              Statement
            </a>
          </li>
        </ul>
        <div className="offset-md-1 col-md-10 my-4">
          {tabContent}
        </div>
      </div>
    );
  }
}

export default AttendeeDetail;

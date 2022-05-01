import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import get from 'lodash/get';
import has from 'lodash/has';
import sortBy from 'lodash/sortBy';
import { saveAs } from 'file-saver';
import { formatMoney, calculateBalance, isRegistered, getRegistrationDate } from '../../lib/utils';
import ROOM_DATA from '../../roomData.json';

const buildCSVRowValues = ({registration, user}) => {
  let vals = {
    email: user.email,
    name: `${user.profile.first_name} ${user.profile.last_name}`
  };
  let order = {...registration.order, ...registration.cart};
  return Object.assign(vals, user.profile, order, registration.personal);
};

const buildCSV = (registrations) => {
  const fields = [
    "name", "email", "address_1", "address_2", "city", "state", "post_code", "phone", "phone_2",
    "emergency_name", "emergency_phone", "date_of_birth", "religious_identity",
    "dietary_preference", "gluten_free", "dietary_additional", "first_jmr", "contact_share", "extra_info",
    "roomChoice", "singleSupplement", "refrigeratorSelected", "thursdayNight", "roommate"
  ];

  let header_row = fields.join(",");
  let data_rows = registrations
    .map(buildCSVRowValues)
    .map(vals => fields.map(f => {
        let val = vals[f];
        if (typeof val === 'string') {
          val = val.replace(/[,'"\n]/g, " ");
        }
        return val;
      })
      .join(","));

  return [header_row, ...data_rows].join("\n");
};

const onDownloadSpreadsheet = (registrationItems) => {
  var blob = new Blob([buildCSV(registrationItems)], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "attendees.csv");
};

const RegistrationRow = ({user, registration}, event) => {
  let order = {...registration.order, ...registration.cart};
  let payments = get(registration, "account.payments", {});
  let paymentsList = Object.keys(payments)
    .map(k => payments[k]);
  let paid = paymentsList.reduce((acc, sub) => acc + sub.amount, 0);
  if (paid > 0) {
    paid = formatMoney(paid);
  }

  let externalPayment = get(registration, 'external_payment.registration');
  if (!!externalPayment && !!externalPayment.type &&
      !has(registration, 'account.payments') && !has(registration, 'account.credits')) {
    paid = `[${externalPayment.type.toLowerCase()}]`;
  }
  let roomType = order.roomChoice;
  if (order.roomUpgrade && !!ROOM_DATA[order.roomChoice].upgradeTo) {
    roomType = ROOM_DATA[order.roomChoice].upgradeTo + ' (upgraded)';
  }
  return (
    <tr key={user.uid}>
      <th scope="row">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>{user.email}</Link>
      </th>
      <td>{user.profile && user.profile.first_name}</td>
      <td>{user.profile && user.profile.last_name}</td>
      <td>{getRegistrationDate(registration)}</td>
      <td>{ROOM_DATA[roomType].title}</td>
      <td>{paid}</td>
      <td>{formatMoney(calculateBalance(registration, event, user))}</td>
    </tr>
  );
};

const FullRegistrations = ({registrations, event}) => {
  let registrationItems = sortBy((registrations || [])
    .filter((reg) => isRegistered(reg.registration)),
    i => {
      //sort by date
      let registrationDate = get(i.registration, "order.created_at");
      if (!has(i.registration, 'account.payments')) {
        let externalPayment = get(i.registration, 'external_payment.registration');
        if (!!externalPayment && !!externalPayment.type) {
          registrationDate = externalPayment.timestamp;
        }
      }
      return registrationDate;
    });

  return (
    <div className="my-3">
      <h3 className="text-center">
        Registered Attendees
      </h3>
      <div className="table-responsive-md">
        <table className="table table-striped table-sm report-table">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">First</th>
              <th scope="col">Last</th>
              <th scope="col">Signup Date</th>
              <th scope="col">Room Type</th>
              <th scope="col">Paid</th>
              <th scope="col">Balance</th>
            </tr>
          </thead>
          <tbody>
          { registrationItems.map(r => RegistrationRow(r, event)) }
          </tbody>
        </table>
      </div>
      <span className="font-italic">Total registrations: {registrationItems.length}</span>
      <div className="float-right">
        <a href="#" onClick={() => onDownloadSpreadsheet(registrationItems)} >
          Download spreadsheet
        </a>
      </div>
    </div>
  );
}

export default FullRegistrations;

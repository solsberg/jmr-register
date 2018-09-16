import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import get from 'lodash/get';
import has from 'lodash/has';
import sortBy from 'lodash/sortBy';
import { formatMoney, calculateBalance, isRegistered } from '../../lib/utils';

const RegistrationRow = ({user, registration}, event) => {
  let order = {...registration.order, ...registration.cart};
  let payments = get(registration, "account.payments", {});
  let paymentsList = Object.keys(payments)
    .map(k => payments[k]);
  let paid = paymentsList.reduce((acc, sub) => acc + sub.amount, 0);
  if (paid > 0) {
    paid = formatMoney(paid);
  }

  let updated_at;
  if (has(registration, 'account.payments') || has(registration, 'account.credits')) {
    updated_at = registration.order.created_at;
  } else {
    let externalPayment = get(registration, 'external_payment.registration');
    if (!!externalPayment && !!externalPayment.type) {
      paid = `[${externalPayment.type.toLowerCase()}]`;
      updated_at = externalPayment.timestamp;
    }
  }
  return (
    <tr key={user.uid}>
      <th scope="row">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>{user.email}</Link>
      </th>
      <td>{user.profile && user.profile.first_name}</td>
      <td>{user.profile && user.profile.last_name}</td>
      <td>{updated_at && moment(updated_at).format("MMM D, Y")}</td>
      <td>{order.roomChoice}</td>
      <td>{paid}</td>
      <td>{formatMoney(calculateBalance(registration, event))}</td>
    </tr>
  );
};

const FullRegistrations = ({registrations, event}) => {
  let registrationItems = sortBy((registrations || [])
    .filter((reg) => isRegistered(reg.registration)),
    i => {
      //sort by date
      if (has(i.registration, 'account.payments')) {
        return i.registration.order.created_at;
      } else {
        let externalPayment = get(i.registration, 'external_payment.registration');
        if (!!externalPayment && !!externalPayment.type) {
          return externalPayment.timestamp;
        }
      }
    });

  return (
    <div className="mt-3">
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
    </div>
  );
}

export default FullRegistrations;

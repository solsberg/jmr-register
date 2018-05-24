import React from 'react';
import moment from 'moment';
import get from 'lodash/get';
import has from 'lodash/has';

const EarlyDepositRow = ({user, registration}) => {
  let updated_at;
  let status = get(registration, 'earlyDeposit.status');
  if (!!status) {
    updated_at = registration.earlyDeposit.updated_at;
  } else {
    let externalPayment = get(registration, 'external_payment.earlyDeposit');
    if (!!externalPayment && !!externalPayment.type) {
      status = `[${externalPayment.type.toLowerCase()}]`;
      updated_at = externalPayment.timestamp;
    }
  }
  return (
    <tr key={user.uid}>
      <th scope="row">{user.email}</th>
      <td>{user.profile && user.profile.first_name}</td>
      <td>{user.profile && user.profile.last_name}</td>
      <td>{updated_at && moment(updated_at).format("MMM D, Y")}</td>
      <td>{status}</td>
    </tr>
  );
};

const EarlyDepositRegistrations = ({registrations}) => {
  registrations = registrations || [];
  let earlyDeposits = registrations
    .filter((reg) => has(reg, 'registration.earlyDeposit') ||
      has(reg, 'registration.external_payment.earlyDeposit'))
    .sort((r1, r2) => {
      let email1 = r1.user.email.toUpperCase(),
          email2 = r2.user.email.toUpperCase();
      if (email1 < email2) {
        return -1;
      } else if (email1 > email2) {
        return 1;
      } else {
        return 0;
      }
    });

  return (
    <div className="mt-3">
      <h3 className="text-center">
        Pre-Registrations
      </h3>
      <div className="table-responsive-md">
        <table className="table table-striped table-sm">
          <thead>
            <tr>
              <th scope="col">Email</th>
              <th scope="col">First</th>
              <th scope="col">Last</th>
              <th scope="col">Signup Date</th>
              <th scope="col">Status</th>
            </tr>
          </thead>
          <tbody>
          { earlyDeposits.map(EarlyDepositRow) }
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EarlyDepositRegistrations;

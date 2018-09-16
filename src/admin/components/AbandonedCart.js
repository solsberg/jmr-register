import React from 'react';
import { Link } from 'react-router-dom';
import has from 'lodash/has';
import { isRegistered } from '../../lib/utils';

const RegistrationRow = ({user, registration}, event, fields, emailIdentity) => {
  return (
    <tr key={user.uid}>
      <th scope="row">
        {!!registration.cart ?
          <Link className="nav-link" to={`/admin/detail/${user.uid}`}>
            {user.email}
          </Link>
          :
          user.email}
      </th>
      <td>
        {user.profile && `${user.profile.first_name} ${user.profile.last_name}`}
      </td>
      <td>
        {(!!registration.earlyDeposit || has(registration, 'external_payment.earlyDeposit')) && "Yes"}
      </td>
    </tr>
  );
};

const AbandonedCart = ({registrations, event}) => {
  let registrationItems = (registrations || [])
    .filter(reg => !isRegistered(reg.registration));

  return (
    <div className="mt-3">
      <h3 className="text-center">
        Abandoned Registrations
      </h3>
      <table className="table table-striped table-sm report-table">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Pre-Registered</th>
          </tr>
        </thead>
        <tbody>
        { registrationItems.map(r => RegistrationRow(r, event)) }
        </tbody>
      </table>
      <span className="font-italic">Total: {registrationItems.length}</span>
    </div>
  );
}

export default AbandonedCart;

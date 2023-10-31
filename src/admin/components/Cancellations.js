import React from 'react';
import { Link } from 'react-router-dom';
import has from 'lodash/has';

const RegistrationRow = ({user, registration}, event, fields, emailIdentity) => {
  return (
    <tr key={user.uid}>
      <th scope="row">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>
          {user.email}
        </Link>
      </th>
      <td>
        {user.profile && `${user.profile.first_name} ${user.profile.last_name}`}
      </td>
    </tr>
  );
};

const Cancellations = ({registrations, event}) => {
  let registrationItems = (registrations || [])
    .filter(reg => has(reg.registration, 'order.cancelled'));

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

export default Cancellations;

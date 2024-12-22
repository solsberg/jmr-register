import React from 'react';
import { Link } from 'react-router';
import has from 'lodash/has';
import moment from 'moment';
import { isRegistered } from '../../lib/utils';
import { sortBy } from 'lodash';

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
      <td>
        {moment(registration.cart.joinedWaitlist).format("MMM D, Y")}
      </td>
      <td>
        {!!registration.cart.allowWaitlist && "Yes"}
      </td>
    </tr>
  );
};

const WaitList = ({registrations, event}) => {
  let registrationItems = (registrations || [])
    .filter(reg => !isRegistered(reg.registration))
    .filter(reg => has(reg, 'registration.cart.joinedWaitlist'));
  registrationItems = sortBy(registrationItems, r => r.registration.cart.joinedWaitlist);

  return (
    <div className="mt-3">
      <h3 className="text-center">
        Wait List
      </h3>
      <table className="table table-striped table-sm report-table">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Joined Wait List</th>
            <th>Offered Place</th>
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

export default WaitList;

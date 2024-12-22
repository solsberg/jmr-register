import React from 'react';
import { Link } from 'react-router';
import sortBy from 'lodash/sortBy';
import groupBy from 'lodash/groupBy';
import reverse from 'lodash/reverse';
import toPairs from 'lodash/toPairs';

import { isRegistered } from '../../lib/utils';

const renderRegistrationLocation = ({user}) => {
  let phone_numbers = [user.profile.phone, user.profile.phone_2]
    .filter(p => !!p)
    .map(p => p.trim())
    .join(", ");
  return (
    <tr key={user.uid}>
      <th scope="row">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>
          {`${user.profile.first_name} ${user.profile.last_name}            `}
        </Link>
      </th>
      <td>{user.email}</td>
      <td>{phone_numbers}</td>
      <td>{user.profile.city}</td>
    </tr>
  );
};

const renderStates = (state, registrations) => {
  let registrationsForState = sortBy(registrations
    .filter(r => r.user.profile.state === state),
    r => [r.user.profile.city, r.user.profile.last_name, r.user.profile.first_name]);
  return <tbody key={state}>
    <tr>
    <th colSpan="4">{state}</th>
    </tr>
    { registrationsForState.map(r => renderRegistrationLocation(r)) }
  </tbody>;
};

const LocationReport = ({registrations}) => {
  let registrationItems = (registrations || [])
    .filter((reg) => isRegistered(reg.registration));

  let registrationItemsByState = groupBy(registrationItems, "user.profile.state");
  let states = reverse(sortBy(toPairs(registrationItemsByState)
      .map(([state, items]) => ({state, count: items.length})),
      "count")
    .map(i => i.state));

  return (
    <div className="mt-3">
      <h3 className="text-center">
        Attendees by Location
      </h3>
      <table className="table table-striped table-sm report-table">
        <thead>
          <tr>
            <th></th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
          </tr>
        </thead>
        {states.map(s => renderStates(s, registrationItems))}
      </table>
    </div>
  );
}

export default LocationReport;

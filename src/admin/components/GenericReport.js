import React from 'react';
import { Link } from 'react-router';
import sortBy from 'lodash/sortBy';
import { getRegistrationTime, isRegistered } from '../../lib/utils';

const RegistrationRow = ({user, registration}, event, fields) => {
  // let order = {...registration.order, ...registration.cart};

  return (
    <tr key={user.uid}>
      <th scope="row">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>
          {`${user.profile.first_name} ${user.profile.last_name}            `}
        </Link>
      </th>
      {!!fields && fields.map((f, idx) => <td key={idx}>{f.value({user, registration})}</td>)}
    </tr>
  );
};

const GenericReport = ({registrations, event, filter, title, fields}) => {
  let registrationItems = sortBy((registrations || [])
    .filter((reg) => isRegistered(reg.registration) && (!filter || filter(reg))),
    i => getRegistrationTime(i.registration)); //sort by date

  return (
    <div className="mt-3">
      <h3 className="text-center">
        {title}
      </h3>
      <table className="table table-striped table-sm report-table">
        <thead>
          <tr>
            <th></th>
            {!!fields && fields.map((f, idx) => <th key={idx}>{f.title}</th>)}
          </tr>
        </thead>
        <tbody>
        { registrationItems.map(r => RegistrationRow(r, event, fields)) }
        </tbody>
      </table>
      {!!filter && <span className="font-italic">Total: {registrationItems.length}</span>}
    </div>
  );
}

export default GenericReport;

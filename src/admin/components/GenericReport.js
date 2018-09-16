import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import get from 'lodash/get';
import has from 'lodash/has';
import sortBy from 'lodash/sortBy';
import { formatMoney, calculateBalance } from '../../lib/utils';

const RegistrationRow = ({user, registration}, event) => {
  let order = {...registration.order, ...registration.cart};

  return (
    <tr key={user.uid}>
      <th scope="row">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>
          {`${user.profile.first_name} ${user.profile.last_name}            `}
        </Link>
      </th>
    </tr>
  );
};

const GenericReport = ({registrations, event, filter, title}) => {
  let registrationItems = sortBy((registrations || [])
    .filter((reg) => (has(reg, 'registration.account.payments') ||
      has(reg, 'registration.external_payment.registration')) &&
      (!filter || filter(reg))
    ),
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
        {title}
      </h3>
      <table className="table table-striped table-sm report-table">
        <thead>
          <tr>
            <th></th>
          </tr>
        </thead>
        <tbody>
        { registrationItems.map(r => RegistrationRow(r, event)) }
        </tbody>
      </table>
      {!!filter && <span className="font-italic">Total: {registrationItems.length}</span>}
    </div>
  );
}

export default GenericReport;

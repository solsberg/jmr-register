import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import get from 'lodash/get';
import has from 'lodash/has';
import sortBy from 'lodash/sortBy';
import { formatMoney, calculateBalance } from '../../lib/utils';

const renderYML = ({user, registration}, event) => {
  let data = registration.scholarship;
  return (
    <div className="my-2">
      <p className="bg-light">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>{`${user.profile.first_name} ${user.profile.last_name} - ${user.email}`}</Link>
      </p>
      <div className="ml-4">
        <p>Briefly describe your personal journey as a young Jewish man?</p>
        <p className="font-weight-bold">{data.journey}</p>
        <p>In what ways would you like to expand your relationships with other Jewish men?</p>
        <p className="font-weight-bold">{data.relationships}</p>
        <p>What might you hope to gain from attending JMR 27 this year?</p>
        <p className="font-weight-bold">{data.gain}</p>
      </div>
    </div>
  );
};

const renderAid = ({user, registration}, event) => {
  let data = registration.scholarship;
  return (
    <div className="my-2">
      <p className="bg-light">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>{`${user.profile.first_name} ${user.profile.last_name} - ${user.email}`}</Link>
      </p>
      <div className="ml-4">
        <p className="font-weight-bold">How much can you afford to pay?</p>
        <p>{data.contribution}</p>
        <p className="font-weight-bold">Statement of Need</p>
        <p>{data.statement}</p>
        <p className="font-weight-bold">Other Support Available?</p>
        <p>{data.support}</p>
      </div>
    </div>
  );
};

const ScholarshipApplications = ({registrations, event}) => {
  let ymlItems = (registrations || [])
    .filter((reg) => has(reg, 'registration.scholarship'))
    .filter((reg) => reg.registration.scholarship.type === 'yml');

  let aidItems = (registrations || [])
    .filter((reg) => has(reg, 'registration.scholarship'))
    .filter((reg) => reg.registration.scholarship.type === 'aid');

  return (
    <div className="mt-3">
      <h3 className="text-center">
        Scholarship Applications
      </h3>
      <h4>YML</h4>
      {ymlItems.length === 0 &&
        <p className="font-italic">None</p>
      }
      { ymlItems.map(r => renderYML(r, event)) }
      <h4>Financial Aid</h4>
      {aidItems.length === 0 &&
        <p className="font-italic">None</p>
      }
      { aidItems.map(r => renderAid(r, event)) }
    </div>
  );
}

export default ScholarshipApplications;

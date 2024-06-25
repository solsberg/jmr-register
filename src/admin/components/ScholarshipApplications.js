import React from 'react';
import { Link } from 'react-router-dom';
import has from 'lodash/has';
import { sortBy } from 'lodash';
import moment from 'moment';

const renderYML = ({user, registration}, event) => {
  let data = registration.scholarship;
  return (
    <div className="my-2">
      <p className="bg-light">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>{`${user.profile.first_name} ${user.profile.last_name} - ${user.email}`}</Link>
      </p>
      <div className="ml-4">
        <p className="font-italic">Received on {moment(data.created_at).format("MMM D, Y")}</p>
        <p>In what ways would you like to expand your relationships with other Jewish men?</p>
        <p className="font-weight-bold">{data.relationships}</p>
        <p>What might you hope to gain from attending {event.title}?</p>
        <p className="font-weight-bold">{data.gain}</p>
        <p>How did you learn about the Jewish Men’s Retreat Fellowship Program for Young Men?</p>
        <p className="font-weight-bold">{data.learn}</p>
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
        <p className="font-italic">Received on {moment(data.created_at).format("MMM D, Y")}</p>
        <p className="font-weight-bold">Statement of Need</p>
        <p>{data.statement}</p>
        <p className="font-weight-bold">How much can you afford to pay?</p>
        <p>{data.contribution}</p>
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
  ymlItems = sortBy(ymlItems, reg => reg.registration.scholarship.created_at);

  let aidItems = (registrations || [])
    .filter((reg) => has(reg, 'registration.scholarship'))
    .filter((reg) => reg.registration.scholarship.type === 'aid');
  aidItems = sortBy(aidItems, reg => reg.registration.scholarship.created_at);

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

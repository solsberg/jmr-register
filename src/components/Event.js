import React from 'react';
import EarlyDepositContainer from '../containers/EarlyDepositContainer';

const Event = ({event}) => (
  <div className="mt-3">
    <h3 className="text-center">
      {event.title} Registration
    </h3>
    <EarlyDepositContainer event={event} />
  </div>
);

export default Event;

import React from 'react';
import EarlyDepositContainer from '../containers/EarlyDepositContainer';

const Event = ({event}) => (
  <div>
    <h3>
      {event.title}
    </h3>
    <EarlyDepositContainer event={event} />
  </div>
);

export default Event;

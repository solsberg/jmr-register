import React from 'react';
import EarlyDepositContainer from '../containers/EarlyDepositContainer';
import './Event.css'

const Event = ({event}) => (
  <div className="event">
    <h3 className="title">
      {event.title} Registration
    </h3>
    <EarlyDepositContainer event={event} />
  </div>
);

export default Event;

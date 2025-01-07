import React, { Component } from 'react';
import { Route, Navigate, Routes } from 'react-router';
import EarlyDepositContainer from '../containers/EarlyDepositContainer';
import RoomChoiceContainer from '../containers/RoomChoiceContainer';
import ProfileContainer from '../containers/ProfileContainer';
import PaymentContainer from '../containers/PaymentContainer';
import ScholarshipFormContainer from '../containers/ScholarshipFormContainer';
import CheckoutContainer from '../containers/CheckoutContainer';

class Event extends Component {
  componentDidMount() {
    const {event, currentUser, selectCurrentEvent, loadRegistration, loadEvent} = this.props;

    selectCurrentEvent(event);
    if (!!currentUser) {
      loadRegistration(event, currentUser);
    } else {
      loadEvent(event);
    }
  }

  render() {
    const { event, currentUser } = this.props;

    let routes;
    if (event.status !== 'EARLY') {
      routes = [
        <Route exact path={""} key="rc" element={<RoomChoiceContainer currentUser={currentUser} event={event} />} />
      ];
      if (!!currentUser) {
        routes = routes.concat([
          <Route path={`profile`} key="pr" element={<ProfileContainer currentUser={currentUser} event={event} />} />,
          <Route path={`payment`} key="py" element={<PaymentContainer currentUser={currentUser} event={event} />} />,
          <Route path={`checkout`} key="ck" element={<CheckoutContainer currentUser={currentUser} event={event} />} />,
          <Route path={`scholarship`} key="sc" element={<ScholarshipFormContainer currentUser={currentUser} event={event} />} />
        ]);
      }
    } else {
      routes = [
        <Route exact path={`/${event.eventId}`} element={<EarlyDepositContainer event={event} />} />
      ];
    }

    return (
      <div className="mt-3">
        <Routes>
          {routes}
          <Route path={"*"} element={<Navigate to={`/${event.eventId}`}/>}/>}
        </Routes>
        <div className="my-3 text-center font-italic">
          <p className="mb-0">
            Questions? For questions about registration, financial aid, scholarships, etc., please contact <a href="mailto:registration@menschwork.org">registration@menschwork.org</a>.<br/>
            For questions about the retreat itself, please contact <a href="mailto:jmr@menschwork.org">jmr@menschwork.org</a>.
          </p>
          <p>
            <a href="https://www.menschwork.org">https://www.menschwork.org</a>
          </p>
        </div>
      </div>
    );
  }
}

export default Event;

import React, { useEffect, useContext } from 'react';
import { Route, Navigate, Routes } from 'react-router';
import get from 'lodash/get';
import EarlyDepositContainer from '../containers/EarlyDepositContainer';
import RoomChoiceContainer from '../containers/RoomChoiceContainer';
import ProfileContainer from '../containers/ProfileContainer';
import PaymentContainer from '../containers/PaymentContainer';
import ScholarshipFormContainer from '../containers/ScholarshipFormContainer';
import Checkout from '../components/Checkout';
import { useEvents } from '../providers/EventsProvider';
import { useApplication } from '../providers/ApplicationProvider';
import { AuthContext } from '../contexts/AuthContext';
import { fetchRoomUpgradeStatus  } from '../lib/api';
import { log } from '../lib/utils';

const Event = ({
  event,
  loadRegistration,
}) => {
  const { setRoomUpgrade } = useApplication();
  const { setCurrentEvent } = useEvents();
  const { currentUser } = useContext(AuthContext);

  useEffect(() => {
    setCurrentEvent(event);
    if (!!currentUser) {
      loadRegistration(event, currentUser);
    } else if (event && get(event, 'roomUpgrade.enabled')) {
      return fetchRoomUpgradeStatus(event.eventId)
      .then(roomUpgrade => setRoomUpgrade(event.eventId, roomUpgrade))
      .catch(err => {
        log("error fetching room upgrade status", err);
      });
    }
  }, [ event, currentUser, setCurrentEvent, loadRegistration, setRoomUpgrade]);

  let routes;
  if (event.status !== 'EARLY') {
    routes = [
      <Route exact path={""} key="rc" element={<RoomChoiceContainer currentUser={currentUser} event={event} />} />
    ];
    if (!!currentUser) {
      routes = routes.concat([
        <Route path={`profile`} key="pr" element={<ProfileContainer currentUser={currentUser} event={event} />} />,
        <Route path={`payment`} key="py" element={<PaymentContainer currentUser={currentUser} event={event} />} />,
        <Route path={`checkout`} key="ck" element={<Checkout />} />,
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
};

export default Event;

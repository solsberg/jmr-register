import React, { useEffect } from 'react';
import { Route, Navigate, Routes } from 'react-router';
import get from 'lodash/get';
import EarlyDeposit from '../components/EarlyDeposit';
import RoomChoice from '../components/RoomChoice';
import Profile from '../components/Profile';
import Payment from '../components/Payment';
import ScholarshipForm from '../components/ScholarshipForm';
import Checkout from '../components/Checkout';
import CheckoutCompleted from './CheckoutCompleted';
import { useEvents } from '../providers/EventsProvider';
import { useApplication } from '../providers/ApplicationProvider';
import { useAuth } from '../providers/AuthProvider';
import { useRegistration } from '../providers/RegistrationProvider';
import { fetchRoomUpgradeStatus  } from '../lib/api';
import { log } from '../lib/utils';

const Event = ({ event }) => {
  const { setRoomUpgrade } = useApplication();
  const { currentUser } = useAuth();
  const { setCurrentEvent } = useEvents();
  const { loadRegistration } = useRegistration();

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
      <Route exact path={""} key="rc" element={<RoomChoice currentUser={currentUser} event={event} />} />
    ];
    if (!!currentUser) {
      routes = routes.concat([
        <Route path={`profile`} key="pr" element={<Profile currentUser={currentUser} event={event} />} />,
        <Route path={`payment`} key="py" element={<Payment currentUser={currentUser} event={event} />} />,
        <Route path={`checkout`} key="ck" element={<Checkout />} />,
        <Route path={`completed`} key="cp" element={<CheckoutCompleted currentUser={currentUser} event={event} />} />,
        <Route path={`scholarship`} key="sc" element={<ScholarshipForm currentUser={currentUser} event={event} />} />
      ]);
    }
  } else {
    routes = [
      <Route exact path={`/${event.eventId}`} element={<EarlyDeposit event={event} />} />
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
          Questions? For questions about registration please contact <a href="mailto:registration@menschwork.org">registration@menschwork.org</a>.<br/>
          For questions about financial aid & scholarships please contact <a href="mailto:finaid@menschwork.org">finaid@menschwork.org</a>.<br/>
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

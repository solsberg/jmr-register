import React, { useState } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router';

import { useEvents } from '../providers/EventsProvider';
import { useApplication } from '../providers/ApplicationProvider';
import { useAuth } from '../providers/AuthProvider';
import AdminProvider from '../admin/providers/AdminProvider';
import Loading from './Loading';
import Event from '../components/Event';
import SignIn from '../components/SignIn';
import Admin from '../admin/components/Admin';
import Support from './Support';
import CheckoutCallback from './CheckoutCallback';
import { LOADING } from '../constants';
import './Application.css';

const Application = () => {
  const [signingIn, setSigningIn] = useState(false);
  const { errorMessage, status: applicationState } = useApplication();
  const { currentUser, signOut } = useAuth();
  const { activeEvents } = useEvents();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignIn = () => {
    setSigningIn(true);
  }

  const handleSignOut = () => {
    setSigningIn(false);
    signOut();
    navigate("/");
  }

  let content;
  if (signingIn && !currentUser) {
    content = <SignIn />;
  } else if (applicationState === LOADING) {
    content = <Loading spinnerScale={1.7} spinnerColor="888" />;
  } else {
    const eventRoutes = activeEvents.map(event =>
      <Route key={event.eventId} path={`/${event.eventId}/*`}
        element={<Event event={event} />}
      />
    );
    const defaultEventName = activeEvents.length > 0 ? activeEvents[0].eventId : null;

    content = (
        <Routes>
          {eventRoutes}
          <Route path="/support" element={<Support currentUser={currentUser} />} />
          {currentUser && currentUser.admin &&
            <Route path="/admin/:name?/:param?" element={<AdminProvider><Admin /></AdminProvider>} />
          }
          <Route path="/callback" element={<CheckoutCallback />} />
          <Route path="*" element={<Navigate to={`/${defaultEventName ?? ''}`}/>}/>
        </Routes>
    );
  }

  return (
    <div className="container">
      <nav className="navbar navbar-expand-lg navbar-light">
        <img src={process.env.PUBLIC_URL + '/images/jmrlogo.png'} width="90" height="90" alt=""/>
        <span className="navbar-brand font-weight-bold ml-3">Menschwork Registration</span>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/support">Help</Link>
            </li>
            {currentUser && currentUser.admin &&
              <li className="nav-item">
                <Link className="nav-link" to="/admin">Admin</Link>
              </li>
            }
          </ul>
          {!currentUser && <button id="signin-btn" className="btn btn-secondary btn-sm" onClick={handleSignIn}>Sign In</button>}
          {!!currentUser && <button id="signout-btn" className="btn btn-secondary btn-sm" onClick={handleSignOut}>Sign Out</button>}
        </div>
      </nav>
      { errorMessage &&
        <p className="error">{errorMessage}</p>
      }
      {content}
      {activeEvents.length === 0 && applicationState !== LOADING &&
          !location.pathname.startsWith('/admin') &&
        <div className="alert alert-info mt-4 offset-md-2 col-md-8" role="alert">
          <p>
            We are not open for registration currently.
            Please visit <a href='http://menschwork.org'>menschwork.org</a> for more information.
          </p>
        </div>}
    </div>
  );
}

export default Application;

import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, Link, Navigate, useNavigate, useLocation } from 'react-router';
import get from 'lodash/get';

import { ErrorContext } from '../contexts/ErrorContext';
import { AuthContext } from '../contexts/AuthContext';
import Loading from './Loading';
import EventContainer from '../containers/EventContainer';
import SignIn from '../components/SignIn';
import AdminContainer from '../admin/containers/AdminContainer';
import Support from './Support';
import { LOADING } from '../constants';
import './Application.css';

const Application = ({
      applicationState,
      events,
      reduxError,
    }) => {
  const [signingIn, setSigningIn] = useState(false);
  const { errorMessage, setApplicationError } = useContext(ErrorContext);
  const { currentUser, signOut } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!!reduxError) {
      setApplicationError(`error from redux: ${reduxError}`, reduxError);
    }
  }, [reduxError, setApplicationError]);

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
    const eventRoutes = events.map(event =>
      // <Route key={event.eventId} path={`/${event.eventId}`} render={({routeProps}) =>
      //   <EventContainer {...routeProps} event={event} />
      // }/>
      <Route key={event.eventId} path={`/${event.eventId}/*`}
        element={<EventContainer event={event} />}
      />
    );
    const defaultEventName = events.length > 0 ? events[0].eventId : null;

    content = (
        <Routes>
          {eventRoutes}
          <Route path="/support" element={<Support currentUser={currentUser} />} />
          {currentUser && currentUser.admin &&
            <Route path="/admin/:name?/:param?" element={<AdminContainer />} />
          }
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
      {events.length === 0 && applicationState !== LOADING &&
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

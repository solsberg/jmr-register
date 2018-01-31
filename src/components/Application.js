import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import Loading from './Loading';
import Event from './Event';
import { LOADING } from '../constants';
import './Application.css';

class Application extends Component {
  render() {
    const { applicationState, error, events, currentUser, onSignOut } = this.props;
    let content;
    if (applicationState === LOADING) {
      content = <Loading spinnerScale={1.7} spinnerColor="888" />;
    }
    else {
      const eventRoutes = events.map(event =>
        <Route key={event.eventId} exact path={`/${event.eventId}`} render={({routeProps}) =>
          <Event {...routeProps} event={event} />
        }/>
      );
      const defaultEventName = events.length > 0 ? events[0].eventId : null;

      content = (
        <BrowserRouter>
          <Switch>
            {eventRoutes}
            {defaultEventName && <Route path="*" render={() => <Redirect to={`/${defaultEventName}`}/>}/>}
          </Switch>
        </BrowserRouter>
      );
    }

    return (
      <div className="container">
        <div className="banner">
          <img src={process.env.PUBLIC_URL + '/images/banner.jpg'} alt='Menschwork banner'/>
        </div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <span className="navbar-brand">JMR Registration</span>
          {currentUser && <button className="btn btn-secondary btn-sm ml-auto" onClick={onSignOut}>Sign Out</button>}
        </nav>
        <p>{error}</p>
        {content}
      </div>
    );
  }
}

export default Application;

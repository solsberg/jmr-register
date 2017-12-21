import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import Event from './Event';
import { LOADING } from '../constants';
import './Application.css';

class Application extends Component {
  render() {
    const { applicationState, error, events, currentUser, onSignOut } = this.props;

    if (applicationState === LOADING) {
      return <h4>'Loading...'</h4>;
    }

    const eventRoutes = events.map(event =>
      <Route key={event.eventId} exact path={`/${event.eventId}`} render={({routeProps}) =>
        <Event {...routeProps} event={event} />
      }/>
    );
    const defaultEventName = events.length > 0 ? events[0].eventId : null;

    return (
      <BrowserRouter>
        <div>
          <p>{error}</p>
          <h2>Home</h2>
          {currentUser && <button onClick={onSignOut}>Sign Out</button>}
          <Switch>
            {eventRoutes}
            {defaultEventName && <Route path="*" render={() => <Redirect to={`/${defaultEventName}`}/>}/>}
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default Application;

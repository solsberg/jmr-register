import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import Event from './Event';
import { LOADING } from '../constants';
import './Application.css';

class Application extends Component {
  render() {
    const { applicationState, error, events, currentUser, onSignOut } = this.props;
    let content;
    if (applicationState === LOADING) {
      content = (
        <div class="container">
          <h4>'Loading...'</h4>
        </div>);
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
          <div class="container">
            <p>{error}</p>
            {currentUser && <button onClick={onSignOut}>Sign Out</button>}
            <Switch>
              {eventRoutes}
              {defaultEventName && <Route path="*" render={() => <Redirect to={`/${defaultEventName}`}/>}/>}
            </Switch>
          </div>
        </BrowserRouter>
      );
    }

    return (
      <div>
        <div className="banner">
          <img src={process.env.PUBLIC_URL + '/images/banner.jpg'}/>
        </div>
        {content}
      </div>
    );
  }
}

export default Application;

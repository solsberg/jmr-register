import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import Event from './Event';
import { LOADING } from '../constants';
import './Application.css';

class Application extends Component {
  render() {
    const { applicationState, events } = this.props;

    if (applicationState === LOADING) {
      return <h4>'Loading...'</h4>;
    }

    const eventRoutes = events.map(event =>
      <Route key={event.eventId} exact path={`/${event.eventId}`} render={({routeProps}) =>
        <Event {...routeProps} event={event} />
      }/>
    );
    const defaultEventName = events[0].eventId;

    return (
      <BrowserRouter>
        <div>
          <h2>Home</h2>
          <Switch>
            {eventRoutes}
            <Route path="*" render={() => <Redirect to={`/${defaultEventName}`}/>}/>
          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default Application;

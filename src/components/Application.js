import React, { Component } from 'react';
import { BrowserRouter, Route, Redirect, Switch } from 'react-router-dom';

import Event from './Event';
import './Application.css';

class Application extends Component {
  render() {
    const { events } = this.props;

    const eventRoutes = events.map(event =>
      <Route exact path={`/${event.eventId}`} render={({routeProps}) =>
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

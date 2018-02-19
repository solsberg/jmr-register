import React, { Component } from 'react';
import { Route, Redirect, Switch, Link } from 'react-router-dom';

import Loading from './Loading';
import Event from './Event';
import Support from './Support';
import { LOADING } from '../constants';
import './Application.css';

class Application extends Component {

  handleSignOut = () => {
    const { onSignOut, history } = this.props;
    onSignOut();
    history.replace("/");
  }

  render() {
    const { applicationState, error, events, currentUser } = this.props;
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
          <Switch>
            {eventRoutes}
            <Route path="/support" component={Support} />
            {defaultEventName && <Route path="*" render={() => <Redirect to={`/${defaultEventName}`}/>}/>}
          </Switch>
      );
    }

    return (
      <div className="container">
        <div className="banner">
          <img className="img-fluid" src={process.env.PUBLIC_URL + '/images/banner.jpg'} alt='Menschwork banner'/>
        </div>
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
          <span className="navbar-brand">Menschwork Registration</span>
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/support">Help</Link>
            </li>
          </ul>
          {currentUser && <button id="signout-btn" className="btn btn-secondary btn-sm" onClick={this.handleSignOut}>Sign Out</button>}
        </nav>
        { error &&
          <p className="error">{error}</p>
        }
        {content}
      </div>
    );
  }
}

export default Application;

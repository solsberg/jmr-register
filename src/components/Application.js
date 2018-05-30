import React, { Component } from 'react';
import { Route, Redirect, Switch, Link } from 'react-router-dom';

import Loading from './Loading';
import EventContainer from '../containers/EventContainer';
import SignInContainer from '../containers/SignInContainer';
import AdminContainer from '../admin/containers/AdminContainer';
import Support from './Support';
import { LOADING } from '../constants';
import './Application.css';

class Application extends Component {
  constructor(props) {
    super(props);

    this.state = {
      signingIn: false
    };
  }

  handleSignIn = () => {
    this.setState({
      signingIn: true
    });
  }

  handleSignOut = () => {
    const { onSignOut, history } = this.props;
    this.setState({
      signingIn: false
    });
    onSignOut();
    history.replace("/");
  }

  render() {
    const { applicationState, error, events, currentUser, history } = this.props;
    const { signingIn } = this.state;

    let content;
    if (signingIn && !this.props.currentUser) {
      content = <SignInContainer />;
    } else if (applicationState === LOADING) {
      content = <Loading spinnerScale={1.7} spinnerColor="888" />;
    } else {
      const eventRoutes = events.map(event =>
        <Route key={event.eventId} path={`/${event.eventId}`} render={({routeProps}) =>
          <EventContainer {...routeProps} event={event} />
        }/>
      );
      const defaultEventName = events.length > 0 ? events[0].eventId : null;

      content = (
          <Switch>
            {eventRoutes}
            <Route path="/support" render={() => <Support currentUser={currentUser} history={history} />} />
            {currentUser && currentUser.admin &&
              <Route path="/admin/:name?/:param?" component={AdminContainer} />
            }
            {defaultEventName && <Route path="*" render={() => <Redirect to={`/${defaultEventName}`}/>}/>}
            {!defaultEventName && <Route path="*" render={() => <Redirect to={'/'}/>}/>}
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
            {!currentUser && <button id="signin-btn" className="btn btn-secondary btn-sm" onClick={this.handleSignIn}>Sign In</button>}
            {!!currentUser && <button id="signout-btn" className="btn btn-secondary btn-sm" onClick={this.handleSignOut}>Sign Out</button>}
          </div>
        </nav>
        { error &&
          <p className="error">{error}</p>
        }
        {content}
        {events.length === 0 && applicationState !== LOADING &&
          <div className="alert alert-info mt-4 offset-md-2 col-md-8" role="alert">
            <p>
              We are not open for registration currently.
              Please visit <a href='http://menschwork.org'>menschwork.org</a> for more information.
            </p>
          </div>}
      </div>
    );
  }
}

export default Application;

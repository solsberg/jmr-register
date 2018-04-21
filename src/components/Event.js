import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import EarlyDepositContainer from '../containers/EarlyDepositContainer';
import ProfileContainer from '../containers/ProfileContainer';

class Event extends Component {
  componentDidMount() {
    const {event, currentUser, setCurrentEvent, loadRegistration} = this.props;

    setCurrentEvent(event);
    if (!!currentUser) {
      loadRegistration(event, currentUser);
    }
  }

  render() {
    const { event, currentUser, match } = this.props;

    return (
      <div className="mt-3">
        <h3 className="text-center">
          {event.title} Registration
        </h3>

        <Switch>
          <Route exact path={match.url} render={() => <EarlyDepositContainer event={event} />} />
          {<Route path={match.url + "/profile"} render={() => <ProfileContainer currentUser={currentUser} />} />}
          <Route path={match.url + "/*"} render={() => <Redirect to={match.url}/>}/>}
        </Switch>
      </div>
    );
  }
}

export default Event;

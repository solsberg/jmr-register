import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import EarlyDepositContainer from '../containers/EarlyDepositContainer';
import RoomChoiceContainer from '../containers/RoomChoiceContainer';
import ProfileContainer from '../containers/ProfileContainer';
import PaymentContainer from '../containers/PaymentContainer';

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

    let routes;
    if (event.status === 'FULL') {
      routes = [
        <Route exact path={match.url} key="rc" render={() => <RoomChoiceContainer currentUser={currentUser} event={event} />} />
      ];
      if (!!currentUser) {
        routes = routes.concat([
          <Route path={match.url + "/profile"} key="pr" render={() => <ProfileContainer currentUser={currentUser} event={event} />} />,
          <Route path={match.url + "/payment"} key="py" render={() => <PaymentContainer currentUser={currentUser} event={event} />} />
        ]);
      }
    } else {
      routes = [
        <Route exact path={match.url} render={() => <EarlyDepositContainer event={event} />} />
      ];
    }

    return (
      <div className="mt-3">
        <h3 className="text-center">
          {event.title} Registration
        </h3>

        <Switch>
          {routes}
          <Route path={match.url + "/*"} render={() => <Redirect to={match.url}/>}/>}
        </Switch>
        <div className="my-3 text-center font-italic">
          Questions? Please send an email to <a href={`mailto:${event.eventId}@menschwork.org`}>{event.eventId}@menschwork.org</a>
        </div>
      </div>
    );
  }
}

export default Event;

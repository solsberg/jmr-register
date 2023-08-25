import React, { Component } from 'react';
import { Route, Redirect, Switch } from 'react-router-dom';
import EarlyDepositContainer from '../containers/EarlyDepositContainer';
import RoomChoiceContainer from '../containers/RoomChoiceContainer';
import ProfileContainer from '../containers/ProfileContainer';
import PaymentContainer from '../containers/PaymentContainer';
import ScholarshipFormContainer from '../containers/ScholarshipFormContainer';

class Event extends Component {
  componentDidMount() {
    const {event, currentUser, selectCurrentEvent, loadRegistration, loadEvent} = this.props;

    selectCurrentEvent(event);
    if (!!currentUser) {
      loadRegistration(event, currentUser);
    } else {
      loadEvent(event);
    }
  }

  render() {
    const { event, currentUser, match } = this.props;

    let routes;
    if (event.status !== 'EARLY') {
      routes = [
        <Route exact path={match.url} key="rc" render={() => <RoomChoiceContainer currentUser={currentUser} event={event} />} />
      ];
      if (!!currentUser) {
        routes = routes.concat([
          <Route path={match.url + "/profile"} key="pr" render={() => <ProfileContainer currentUser={currentUser} event={event} />} />,
          <Route path={match.url + "/payment"} key="py" render={() => <PaymentContainer currentUser={currentUser} event={event} />} />,
          <Route path={match.url + "/scholarship"} key="sc" render={() => <ScholarshipFormContainer currentUser={currentUser} event={event} />} />
        ]);
      }
    } else {
      routes = [
        <Route exact path={match.url} render={() => <EarlyDepositContainer event={event} />} />
      ];
    }

    return (
      <div className="mt-3">
        <Switch>
          {routes}
          <Route path={match.url + "/*"} render={() => <Redirect to={match.url}/>}/>}
        </Switch>
        <div className="my-3 text-center font-italic">
          <p className="mb-0">
            Questions? For questions about registration, financial aid, scholarships, etc., please contact <a href="mailto:registration@menschwork.org">registration@menschwork.org</a>.<br/>
            For questions about the retreat itself, please contact <a href="mailto:jmr@menschwork.org">jmr@menschwork.org</a>.
          </p>
          <p>
            <a href="https://www.menschwork.org">https://www.menschwork.org</a>
          </p>
        </div>
      </div>
    );
  }
}

export default Event;

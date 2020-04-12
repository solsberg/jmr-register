import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Event from '../components/Event';
import { selectCurrentEvent } from '../actions/application';
import { loadRegistration } from '../actions/registration';
import { loadEvent } from '../actions/events';
import { AuthContext } from '../contexts/AuthContext';

const EventContainer = (props) => {
  const { currentUser } = useContext(AuthContext);
  return (
    <Event { ...props } currentUser={currentUser} />
  );
};

const mapStateToProps = ({ auth }, { match }) => ({
  match
});

const mapDispatchToProps = (dispatch) => ({
  selectCurrentEvent(event) {
    dispatch(selectCurrentEvent(event));
  },
  loadRegistration(event, user) {
    dispatch(loadRegistration(event, user));
  },
  loadEvent(event) {
    dispatch(loadEvent(event));
  }
});

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(EventContainer));

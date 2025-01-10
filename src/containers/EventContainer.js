import React, { useContext } from 'react';
import { connect } from 'react-redux';
import Event from '../components/Event';
import { loadRegistration } from '../actions/registration';
import { loadEvent } from '../actions/events';
import { AuthContext } from '../contexts/AuthContext';

const EventContainer = (props) => {
  const { currentUser } = useContext(AuthContext);
  return (
    <Event { ...props } currentUser={currentUser} />
  );
};

const mapStateToProps = ({ auth }) => ({
});

const mapDispatchToProps = (dispatch) => ({
  loadRegistration(event, user) {
    dispatch(loadRegistration(event, user));
  },
  loadEvent(event) {
    dispatch(loadEvent(event));
  }
});

export default connect(mapStateToProps, mapDispatchToProps)(EventContainer);

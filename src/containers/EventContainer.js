import React from 'react';
import { connect } from 'react-redux';
import Event from '../components/Event';
import { loadRegistration } from '../actions/registration';

const mapStateToProps = ({ auth }) => ({
});

const mapDispatchToProps = (dispatch) => ({
  loadRegistration(event, user) {
    dispatch(loadRegistration(event, user));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Event);

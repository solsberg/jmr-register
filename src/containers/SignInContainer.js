import React from 'react';
import { connect } from 'react-redux';
import SignIn from '../components/SignIn';

const mapStateToProps = ({ application }) => ({
  hasApplicationError: !!application.error
});

export default connect(mapStateToProps)(SignIn);

import React, { useContext } from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Admin from '../components/Admin';
import { loadAdminData, reloadRegistration } from '../actions/admin';
import { AuthContext } from '../../contexts/AuthContext';

const AdminContainer = (props) => {
  const { currentUser } = useContext(AuthContext);
  return (
    <Admin { ...props } currentUser={currentUser} />
  );
};

const mapStateToProps = ({ auth, events, admin }, { match, history }) => {
  return {
    events: events.filter(e => !e.type),
    data: admin.data,
    match,
    history
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    loadAdminData(event) { dispatch(loadAdminData(event)); },
    reloadRegistration(event, user) { dispatch(reloadRegistration(event, user)); }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AdminContainer));

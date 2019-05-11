import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Admin from '../components/Admin';
import { loadAdminData, reloadRegistration } from '../actions/admin';


const mapStateToProps = ({ auth, events, admin }, { match, history }) => {
  return {
    currentUser: auth.currentUser,
    events,
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

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Admin));

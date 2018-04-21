import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Application from '../components/Application';
import { signOut } from '../actions/auth';


const mapStateToProps = ({ application, auth, events }, { history }) => {
  return {
    applicationState: application.state,
    error: application.error,
    currentUser: auth.currentUser,
    currentEvent: application.currentEvent,
    events,
    history
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSignOut() { dispatch(signOut()); }
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Application));

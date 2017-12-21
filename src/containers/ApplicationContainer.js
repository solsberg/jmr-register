import { connect } from 'react-redux';
import Application from '../components/Application';
import { signOut } from '../actions/auth';


const mapStateToProps = ({ application, auth, events }) => {
  return {
    applicationState: application.state,
    error: application.error,
    currentUser: auth.currentUser,
    events
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSignOut() { dispatch(signOut()); }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Application);

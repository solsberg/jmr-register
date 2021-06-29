import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Application from '../components/Application';

const mapStateToProps = ({ application, auth, events }, { history }) => {
  return {
    applicationState: application.state,
    reduxError: application.error,
    events: events.filter(e => e.status !== 'CLOSED'),
    history
  };
};

export default withRouter(connect(mapStateToProps)(Application));

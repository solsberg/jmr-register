import { connect } from 'react-redux';
import Application from '../components/Application';

const mapStateToProps = ({ application, events }) => {
  return {
    applicationState: application.state,
    reduxError: application.error,
    events: events.filter(e => e.status !== 'CLOSED'),
  };
};

export default connect(mapStateToProps)(Application);

import { connect } from 'react-redux';
import Application from '../components/Application';


const mapStateToProps = ({ application, events }) => {
  return {
    applicationState: application.state,
    error: application.error,
    events
  };
};

export default connect(mapStateToProps)(Application);

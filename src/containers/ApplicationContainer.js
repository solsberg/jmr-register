import { connect } from 'react-redux';
import Application from '../components/Application';

const mapStateToProps = ({ application }) => {
  return {
    applicationState: application.state,
    reduxError: application.error,
  };
};

export default connect(mapStateToProps)(Application);

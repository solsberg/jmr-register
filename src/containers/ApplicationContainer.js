import { connect } from 'react-redux';
import Application from '../components/Application';

const mapStateToProps = ({ application }) => {
  return {
    reduxError: application.error,
  };
};

export default connect(mapStateToProps)(Application);

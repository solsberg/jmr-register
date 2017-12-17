import { connect } from 'react-redux';
import Application from '../components/Application';


const mapStateToProps = ({ events }) => {
  return { events };
};

export default connect(mapStateToProps)(Application);

import { connect } from 'react-redux';
import EarlyDeposit from '../components/EarlyDeposit';


const mapStateToProps = ({ auth }) => {
  return {
    currentUser: auth.currentUser
  };
};

export default connect(mapStateToProps)(EarlyDeposit);

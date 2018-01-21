import { connect } from 'react-redux';
import EarlyDeposit from '../components/EarlyDeposit';
import { attemptCharge } from '../actions/payment';


const mapStateToProps = ({ auth }) => {
  return {
    currentUser: auth.currentUser
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    handleCharge(amount, token, description) { dispatch(attemptCharge(amount, token, description)); }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(EarlyDeposit);

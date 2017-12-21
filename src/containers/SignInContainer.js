import { connect } from 'react-redux';
import SignIn from '../components/SignIn';
import { signInWithCredentials, createAccount } from '../actions/auth';

const mapDispatchToProps = (dispatch) => {
  return {
    signInWithCredentials(email, password) { dispatch(signInWithCredentials(email, password)); },
    createAccount(email, password) { dispatch(createAccount(email, password)); }
  }
}

export default connect(null, mapDispatchToProps)(SignIn);

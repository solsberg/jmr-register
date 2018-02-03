import { connect } from 'react-redux';
import SignIn from '../components/SignIn';
import { signInWithCredentials, signInWithOAuthProvider, createAccount, forgotPassword } from '../actions/auth';

const mapStateToProps = ({ application }) => ({
  hasApplicationError: !!application.error
});

const mapDispatchToProps = (dispatch) => {
  return {
    signInWithCredentials(email, password) { dispatch(signInWithCredentials(email, password)); },
    signInWithOAuthProvider(providerName) { dispatch(signInWithOAuthProvider(providerName)); },
    createAccount(email, password) { dispatch(createAccount(email, password)); },
    forgotPassword(email) { dispatch(forgotPassword(email)); }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SignIn);

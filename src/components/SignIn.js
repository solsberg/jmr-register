import React, { useContext } from 'react';
import classNames from 'classnames';

import useSetState from '../hooks/useSetState';
import { AuthContext } from '../contexts/AuthContext';
import { GOOGLE_OAUTH_PROVIDER, FACEBOOK_OAUTH_PROVIDER, FIRST_NAME_FIELD, LAST_NAME_FIELD } from '../constants';
import './SignIn.css';

const SIGN_IN = 'SIGN_IN',
      SIGN_UP = 'SIGN_UP',
      FORGOT_PASSWORD = 'FORGOT_PASSWORD';

const initialState = {
  email: '',
  firstName: '',
  lastName: '',
  password: '',
  confirm: '',
  mode: SIGN_IN
};

const SignIn = ({ hasApplicationError }) => {
  const [state, setState] = useSetState(initialState);
  const { email, password, confirm, firstName, lastName, mode, emailSent } = state;

  const {
    signInWithCredentials,
    signInWithOAuthProvider,
    createAccount,
    forgotPassword
  } = useContext(AuthContext);
  
  // componentWillMount = () => {
  //   this.clear();
  // }

  const updateEmail = (event) => {
    setState({ email: event.target.value });
  }

  const updatePassword = (event) => {
    setState({ password: event.target.value });
  }

  const updatePasswordConfirmation = (event) => {
    setState({ confirm: event.target.value });
  }

  const updateFirstName = (event) => {
    setState({ firstName: event.target.value });
  }

  const updateLastName = (event) => {
    setState({ lastName: event.target.value });
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    switch (mode) {
      case SIGN_IN:
        signInWithCredentials(email, password);
        break;
      case SIGN_UP:
        if (password === confirm) {
          createAccount(email, password, {
            [FIRST_NAME_FIELD]: firstName,
            [LAST_NAME_FIELD]: lastName
          });
        }
        break;
      case FORGOT_PASSWORD:
        forgotPassword(email);
        setState({emailSent: true});
        break;
      default:
        break;
    }
  }

  const clear = () => {
    setState({
      email: email || '',
      firstName: '',
      lastName: '',
      password: '',
      confirm: '',
      mode: SIGN_IN
    })
  }

  const showSignInForm = (e) => {
    e.preventDefault();
    if (mode !== SIGN_IN) {
      setState({ mode: SIGN_IN, password: '' })
    }
  }

  const showSignUpForm = () => {
    if (mode !== SIGN_UP) {
      setState({ mode: SIGN_UP, password: '', confirm: '' })
    }
  }

  const showForgotPasswordForm = (e) => {
    e.preventDefault();
    setState({
      mode: FORGOT_PASSWORD,
      emailSent: false
    })
  }

  const handleGoogleAuth = (e) => {
    e.preventDefault();
    signInWithOAuthProvider(GOOGLE_OAUTH_PROVIDER);
  }

  const handleFacebookAuth = (e) => {
    e.preventDefault();
    signInWithOAuthProvider(FACEBOOK_OAUTH_PROVIDER);
  }

  let forms = {}
  forms[SIGN_IN] = (
    <div>
      <h4 className="card-title">Sign In</h4>
      <div className="form-group">
        <label htmlFor='email'>Email</label>
        <input id='email' type='email' className="form-control" value={email} onChange={updateEmail} />
      </div>
      <div className="form-group">
        <label htmlFor='password'>Password</label>
        <input id='password' type='password' className="form-control" value={password} onChange={updatePassword} />
      </div>
      <div className="row">
        <div className="col-md-4">
          <button id='signin-submit' type='submit' className="btn btn-success mr-5" disabled={!email || !password}>Sign In</button>
          <div className="mt-1 mb-2">
            <a href="" onClick={showForgotPasswordForm}>Forgot Password?</a>
          </div>
        </div>
        <div className="col-md-8">
          <div className="row">
            <div className="col-md"></div>
            <div className="col-6 col-md-auto">
              <span className="mr-1">or sign in with</span>
              <button className="oauth google-login align-middle m-1" onClick={handleGoogleAuth} />
              <button className="oauth facebook-login align-middle m-1" onClick={handleFacebookAuth} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  forms[SIGN_UP] = (
    <div>
    <h4 className="card-title">Create New Account</h4>
    <div className="form-group">
      <label htmlFor='email'>Email</label>
      <input id='email' type='email' className="form-control" value={email} onChange={updateEmail} />
    </div>
    <div className="form-row">
      <div className="form-group col-md-6">
        <label htmlFor='first_name'>First Name</label>
        <input id='first_name' type='text' className="form-control" value={firstName} onChange={updateFirstName} />
      </div>
      <div className="form-group col-md-6">
        <label htmlFor='last_name'>Last Name</label>
        <input id='last_name' type='text' className="form-control" value={lastName} onChange={updateLastName} />
      </div>
    </div>
    <div className="form-group">
      <label htmlFor='password'>Password</label>
      <input id='password' type='password' className="form-control" value={password} onChange={updatePassword} />
    </div>
    <div className="form-group">
      <label htmlFor='confirm'>Retype Password</label>
      <input id='confirm' type='password' className="form-control" value={confirm} onChange={updatePasswordConfirmation} />
    </div>
    <button id='signup-submit'
        type='submit'
        className="btn btn-success"
        disabled={!email || !firstName || !lastName || !password || !confirm}>
      Create
    </button>
    </div>
  );

  forms[FORGOT_PASSWORD] = (
    <div>
      <h4 className="card-title">Send Password Reset Email</h4>
      <p style={{fontSize: "0.85em"}} className="font-italic">
        Please submit your email address and we will email you a link which you can follow to enter a new password.
      </p>
      <div className="form-group">
        <label htmlFor='email'>Email</label>
        <input id='email' type='email' className="form-control" value={email} onChange={updateEmail} />
      </div>
      <button type='submit' className="btn btn-success" disabled={!email}>Send Email</button>
      {emailSent && !hasApplicationError &&
        <div className="alert alert-success mt-3" role="alert">
          <h4 className="alert-heading">Email sent!</h4>
          <p>Please check your email inbox for an email with the subject "Reset your password for Menschwork Registration".</p>
          <p><a href="" onClick={showSignInForm} className="alert-link">Return to Sign In Form</a></p>
        </div>
      }
    </div>
  );

  return (
    <div className="row no-gutters justify-content-center signin-page">
      <div className="card col col-lg-8 mt-3">
        <div className="card-header">
          <div className="btn-group" role="group" aria-label="Sign In">
            <button
              id="signin-btn"
              type="button"
              className={classNames("btn", mode === SIGN_IN ? "btn-primary" : "btn-secondary")}
              onClick={showSignInForm} >
              Sign In
            </button>
            <button
              id="signup-btn"
              type="button"
              className={classNames("btn", mode === SIGN_UP ? "btn-primary" : "btn-secondary")}
              onClick={showSignUpForm} >
              Create Account
            </button>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            {forms[mode]}
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignIn;

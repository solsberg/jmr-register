import React, { Component } from 'react';
import classNames from 'classnames';

const SIGN_IN = 'SIGN_IN',
      SIGN_UP = 'SIGN_UP',
      FORGOT_PASSWORD = 'FORGOT_PASSWORD';

class SignIn extends Component {
  componentWillMount = () => {
    this.clear();
  }

  updateEmail = (event) => {
    this.setState({ email: event.target.value });
  }

  updatePassword = (event) => {
    this.setState({ password: event.target.value });
  }

  updatePasswordConfirmation = (event) => {
    this.setState({ confirm: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { email, password, confirm, mode } = this.state;
    switch (mode) {
      case SIGN_IN:
        this.props.signInWithCredentials(email, password);
        break;
      case SIGN_UP:
        if (password === confirm) {
          this.props.createAccount(email, password);
        }
        break;
      case FORGOT_PASSWORD:
        this.props.forgotPassword(email);
        this.setState({emailSent: true});
        break;
      default:
        break;
    }
  }

  clear = () => {
    this.setState({
      email: (this.state && this.state.email) || '',
      password: '',
      confirm: '',
      mode: SIGN_IN
    })
  }

  showSignInForm = (e) => {
    e.preventDefault();
    if (this.state.mode !== SIGN_IN) {
      this.setState({ mode: SIGN_IN, password: '' })
    }
  }

  showSignUpForm = () => {
    if (this.state.mode !== SIGN_UP) {
      this.setState({ mode: SIGN_UP, password: '', confirm: '' })
    }
  }

  showForgotPasswordForm = (e) => {
    e.preventDefault();
    this.setState({
      mode: FORGOT_PASSWORD,
      emailSent: false
    })
  }

  render() {
    const { email, password, confirm, mode, emailSent } = this.state;
    const { hasApplicationError } = this.props;

    let forms = {}
    forms[SIGN_IN] = (
      <div>
        <h4 className="card-title">Sign In</h4>
        <div className="form-group">
          <label htmlFor='email'>Email</label>
          <input id='email' type='email' className="form-control" value={email} onChange={this.updateEmail} />
        </div>
        <div className="form-group">
          <label htmlFor='password'>Password</label>
          <input id='password' type='password' className="form-control" value={password} onChange={this.updatePassword} />
        </div>
        <button type='submit' className="btn btn-success" disabled={!email || !password}>Sign In</button>
        <div className="mt-1">
          <a href="" onClick={this.showForgotPasswordForm}>Forgot Password?</a>
        </div>
      </div>
    );

    forms[SIGN_UP] = (
      <div>
      <h4 className="card-title">Create New Account</h4>
      <div className="form-group">
        <label htmlFor='email'>Email</label>
        <input id='email' type='email' className="form-control" value={email} onChange={this.updateEmail} />
      </div>
      <div className="form-group">
        <label htmlFor='password'>Password</label>
        <input id='password' type='password' className="form-control" value={password} onChange={this.updatePassword} />
      </div>
      <div className="form-group">
        <label htmlFor='confirm'>Retype Password</label>
        <input id='confirm' type='password' className="form-control" value={confirm} onChange={this.updatePasswordConfirmation} />
      </div>
      <button type='submit' className="btn btn-success" disabled={!email || !password || !confirm}>Create</button>
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
          <input id='email' type='email' className="form-control" value={email} onChange={this.updateEmail} />
        </div>
        <button type='submit' className="btn btn-success" disabled={!email}>Send Email</button>
        {emailSent && !hasApplicationError &&
          <div className="alert alert-success mt-3" role="alert">
            <h4 className="alert-heading">Email sent!</h4>
            <p>Please check your email inbox for an email with the subject "Reset your password for JMR Registration".</p>
            <p><a href="" onClick={this.showSignInForm} className="alert-link">Return to Sign In Form</a></p>
          </div>
        }
      </div>
    );

    return (
      <div className="card">
        <div className="card-header">
          <div className="btn-group" role="group" aria-label="Sign In">
            <button
              type="button"
              className={classNames("btn", mode === SIGN_IN ? "btn-primary" : "btn-secondary")}
              onClick={this.showSignInForm} >
              Sign In
            </button>
            <button
              type="button"
              className={classNames("btn", mode === SIGN_UP ? "btn-primary" : "btn-secondary")}
              onClick={this.showSignUpForm} >
              Create Account
            </button>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={this.handleSubmit}>
            {forms[mode]}
          </form>
        </div>
      </div>
    );
  }
};

export default SignIn;

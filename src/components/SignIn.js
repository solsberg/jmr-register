import React, { Component } from 'react';
import classNames from 'classnames';

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
    const { email, password, confirm, createCredential } = this.state;
    if (createCredential) {
      if (password === confirm) {
        this.props.createAccount(email, password);
      }
    } else {
      this.props.signInWithCredentials(email, password);
    };
  }

  clear = () => {
    this.setState({
      email: '',
      password: '',
      confirm: '',
      createCredential: false
    })
  }

  showSignInForm = () => {
    this.setState({ createCredential: false })
  }

  showSignUpForm = () => {
    this.setState({ createCredential: true })
  }

  render() {
    const { email, password, confirm, createCredential } = this.state;

    const signInForm = (
      <div>
      <h4 className="card-title">Sign In</h4>
      <div className="form-group">
        <label htmlFor='email'>Email</label>
        <input id='email' type='email' class="form-control" value={email} onChange={this.updateEmail} />
      </div>
      <div className="form-group">
        <label htmlFor='password'>Password</label>
        <input id='password' type='password' class="form-control" value={password} onChange={this.updatePassword} />
      </div>
      <button type='submit' class="btn btn-success">Sign In</button>
      {/* <a onClick={this.showSignUpForm}>Create Account</a> */}
      </div>
    );

    const signUpForm = (
      <div>
      <h4 className="card-title">Create New Account</h4>
      <div className="form-group">
        <label htmlFor='email'>Email</label>
        <input id='email' type='email' class="form-control" value={email} onChange={this.updateEmail} />
      </div>
      <div className="form-group">
        <label htmlFor='password'>Password</label>
        <input id='password' type='password' class="form-control" value={password} onChange={this.updatePassword} />
      </div>
      <div className="form-group">
        <label htmlFor='confirm'>Retype Password</label>
        <input id='confirm' type='password' class="form-control" value={confirm} onChange={this.updatePasswordConfirmation} />
      </div>
      <button type='submit' class="btn btn-success">Create</button>
      </div>
    );

    return (
      <div className="card">
        <div className="card-header">
          <div className="btn-group" role="group" aria-label="Sign In">
            <button
              type="button"
              className={classNames("btn", createCredential ? "btn-secondary" : "btn-primary")}
              onClick={this.showSignInForm} >
              Sign In
            </button>
            <button
              type="button"
              className={classNames("btn", createCredential ? "btn-primary" : "btn-secondary")}
              onClick={this.showSignUpForm} >
              Create Account
            </button>
          </div>
        </div>
        <div className="card-body">
          <form onSubmit={this.handleSubmit}>
            {createCredential ? signUpForm : signInForm}
          </form>
        </div>
      </div>
    );
  }
};

export default SignIn;

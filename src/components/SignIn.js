import React, { Component } from 'react';

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
      <h4>Sign In</h4>
      <label htmlFor='email'>Email</label>
      <input id='email' type='text' value={email} onChange={this.updateEmail} />
      <label htmlFor='password'>Password</label>
      <input id='password' type='password' value={password} onChange={this.updatePassword} />
      <input type='submit' value='Sign In' />
      <a onClick={this.showSignUpForm}>Create Account</a>
      </div>
    );

    const signUpForm = (
      <div>
      <h4>Create New Account</h4>
      <label htmlFor='email'>Email</label>
      <input id='email' type='text' value={email} onChange={this.updateEmail} />
      <label htmlFor='password'>Password</label>
      <input id='password' type='password' value={password} onChange={this.updatePassword} />
      <label htmlFor='confirm'>Retype Password</label>
      <input id='confirm' type='password' value={confirm} onChange={this.updatePasswordConfirmation} />
      <input type='submit' value='Create' />
      <a onClick={this.showSignInForm}>Sign In to Existing Account</a>
      </div>
    );

    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          {createCredential ? signUpForm : signInForm}
        </form>
      </div>
    );
  }
};

export default SignIn;

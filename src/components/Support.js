import React, { Component } from 'react';
import classNames from 'classnames';
import { validateEmail } from '../lib/utils';
import { sendAdminEmail } from '../lib/api';

const EMAIL_SUCCESS = 'EMAIL_SUCCESS',
      EMAIL_FAILED = 'EMAIL_FAILED';

class Support extends Component {
  componentWillMount = () => {
    this.clear();
  }

  componentWillReceiveProps = (nextProps) => {
    if (this.props.currentUser !== nextProps.currentUser && nextProps.currentUser) {
      this.setState({email: nextProps.currentUser.email});
    }
  }

  clear = () => {
    const { currentUser } = this.props;
    let email = this.state && this.state.email;
    if (!email && currentUser) {
      email = currentUser.email;
    }
    this.setState({
      email: email || '',
      summary: '',
      description: '',
      invalidEmail: false,
      emailStatus: null,
      statusAdded: false
    });
  }

  updateEmail = (event) => {
    this.setState({ email: event.target.value });
  }

  checkEmail = () => {
    const { email } = this.state;
    const valid =  !email || validateEmail(email);
    this.setState({ invalidEmail: !valid });
    return valid;
  }

  updateSummary = (event) => {
    this.setState({ summary: event.target.value });
  }

  updateDescription = (event) => {
    this.setState({ description: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { email, summary, description } = this.state;
    this.setState({emailStatus: null});
    if (this.checkEmail(email)) {
      let content = '';
      if (summary.trim().length > 0) {
        content += "Summary: " + summary + "\n\n";
      }
      content += "Sender: " + email + "\n\n" + description;
      sendAdminEmail("Support Form", content)
      .then(() => {
        this.setState({
          emailStatus: EMAIL_SUCCESS,
          statusAdded: true
        });
      }).catch((err) => {
        this.setState({
          emailStatus: EMAIL_FAILED,
          statusAdded: true
        });
      });
    }
  }

  componentDidUpdate = () => {
    const { emailStatus, statusAdded } = this.state;
    if (!!statusAdded) {
      if (emailStatus === EMAIL_SUCCESS && this.successDiv) {
        this.successDiv.scrollIntoView();
      }
      if (emailStatus === EMAIL_FAILED && this.errorDiv) {
        this.errorDiv.scrollIntoView();
      }
      this.setState({statusAdded: false});
    }
  }

  returnToRegistration = () => {
    const { history } = this.props;
    if (history.length > 0) {
      history.goBack();
    } else {
      history.push("/");
    }
  }

  render() {
    const { email, summary, description, invalidEmail, emailStatus } = this.state;
    return (
      <div className="mt-3">
        <h3 className="text-center">
          Support
        </h3>
        <div className="row justify-content-center">
          <div className="card col col-md-8">
            <div className="xcard-header">
            </div>
            <div className="card-body">
              <form onSubmit={this.handleSubmit}>
                <h4 className="card-title">Support Form</h4>
                <p style={{fontSize: "0.85em"}} className="font-italic">
                  Please either fill out this form, or alternatively send an email
                  to <a href="mailto:registration@menschwork.org">registration@menschwork.org</a> describing
                  your problem and someone will get back to you as soon as possible.
                </p>
                <div className="form-group">
                  <label htmlFor='email'>Your Email</label>
                  <input id='email' type='email' className={classNames("form-control", invalidEmail ? "is-invalid" : null)} value={email} onChange={this.updateEmail} onBlur={this.checkEmail} />
                    {invalidEmail && <div className="invalid-feedback">Please enter a valid email address</div>}
                </div>
                <div className="form-group">
                  <label htmlFor='summary'>Summary</label>
                  <input id='summary' type='text' className="form-control" value={summary} onChange={this.updateSummary} />
                </div>
                <div className="form-group">
                  <label htmlFor='description'>Description</label>
                  <textarea id='description' className="form-control" rows='5' value={description} onChange={this.updateDescription} />
                </div>
                <div className="d-flex">
                  <button type='submit' className="btn btn-success" disabled={!email || !description}>Send</button>
                  <button type="button" className="btn btn-link ml-auto" onClick={this.returnToRegistration}>Back To Registration</button>
                </div>
              </form>
            { (emailStatus === EMAIL_SUCCESS) &&
              <div className="alert alert-success mt-3" role="alert" ref={(e) => { this.successDiv = e; }}>
                Thank you for your submission. Someone will get back to you soon.
              </div> }
            { (emailStatus === EMAIL_FAILED) &&
              <div className="alert alert-danger mt-3" role="alert" ref={(e) => { this.errorDiv = e; }}>
                There was an error sending the form. Please send an email instead to <a href="mailto:registration@menschwork.org">registration@menschwork.org</a>.
              </div> }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Support;

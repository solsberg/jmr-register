import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import classNames from 'classnames';
import { validateEmail } from '../lib/utils';
import { sendAdminEmail } from '../lib/api';

const EMAIL_SUCCESS = 'EMAIL_SUCCESS',
      EMAIL_FAILED = 'EMAIL_FAILED';

const Support = ({ currentUser }) => {
  const [ email, setEmail ] = useState('');
  const [ summary, setSummary ] = useState('');
  const [ description, setDescription ] = useState('');
  const [ invalidEmail, setInvalidEmail ] = useState(false);
  const [ emailStatus, setEmailStatus ] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(!!currentUser ? currentUser.email : '');
  }, [ currentUser]);

  const updateEmail = (event) => {
    setEmail(event.target.value);
  };

  const checkEmail = () => {
    const valid =  !email || validateEmail(email);
    setInvalidEmail(!valid);
    return valid;
  };

  const updateSummary = (event) => {
    setSummary(event.target.value);
  };

  const updateDescription = (event) => {
    setDescription(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setEmailStatus(null);
    if (checkEmail()) {
      let content = '';
      if (summary.trim().length > 0) {
        content += "Summary: " + summary + "\n\n";
      }
      content += "Sender: " + email + "\n\n" + description;
      sendAdminEmail("Support Form", content)
      .then(() => {
        setEmailStatus(EMAIL_SUCCESS);
      }).catch((err) => {
        setEmailStatus(EMAIL_FAILED);
      });
    }
  };

  const scrollToRef = (node) => {
    if (node) {
      node.scrollIntoView();
    }
  };

  const returnToRegistration = () => {
    navigate("/");
  };

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
            <form onSubmit={handleSubmit}>
              <h4 className="card-title">Support Form</h4>
              <p style={{fontSize: "0.85em"}} className="font-italic">
                Please either fill out this form, or alternatively send an email
                to <a href="mailto:registration@menschwork.org">registration@menschwork.org</a> describing
                your problem and someone will get back to you as soon as possible.
              </p>
              <div className="form-group">
                <label htmlFor='email'>Your Email</label>
                <input id='email' type='email' className={classNames("form-control", invalidEmail ? "is-invalid" : null)} value={email} onChange={updateEmail} onBlur={checkEmail} />
                  {invalidEmail && <div className="invalid-feedback">Please enter a valid email address</div>}
              </div>
              <div className="form-group">
                <label htmlFor='summary'>Summary</label>
                <input id='summary' type='text' className="form-control" value={summary} onChange={updateSummary} />
              </div>
              <div className="form-group">
                <label htmlFor='description'>Description</label>
                <textarea id='description' className="form-control" rows='5' value={description} onChange={updateDescription} />
              </div>
              <div className="d-flex">
                <button type='submit' className="btn btn-success" disabled={!email || !description}>Send</button>
                <button type="button" className="btn btn-link ml-auto" onClick={returnToRegistration}>Back To Registration</button>
              </div>
            </form>
          { (emailStatus === EMAIL_SUCCESS) &&
            <div className="alert alert-success mt-3" role="alert" ref={scrollToRef}>
              Thank you for your submission. Someone will get back to you soon.
            </div> }
          { (emailStatus === EMAIL_FAILED) &&
            <div className="alert alert-danger mt-3" role="alert" ref={scrollToRef}>
              There was an error sending the form. Please send an email instead to <a href="mailto:registration@menschwork.org">registration@menschwork.org</a>.
            </div> }
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;

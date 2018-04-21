import React, { Component } from 'react';
import classNames from 'classnames';

class ProfileInputField extends Component {
  handleChange = (event) => {
    event.preventDefault();
    const {id, onChange} = this.props;
    onChange(id, event.target.value);
  }

  render() {
    const {id, label, type, value, className, required, validate, invalidText} = this.props;

    const invalid = validate && !!required && (!value || !value.trim());
    return (
      <div className={classNames("form-group", className)}>
        <label htmlFor={id}>{label}</label>
        <input id={id} type={type || 'text'} className={classNames("form-control", invalid && 'is-invalid')}
            value={value} placeholder={required && 'Required'} onChange={this.handleChange}/>
          {invalid && <div className="invalid-feedback">{invalidText}</div>}
      </div>
    );
  }
}

export default ProfileInputField;

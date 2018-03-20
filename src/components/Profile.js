import React, { Component } from 'react';

class Profile extends Component {
  componentWillMount() {
    const { profile, currentUser } = this.props;
    this.setState({
      email: currentUser.email,
      first_name: profile.first_name,
      last_name: profile.last_name
    });
  }

  updateFirstName = (event) => {
    this.setState({ first_name: event.target.value });
  }

  updateLastName = (event) => {
    this.setState({ last_name: event.target.value });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    const { currentUser, updateProfile } = this.props;
    updateProfile(currentUser, {
      first_name: this.state.first_name,
      last_name: this.state.last_name
    });
  }

  render() {
    const { email, first_name, last_name } = this.state || {};

    return (
      <div className="mt-3">
        <h3 className="text-center">
          Profile
        </h3>
        <form onSubmit={this.handleSubmit}>
          <div className="form-group">
            <label htmlFor='email'>Email</label>
            <input id='email' type='email' className="form-control" value={email} readOnly />
          </div>
          <div className="form-row">
            <div className="form-group col-md-6">
              <label htmlFor='first_name'>First Name</label>
              <input id='first_name' type='text' className="form-control" value={first_name} onChange={this.updateFirstName} />
            </div>
            <div className="form-group col-md-6">
              <label htmlFor='last_name'>Last Name</label>
              <input id='last_name' type='text' className="form-control" value={last_name} onChange={this.updateLastName} />
            </div>
          </div>
            <button type='submit' className="btn btn-success mr-5">Save Changes</button>
        </form>
      </div>
    );
  }
}

export default Profile;

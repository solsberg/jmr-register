import React, { Component } from 'react';
import EarlyDepositRegistrations from './EarlyDepositRegistrations';

class Admin extends Component {
  componentDidMount() {
    const { events, loadAdminData } = this.props;
    if (events.length > 0) {
      loadAdminData(events[0]);
    }
  }

  render() {
    const { data } = this.props;

    return (
      <div className="mt-3">
        <h3 className="text-center">
          Admin
        </h3>

        <EarlyDepositRegistrations registrations={data}/>
      </div>
    );
  }
}

export default Admin;

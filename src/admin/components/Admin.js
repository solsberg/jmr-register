import React, { Component } from 'react';
import EarlyDepositRegistrations from './EarlyDepositRegistrations';
import FullRegistrations from './FullRegistrations';

class Admin extends Component {
  constructor(props) {
    super(props);

    this.state = {
      reportType: "full"
    };
  }

  componentDidMount() {
    const { events, loadAdminData } = this.props;
    if (events.length > 0) {
      loadAdminData(events[0]);
    }
  }

  onReportChange = (evt) => {
    this.setState({
      reportType: evt.target.value
    });
  }

  render() {
    console.log("render");
    const { data, events } = this.props;
    const { reportType } = this.state;

    let report;
    switch(reportType) {
      case 'full':
        report = <FullRegistrations registrations={data} event={events.length > 0 && events[0]}/>;
        break;
      case 'early':
        report = <EarlyDepositRegistrations registrations={data} event={events.length > 0 && events[0]}/>;
        break;
      default:
        break;
    }
    return (
      <div className="mt-3">
        <h3 className="text-center">
          Admin
        </h3>

        <div className="form-group">
          <select className="form-control col-md-2"
            id="report-chooser"
            value={reportType}
            onChange={this.onReportChange}
          >
            <option value="full" key="full">Attendees</option>
            <option value="early" key="early">Pre-Registrations</option>
          </select>
        </div>

        {report}
      </div>
    );
  }
}

export default Admin;

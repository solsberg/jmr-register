import React, { Component } from 'react';
import EarlyDepositRegistrations from './EarlyDepositRegistrations';
import FullRegistrations from './FullRegistrations';
import AttendeeDetail from './AttendeeDetail';
import BambamInvitations from './BambamInvitations';
import ScholarshipApplications from './ScholarshipApplications';
import RoomChoices from './RoomChoices';

class Admin extends Component {
  componentDidMount() {
    const { events, loadAdminData } = this.props;
    if (events.length > 0) {
      loadAdminData(events[0]);
    }
  }

  onReportChange = (evt) => {
    const { history } = this.props;
    history.push(`/admin/${evt.target.value}`);
  }

  render() {
    const { data, events, match } = this.props;

    let report;
    const reportType = match.params.name || 'full';
    switch(reportType) {
      case 'full':
        report = <FullRegistrations registrations={data} event={events.length > 0 && events[0]}/>;
        break;
      case 'early':
        report = <EarlyDepositRegistrations registrations={data} event={events.length > 0 && events[0]}/>;
        break;
      case 'detail':
        const registration = data.find(r => r.user.uid === match.params.param);
        if (!!registration) {
          report = <AttendeeDetail registration={registration.registration}
              event={events.length > 0 && events[0]}
              user={registration.user}
            />;
        }
        break;
      case 'bambam':
        report = <BambamInvitations registrations={data} event={events.length > 0 && events[0]}/>;
        break;
      case 'scholarship':
        report = <ScholarshipApplications registrations={data} event={events.length > 0 && events[0]}/>;
        break;
      case 'rooms':
        report = <RoomChoices registrations={data} event={events.length > 0 && events[0]}/>;
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
          <select className="form-control col-md-3"
            id="report-chooser"
            value={reportType}
            onChange={this.onReportChange}
          >
            <option value="full" key="full">Attendees</option>
            <option value="early" key="early">Pre-Registrations</option>
            <option value="bambam" key="bambam">Be a Mensch, Bring a Mensch</option>
            <option value="scholarship" key="scholarship">Scholarship Applications</option>
            <option value="rooms" key="rooms">Accommodations</option>
          </select>
        </div>

        {report}
      </div>
    );
  }
}

export default Admin;

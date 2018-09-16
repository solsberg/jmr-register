import React, { Component } from 'react';
import EarlyDepositRegistrations from './EarlyDepositRegistrations';
import FullRegistrations from './FullRegistrations';
import AttendeeDetail from './AttendeeDetail';
import BambamInvitations from './BambamInvitations';
import ScholarshipApplications from './ScholarshipApplications';
import RoomChoices from './RoomChoices';
import GenericReport from './GenericReport';
import './Admin.css';

const DIETARY_INFO = {
  omnivore: "Omnivore",
  pescatarian: "Pescatarian",
  vegetarian: "Vegetarian",
  vegan: "Vegan"
};

const hasSpecialDietaryPreference = profile => {
  return !!profile.dietary_preference && profile.dietary_preference !== 'omnivore';
}

const hasTextFieldValue = value => {
  return !!value && value.length > 0 &&
    !["no", "none", "n/a"].includes(value.toLowerCase());
}

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
      case 'food':
        report = <GenericReport registrations={data} event={events.length > 0 && events[0]}
          title="Food Preferences"
          filter={i => hasSpecialDietaryPreference(i.user.profile) ||
            !!i.user.profile.gluten_free || hasTextFieldValue(i.user.profile.dietary_additional)}
          fields={[
            {title: "Preference", value: i => hasSpecialDietaryPreference(i.user.profile) &&
              DIETARY_INFO[i.user.profile.dietary_preference]},
            {title: "Gluten-free", value: i => !!i.user.profile.gluten_free && "Yes"},
            {title: "Additional Needs", value: i => i.user.profile.dietary_additional}
          ]}
        />;
        break;
      case 'thursday':
        report = <GenericReport registrations={data} event={events.length > 0 && events[0]}
          title="Thursday Night"
          filter={i => i.registration.order.thursdayNight}
        />;
        break;
      case 'first-timers':
        report = <GenericReport registrations={data} event={events.length > 0 && events[0]}
          title="First Time Attendees"
          filter={i => !!i.registration.personal && i.registration.personal.first_jmr}
        />;
        break;
      case 'comments':
        report = <GenericReport registrations={data} event={events.length > 0 && events[0]}
          title="General Comments"
          filter={i => hasTextFieldValue(!!i.registration.personal && i.registration.personal.extra_info)}
          fields={[
            {value: i => !!i.registration.personal && i.registration.personal.extra_info}
          ]}
        />;
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
            <option value="food" key="food">Food Preferences</option>
            <option value="thursday" key="thursday">Thursday Night</option>
            <option value="first-timers" key="first-timers">First-Timers</option>
            <option value="comments" key="comments">General Comments</option>
          </select>
        </div>

        {report}
      </div>
    );
  }
}

export default Admin;

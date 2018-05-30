import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import classNames from "classnames";
import ROOM_DATA from '../../roomData.json';
import { buildStatement } from '../../lib/utils';
import StatementTable from '../../components/StatementTable';

const AttendeeField = ({name, label, value}) => {
  return (
    <div className="form-group row">
      <label htmlFor={name} className="col-md-3 col-form-label">{label}</label>
      <div className="col-md-9">
        <input type="text" readOnly className="form-control-plaintext" id={name}
          value={value || ''} />
      </div>
    </div>
  );
}

class AttendeeDetail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentTab: "registration"
    };
  }

  selectTab = (evt, type) => {
    evt.preventDefault();
    this.setState({
      currentTab: type
    });
  }

  renderRegistrationTab = () => {
    const { registration, user } = this.props;

    const order = Object.assign({}, registration.order, registration.cart);

    return (
      <div>
        <AttendeeField name="roomChoice" label="Room Type" value={ROOM_DATA[order.roomChoice].title} />
        <AttendeeField name="singleRoom" label="Single Room" value={order.singleSupplement} />
        <AttendeeField name="refrigerator" label="Refrigerator" value={order.refrigerator} />
        <AttendeeField name="thursday" label="Thursday Night" value={order.thursdayNight} />
        <AttendeeField name="roommate" label="Roommate Request" value={order.roommate} />
        <AttendeeField name="first_jmr" label="First JMR?" value={registration.personal.first_jmr} />
        <AttendeeField name="extra_info" label="Welcome suggestion" value={registration.personal.extra_info} />
        <AttendeeField name="dietary" label="Dietary Preference" value={user.profile.dietary_preference} />
        <AttendeeField name="gluten_free" label="Gluten Free" value={user.profile.gluten_free} />
        <AttendeeField name="additional_dietary" label="Additional Dietary Info" value={user.profile.dietary_additional} />
      </div>
    );
  }

  renderPersonalTab = () => {
    const { user } = this.props;

    const profile = user.profile;

    const elements = [profile.address_1, profile.address_2, [profile.city, profile.state, profile.post_code].join(' ').trim()];
    const address = elements
      .filter(f => !!f)
      .join(', ');

    return (
      <div>
        <AttendeeField name="email" label="Email" value={user.email} />
        <AttendeeField name="address" label="Address" value={address} />
        <AttendeeField name="phone" label="Phone" value={profile.phone} />
        <AttendeeField name="phone_2" label="Alternate Phone" value={profile.phone_2} />
        <AttendeeField name="emergency_name" label="Emergency Contact" value={profile.emergency_name} />
        <AttendeeField name="emergency_phone" label="Emergency Phone" value={profile.emergency_phone} />
        <AttendeeField name="dob" label="Date of Birth" value={profile.date_of_birth} />
        <AttendeeField name="religious" label="Religious Identiification" value={profile.religious_identity} />
        <AttendeeField name="roster" label="Roster Preference" value={profile.contact_share} />
      </div>
    );
  }

  renderAccountTab = () => {
    const { registration, event } = this.props;

    const { lineItems } = buildStatement(registration, event);
    if (lineItems) {
      return (
        <StatementTable lineitems={lineItems} />
      );
    }
  }

  render() {
    const { user } = this.props;
    const { currentTab } = this.state;

    let tabContent;
    switch(currentTab) {
      case 'registration':
        tabContent = this.renderRegistrationTab();
        break;
      case 'personal':
        tabContent = this.renderPersonalTab();
        break;
      case 'account':
        tabContent = this.renderAccountTab();
        break;
      default:
    }

    return (
      <div className="mt-3">
        <Link className="nav-link float-right" to={`/admin/full`}>&lt;&lt;&nbsp;Back to Attendee List</Link>
        <h5 className="my-4">
          Registration for {user.profile.first_name} {user.profile.last_name}
        </h5>
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <a className={classNames("nav-link", currentTab === "registration" && "active")}
                href="" onClick={(evt) => this.selectTab(evt, "registration")}>
              Registration
            </a>
          </li>
          <li className="nav-item">
            <a className={classNames("nav-link", currentTab === "personal" && "active")}
                href="" onClick={(evt) => this.selectTab(evt, "personal")}>
              Personal Info
            </a>
          </li>
          <li className="nav-item">
            <a className={classNames("nav-link", currentTab === "account" && "active")}
                href="" onClick={(evt) => this.selectTab(evt, "account")}>
              Statement
            </a>
          </li>
        </ul>
        <div className="offset-md-1 col-md-10 my-4">
          {tabContent}
        </div>
      </div>
    );
  }
}

export default AttendeeDetail;

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router';
import get from 'lodash/get';
import has from 'lodash/has';
import EarlyDepositRegistrations from './EarlyDepositRegistrations';
import FullRegistrations from './FullRegistrations';
import AttendeeDetail from './AttendeeDetail';
import BambamInvitations from './BambamInvitations';
import ScholarshipApplications from './ScholarshipApplications';
import RoomChoices from './RoomChoices';
import GenericReport from './GenericReport';
import LocationReport from './LocationReport';
import AbandonedCart from './AbandonedCart';
import Cancellations from './Cancellations';
import WaitList from './WaitList';
import Checkout from '../../components/Checkout';
import { useEvents } from '../../providers/EventsProvider';
import './Admin.css';
import { formatMoney, getRegistrationDate, calculateBalance } from '../../lib/utils';

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

const Admin = ({ loadAdminData, reloadRegistration, data }) => {
  const [currentEvent, setCurrentEvent] = useState(null);
  const { events: allEvents } = useEvents();
  const navigate = useNavigate();
  const params = useParams();

  const events = useMemo(
    () => allEvents.filter(e => !e.type),
    [ allEvents ]
  );

  const setEvent = useCallback((event) => {
    setCurrentEvent(event);
    loadAdminData(event);
  }, [ setCurrentEvent, loadAdminData ]);

  useEffect(() => {
    if (events.length > 0) {
      setEvent(events[events.length-1]);
    }
  }, [ events, setEvent ]);

  const onReportChange = (evt) => {
    navigate(`/admin/${evt.target.value}`);
  };

  const onEventChange = (evt) => {
    let event = events.find(e => e.eventId === evt.target.value);
    setEvent(event);
  };

  const runReloadRegistration = (user) => {
    reloadRegistration(currentEvent, user);
  };

  let report;
  const reportType = params.name || 'full';

  switch(reportType) {
    case 'full':
      report = <FullRegistrations registrations={data} event={currentEvent}/>;
      break;
    case 'early':
      report = <EarlyDepositRegistrations registrations={data} event={currentEvent}/>;
      break;
    case 'detail':
      const registration = data.find(r => r.user.uid === params.param);
      if (!!registration) {
        report = <AttendeeDetail registration={registration.registration}
            event={currentEvent}
            user={registration.user}
            onReload={runReloadRegistration}
          />;
      }
      break;
    case 'bambam':
      report = <BambamInvitations registrations={data} event={currentEvent}/>;
      break;
    case 'scholarship':
      report = <ScholarshipApplications registrations={data} event={currentEvent}/>;
      break;
    case 'rooms':
      report = <RoomChoices registrations={data} event={currentEvent}/>;
      break;
    case 'food':
      report = <GenericReport registrations={data} event={currentEvent}
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
      report = <GenericReport registrations={data} event={currentEvent}
        title="Thursday Night"
        filter={i => get(i.registration, "order.thursdayNight")}
      />;
      break;
    case 'first-timers':
      report = <GenericReport registrations={data} event={currentEvent}
        title="First Time Attendees"
        filter={i => !!i.registration.personal && i.registration.personal.first_jmr}
      />;
      break;
    case 'comments':
      report = <GenericReport registrations={data} event={currentEvent}
        title="General Comments"
        filter={i => hasTextFieldValue(!!i.registration.personal && i.registration.personal.extra_info)}
        fields={[
          {value: i => !!i.registration.personal && i.registration.personal.extra_info}
        ]}
      />;
      break;
    case 'location':
      report = <LocationReport registrations={data} event={currentEvent}/>;
      break;
    case 'abandoned':
      report = <AbandonedCart registrations={data} event={currentEvent}/>;
      break;
    case 'cancelled':
      report = <Cancellations registrations={data} event={currentEvent}/>;
      break;
    case 'waitlist':
      report = <WaitList registrations={data} event={currentEvent}/>;
      break;
    case 'donations':
      report = <GenericReport registrations={data} event={currentEvent}
        title="Donations"
        filter={i => has(i, "registration.account.donations")}
        fields={[
          {value: i => formatMoney(Object.values(i.registration.account.donations).reduce((acc, d) => acc + d.amount, 0)), title: "Amount"},
          {value: i => getRegistrationDate(i.registration), title: "Registration Date"},
          {value: i => calculateBalance(i.registration, currentEvent, i.user) <= 0 && "Yes", title: "Fully Paid?"},
        ]}
      />;
      break;
    case 'checkout':
      report = <Checkout />;
      break;
    default:
      break;
  }
  return (
    <div className="mt-3">
      <h3 className="text-center">
        Admin
      </h3>

      <div className="form-group row">
        <select className="form-control col-md-3"
          id="report-chooser"
          value={reportType}
          onChange={onReportChange}
        >
          <option value="full" key="full">Attendees</option>
          <option value="early" key="early">Pre-Registrations</option>
          <option value="bambam" key="bambam">Be a Mensch, Bring a Mensch</option>
          <option value="scholarship" key="scholarship">Scholarship Applications</option>
          <option value="rooms" key="rooms">Accommodations</option>
          <option value="food" key="food">Food Preferences</option>
          <option value="thursday" key="thursday">Thursday Night</option>
          <option value="first-timers" key="first-timers">First-Timers</option>
          <option value="location" key="location">Attendees by Location</option>
          <option value="comments" key="comments">General Comments</option>
          <option value="abandoned" key="abandoned">Abandoned Registrations</option>
          <option value="cancelled" key="cancelled">Cancellations</option>
          <option value="waitlist" key="waitlist">Wait List</option>
          <option value="donations" key="donations">Donations</option>
        </select>

        <select className="form-control col-md-2 ml-2"
          id="event-chooser"
          value={!!currentEvent && currentEvent.eventId}
          onChange={onEventChange}
        >
          {
            events.map(e => <option value={e.eventId} key={e.eventId}>{e.title}</option>)
          }
        </select>
      </div>

      {report}
    </div>
  );
};

export default Admin;

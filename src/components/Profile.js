import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import ProfileInputField from './ProfileInputField';

const Profile = ({ profile, personalInfo, currentUser, event, order, updateProfile }) => {
  const [ email, setEmail ] = useState('');
  const [ values, setValues ] = useState({});
  const [ hasSubmitted, setHasSubmitted ] = useState(false);
    // const { first_name, } = useState('');
    // const { last_name, } = useState('');
    // const { address_1, } = useState('');
    // const { address_2, } = useState('');
    // const { city, } = useState('');
    // const { state, } = useState('');
    // const { post_code, } = useState('');
    // const { phone, } = useState('');
    // const { phone_2, } = useState('');
    // const { emergency_name, } = useState('');
    // const { emergency_phone, } = useState('');
    // const { date_of_birth, } = useState('');
    // const { religious_identity, } = useState('');
    // const { dietary_preference, } = useState('');
    // const { gluten_free, } = useState(false);
    // const { dietary_additional, } = useState('');
    // const { first_jmr, } = useState(undefined);
    // const { contact_share, } = useState('name_email_phone');
    // const { extra_info, } = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const isOnline = () => {
    return event.onlineOnly || (!!order && !!order.roomChoice && order.roomChoice.indexOf("online") >= 0);
  };

  debugger;
  const fieldInfo = {
    first_name: {required: true},
    last_name: {required: true},
    address_1: {required: true},
    address_2: {},
    city: {required: true},
    state: {},
    post_code: {},
    phone: {required: true},
    phone_2: {},
    emergency_name: {required: !isOnline()},
    emergency_phone: {required: !isOnline()},
    date_of_birth: {},
    religious_identity: {},
    dietary_preference: {},
    gluten_free: {type: 'boolean'},
    dietary_additional: {},
    first_jmr: {registration: true, type: 'boolean', defaultValue: undefined},
    contact_share: {defaultValue: 'name_email_phone'},
    extra_info: {registration: true}
  };

  const religionInfo = [
    {value: "jewish-conservative", label: "Jewish / Conservative"},
    {value: "jewish-orthodox", label: "Jewish / Orthodox"},
    {value: "jewish-reform", label: "Jewish / Reform"},
    {value: "jewish-reconstructionist", label: "Jewish / Reconstructionist"},
    {value: "jewish-renewal", label: "Jewish / Renewal"},
    {value: "jewish-secular", label: "Jewish / Secular"},
    {value: "jewish", label: "Jewish"},
    {value: "buddhist", label: "Buddhist"},
    {value: "christian", label: "Christian"},
    {value: "muslim", label: "Muslim"},
    {value: "no-religion", label: "No Religion"},
    {value: "other", label: "Other"},
    {value: "no-answer", label: "Prefer not to answer"}
  ];

  const dietaryInfo = [
    {value: "omnivore", label: "Omnivore"},
    {value: "pescatarian", label: "Pescatarian"},
    {value: "vegetarian", label: "Vegetarian"},
    {value: "vegan", label: "Vegan"}
  ];

  const contactShareInfo = [
    {value: "name_email_phone", label: "Name, Email, Phone"},
    {value: "name_email", label: "Name, Email"},
    {value: "name", label: "Name only"},
    {value: "none", label: "Do not include me on the roster"}
  ];

  useEffect(() => {
    setEmail('');
    const vals = {};
    Object.keys(fieldInfo).forEach(f => {
      vals[f] = getFieldDefaultValue(f);
    });
    setValues(vals);
  }, []);

  useEffect(() => {
    if (!!profile && !!currentUser) {
      initState(currentUser, profile, personalInfo);
    }
  }, [ profile, personalInfo, currentUser, order ]);

  const getFieldDefaultValue = (field) => {
    if (fieldInfo[field].hasOwnProperty('defaultValue')) {
      return fieldInfo[field].defaultValue;
    }
    let defaultValue = '';
    switch (fieldInfo[field].type) {
      case 'boolean': defaultValue = false; break;
      default:
    }
    return defaultValue;
  };

  const initState = (currentUser, profile, personalInfo) => {
    setEmail(currentUser.email);
    setHasSubmitted(false);
    const vals = {};
    Object.keys(fieldInfo).forEach(k => {
      let input = fieldInfo[k].registration ? personalInfo[k] : profile[k];
      vals[k] = input !== undefined ? input : getFieldDefaultValue(k);
    });
    setValues(vals);
  };

  const updateField = (fieldName, value) => {
    const vals = Object.assign({}, values);
    vals[fieldName] = value;
    setValues(vals);
  };

  const onDateOfBirthChange = (date) => {
    updateField('date_of_birth', !!date ? moment(date).format('MM/DD/YYYY') : undefined);
  };

  const onReligionChange = (evt) => {
    evt.preventDefault();
    updateField('religious_identity', evt.target.value);
  };

  const onDietaryPreferenceChange = (evt) => {
    updateField('dietary_preference', evt.target.value);
  };

  const handleGlutenFree = (evt) => {
    updateField('gluten_free', evt.target.value === 'yes');
  };

  const onDietaryAdditionalInfoChange = (evt) => {
    updateField('dietary_additional', evt.target.value);
  };

  const handleFirstJMR = (evt) => {
    updateField('first_jmr', evt.target.value === 'yes');
  };

  const onContactShareChange = (evt) => {
    updateField('contact_share', evt.target.value);
  };

  const onExtraPersonalInfoChange = (evt) => {
    updateField('extra_info', evt.target.value);
  };

  const handleSubmit = (evt) => {
    evt.preventDefault();

    setHasSubmitted(true);

    for (let fieldName in fieldInfo) {
      if (fieldInfo[fieldName].required) {
        const value = values[fieldName];
        if (!value || !value.trim()) {
          return;
        }
      }
    }

    let profileValues = {};
    let personalValues = {};
    Object.keys(fieldInfo).forEach(f => {
      let value = values[f];
      if (typeof value === 'string') {
        value = value.trim();
        if (value.length === 0) {
          value = null;
        }
      } else if (value === undefined) {
        value = null;
      }
      if (fieldInfo[f].registration) {
        personalValues[f] = value;
      } else {
        profileValues[f] = value;
      }
    });
    updateProfile(currentUser, event, profileValues, personalValues);

    const parentUrl = location.pathname.substring(0, location.pathname.lastIndexOf('/'));
    navigate(parentUrl + '/payment');
  };

  const { first_name, last_name, address_1, address_2, city, state, post_code,
          phone, phone_2, emergency_name, emergency_phone, date_of_birth, religious_identity,
          dietary_preference, gluten_free, dietary_additional, first_jmr, contact_share,
          extra_info } = values;

  const saveTwoDigitYearFunc = moment.parseTwoDigitYear;
  moment.parseTwoDigitYear = (yearString) => {
    debugger;
    const year = parseInt(yearString, 10);
    const century = year < 20 ? 2000 : 1900;
    return century + year;
  }
  let dob = !!date_of_birth ? moment(date_of_birth, "MM/DD/YYYY").toDate() : null;
  moment.parseTwoDigitYear = saveTwoDigitYearFunc;

  return (
    <div className="my-3">
      <h3 className="text-center">
        Profile
      </h3>

      <div className="row justify-content-center">
        <div className="col col-md-10">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor='email'>Email</label>
              <input id='email' type='email' className="form-control" value={email} readOnly />
            </div>
            <div className="form-row">
              <ProfileInputField className="col-md-6" id='first_name' label='First Name'
                value={first_name} onChange={updateField} required
                validate={hasSubmitted} invalidText='Please enter your first name'
              />
              <ProfileInputField className="col-md-6" id='last_name' label='Last Name'
                value={last_name} onChange={updateField} required
                validate={hasSubmitted} invalidText='Please enter your last name'
              />
            </div>
            <div className="form-row">
              <ProfileInputField className="col-md-6" id='address_1' label='Address (Line 1)'
                value={address_1} onChange={updateField} required
                validate={hasSubmitted} invalidText='Please enter your address'
              />
              <ProfileInputField className="col-md-6" id='address_2' label='Address (Line 2)'
                value={address_2} onChange={updateField}
              />
            </div>
            <div className="form-row">
              <ProfileInputField className="col-md-6" id='city' label='City'
                value={city} onChange={updateField} required
                validate={hasSubmitted} invalidText='Please enter your city'
              />
              <ProfileInputField className="col-md-3" id='state' label='State'
                value={state} onChange={updateField}
              />
              <ProfileInputField className="col-md-3" id='post_code' label='ZIP'
                value={post_code} onChange={updateField}
              />
            </div>
            <div className="form-row">
              <ProfileInputField className="col-md-6" id='phone' label='Phone'
                value={phone} onChange={updateField} required
                validate={hasSubmitted} invalidText='Please enter your phone number'
              />
              <ProfileInputField className="col-md-6" id='phone_2' label='Alternate Phone'
                value={phone_2} onChange={updateField}
              />
            </div>
            {!isOnline() &&
              <div className="form-row">
                <ProfileInputField className="col-md-6" id='emergency_name' label='Emergency Contact Name'
                  value={emergency_name} onChange={updateField} required
                  validate={hasSubmitted} invalidText='Please enter an emergency contact'
                />
                <ProfileInputField className="col-md-6" id='emergency_phone' label='Emergency Contact Phone'
                  value={emergency_phone} onChange={updateField} required
                  validate={hasSubmitted} invalidText='Please enter the emergency contact phone number'
                />
              </div>
            }
            <div className="form-row">
              <div className="form-group col-md-6">
                <label htmlFor="date_of_birth">Date of Birth</label>
                <DatePicker id="date_of_birth" className="form-control"
                  selected={dob} onChange={onDateOfBirthChange}
                  showYearDropdown dropdownMode="select" maxDate={moment().endOf('year').toDate()}
                />
              </div>
              <div className="form-group col-md-6">
                <label htmlFor="religious_identity">How do you identify religiously?</label>
                <select className="form-control" id="religious_identity"
                  value={religious_identity}
                  onChange={onReligionChange}
                >
                  {!religious_identity && <option value="" key="none"></option>}
                  {religionInfo.map(ri =>
                    <option value={ri.value} key={ri.value}>
                      {ri.label}
                    </option>
                  )}
                </select>
              </div>
            </div>

            {!isOnline() &&
              <>
                <div className="form-group form-row border-top pt-4 mt-2">
                  <label htmlFor="dietary_preference" className="col-form-label col-md-6">Dietary Preference</label>
                  <select className="form-control col-md-6" id="dietary_preference"
                    value={dietary_preference}
                    onChange={onDietaryPreferenceChange}
                  >
                    {!dietary_preference && <option value="" key="none"></option>}
                    {dietaryInfo.map(di =>
                      <option value={di.value} key={di.value}>
                        {di.label}
                      </option>
                    )}
                  </select>
                </div>
                <div className="form-group form-row">
                  <div className="col-md-6">Are you gluten free?</div>
                  <div className="form-check col-md-6 pl-0">
                    <div className="form-check form-check-inline">
                      <input className="form-check-input" type="radio" name="gluten_free" id="gluten_free-yes" value="yes" checked={gluten_free === true} onChange={handleGlutenFree}/>
                      <label className="form-check-label" htmlFor="gluten_free-yes">Yes</label>
                    </div>
                    <div className="form-check form-check-inline ml-3">
                      <input className="form-check-input" type="radio" name="gluten_free" id="gluten_free-no" value="no" checked={gluten_free === false} onChange={handleGlutenFree}/>
                      <label className="form-check-label" htmlFor="gluten_free-no">No</label>
                    </div>
                  </div>
                </div>
                <div className="form-group form-row">
                  <label htmlFor="dietary_additional" className="col-form-label col-md-6">
                    Do you have additional allergies or food needs?
                  </label>
                  <textarea className="form-control col-md-6" id="dietary_additional" rows="3"
                    value={dietary_additional}
                    onChange={onDietaryAdditionalInfoChange}
                  />
                </div>
              </>
            }

            <div className="form-group form-row border-top pt-4 mt-2">
              <div className="col-md-6">This is my first Jewish Men&#39;s Retreat</div>
                <div className="form-check col-md-6 pl-0">
                <div className="form-check form-check-inline">
                  <input className="form-check-input" type="radio" name="first_jmr" id="first_jmr-yes" value="yes" checked={first_jmr === true} onChange={handleFirstJMR}/>
                  <label className="form-check-label" htmlFor="first_jmr-yes">Yes</label>
                </div>
                <div className="form-check form-check-inline ml-3">
                  <input className="form-check-input" type="radio" name="first_jmr" id="first_jmr-no" value="no" checked={first_jmr === false} onChange={handleFirstJMR}/>
                  <label className="form-check-label" htmlFor="first_jmr-no">No</label>
                </div>
              </div>
            </div>
            <div className="form-group form-row d-none">
              <label htmlFor="contact_share" className="col-form-label col-md-6">
                A roster of participants will be shared with all attendees after the retreat.
                Please select which information you would like to share
              </label>
              <select className="form-control col-md-6 mt-2" id="contact_share"
                value={contact_share}
                onChange={onContactShareChange}
              >
                {contactShareInfo.map(cs =>
                  <option value={cs.value} key={cs.value}>
                    {cs.label}
                  </option>
                )}
              </select>
            </div>
            <div className="form-group form-row">
              <label htmlFor="extra_info" className="col-form-label col-md-6">
                What else can you tell us that will allow us to welcome you properly?
              </label>
              <textarea className="form-control col-md-6" id="extra_info" rows="3"
                value={extra_info}
                onChange={onExtraPersonalInfoChange}
              />
            </div>

            <button type='submit' className="btn btn-success float-right">Continue</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;

import React, { Component } from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import 'react-datepicker/dist/react-datepicker.css';
import ProfileInputField from './ProfileInputField';

class Profile extends Component {
  constructor(props) {
    super(props);

    this.fieldInfo = {
      first_name: {required: true},
      last_name: {required: true},
      address_1: {required: true},
      address_2: {},
      city: {required: true},
      state: {},
      post_code: {},
      phone: {required: true},
      phone_2: {},
      emergency_name: {required: true},
      emergency_phone: {required: true},
      date_of_birth: {},
      religious_identity: {},
      dietary_preference: {},
      gluten_free: {type: 'boolean'},
      dietary_additional: {},
      first_jmr: {registration: true, type: 'boolean'},
      contact_share: {defaultValue: 'name_email_phone'},
      extra_info: {registration: true}
    };

    this.religionInfo = [
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

    this.dietaryInfo = [
      {value: "omnivore", label: "Omnivore"},
      {value: "pescatarian", label: "Pescatarian"},
      {value: "vegetarian", label: "Vegetarian"},
      {value: "vegan", label: "Vegan"}
    ];

    this.contactShareInfo = [
      {value: "name_email_phone", label: "Name, Email, Phone"},
      {value: "name_email", label: "Name, Email"},
      {value: "name", label: "Name only"},
      {value: "none", label: "Do not include me on the roster"}
    ];

    let state = {email: ''};
    Object.keys(this.fieldInfo).forEach(f => {
      state[f] = this.getFieldDefaultValue(f);
    });
    this.state = state;
  }

  componentWillMount() {
    const { profile, personalInfo, currentUser } = this.props;
    if (!!profile && !!currentUser) {
      this.initState(currentUser, profile, personalInfo);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.profile && !!nextProps.profile) {
      this.initState(nextProps.currentUser, nextProps.profile, nextProps.personalInfo);
    }
  }

  getFieldDefaultValue = (field) => {
    if (this.fieldInfo[field].hasOwnProperty('defaultValue')) {
      return this.fieldInfo[field].defaultValue;
    }
    let defaultValue = '';
    switch (this.fieldInfo[field].type) {
      case 'boolean': defaultValue = false; break;
      default:
    }
    return defaultValue;
  }

  initState = (currentUser, profile, personalInfo) => {
    let newState = {
      email: currentUser.email,
      hasSubmitted: false
    }
    Object.keys(this.fieldInfo).forEach(k => {
      let input = this.fieldInfo[k].registration ? personalInfo[k] : profile[k];
      newState[k] = input !== undefined ? input : this.getFieldDefaultValue(k);
    });
    this.setState(newState);
  }

  updateField = (fieldName, value) => {
    let updateState = {};
    updateState[fieldName] = value;
    this.setState(updateState);
  }

  onDateOfBirthChange = (date) => {
    this.setState({
      date_of_birth: !!date ? date.format('MM/DD/YYYY') : undefined
    });
  }

  onReligionChange = (evt) => {
    evt.preventDefault();
    this.setState({
      religious_identity: evt.target.value
    });
  }

  onDietaryPreferenceChange = (evt) => {
    this.setState({
      dietary_preference: evt.target.value
    });
  }

  onToggleGlutenFree = () => {
    this.setState({gluten_free: !this.state.gluten_free});
  }

  onDietaryAdditionalInfoChange = (evt) => {
    this.setState({
      dietary_additional: evt.target.value
    });
  }

  onToggleFirstJMR = () => {
    this.setState({first_jmr: !this.state.first_jmr});
  }

  onContactShareChange = (evt) => {
    this.setState({
      contact_share: evt.target.value
    });
  }

  onExtraPersonalInfoChange = (evt) => {
    this.setState({
      extra_info: evt.target.value
    });
  }

  handleSubmit = (evt) => {
    evt.preventDefault();
    const { currentUser, event, updateProfile, history, match } = this.props;

    this.setState({hasSubmitted: true});

    for (let fieldName in this.fieldInfo) {
      if (this.fieldInfo[fieldName].required) {
        const value = this.state[fieldName];
        if (!value || !value.trim()) {
          return;
        }
      }
    }

    let profileValues = {};
    let personalValues = {};
    Object.keys(this.fieldInfo).forEach(f => {
      let value = this.state[f];
      if (typeof value === 'string') {
        value = value.trim();
        if (value.length === 0) {
          value = null;
        }
      } else if (value === undefined) {
        value = null;
      }
      if (this.fieldInfo[f].registration) {
        personalValues[f] = value;
      } else {
        profileValues[f] = value;
      }
    });
    updateProfile(currentUser, event, profileValues, personalValues);

    const parentUrl = match.url.substring(0, match.url.lastIndexOf('/'));
    history.push(parentUrl + '/payment');
  }

  render() {
    const { email, first_name, last_name, address_1, address_2, city, state, post_code,
            phone, phone_2, emergency_name, emergency_phone, date_of_birth, religious_identity,
            dietary_preference, gluten_free, dietary_additional, first_jmr, contact_share,
            extra_info, hasSubmitted } = this.state || {};

    const saveTwoDigitYearFunc = moment.parseTwoDigitYear;
    moment.parseTwoDigitYear = (yearString) => {
      const year = parseInt(yearString, 10);
      const century = year < 20 ? 2000 : 1900;
      return century + year;
    }
    let dob = !!date_of_birth ? moment(date_of_birth, "MM/DD/YYYY") : null;
    moment.parseTwoDigitYear = saveTwoDigitYearFunc;

    return (
      <div className="my-3">
        <h3 className="text-center">
          Profile
        </h3>

        <div className="row justify-content-center">
          <div className="col col-md-10">
            <form onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label htmlFor='email'>Email</label>
                <input id='email' type='email' className="form-control" value={email} readOnly />
              </div>
              <div className="form-row">
                <ProfileInputField className="col-md-6" id='first_name' label='First Name'
                  value={first_name} onChange={this.updateField} required
                  validate={hasSubmitted} invalidText='Please enter your first name'
                />
                <ProfileInputField className="col-md-6" id='last_name' label='Last Name'
                  value={last_name} onChange={this.updateField} required
                  validate={hasSubmitted} invalidText='Please enter your last name'
                />
              </div>
              <div className="form-row">
                <ProfileInputField className="col-md-6" id='address_1' label='Address (Line 1)'
                  value={address_1} onChange={this.updateField} required
                  validate={hasSubmitted} invalidText='Please enter your address'
                />
                <ProfileInputField className="col-md-6" id='address_2' label='Address (Line 2)'
                  value={address_2} onChange={this.updateField}
                />
              </div>
              <div className="form-row">
                <ProfileInputField className="col-md-6" id='city' label='City'
                  value={city} onChange={this.updateField} required
                  validate={hasSubmitted} invalidText='Please enter your city'
                />
                <ProfileInputField className="col-md-3" id='state' label='State'
                  value={state} onChange={this.updateField}
                />
                <ProfileInputField className="col-md-3" id='post_code' label='ZIP'
                  value={post_code} onChange={this.updateField}
                />
              </div>
              <div className="form-row">
                <ProfileInputField className="col-md-6" id='phone' label='Phone'
                  value={phone} onChange={this.updateField} required
                  validate={hasSubmitted} invalidText='Please enter your phone number'
                />
                <ProfileInputField className="col-md-6" id='phone_2' label='Alternate Phone'
                  value={phone_2} onChange={this.updateField}
                />
              </div>
              <div className="form-row">
                <ProfileInputField className="col-md-6" id='emergency_name' label='Emergency Contact Name'
                  value={emergency_name} onChange={this.updateField} required
                  validate={hasSubmitted} invalidText='Please enter an emergency contact'
                />
                <ProfileInputField className="col-md-6" id='emergency_phone' label='Emergency Contact Phone'
                  value={emergency_phone} onChange={this.updateField} required
                  validate={hasSubmitted} invalidText='Please enter the emergency contact phone number'
                />
              </div>
              <div className="form-row">
                <div className="form-group col-md-6">
                  <label htmlFor="date_of_birth">Date of Birth</label>
                  <DatePicker id="date_of_birth" className="form-control"
                    selected={dob} onChange={this.onDateOfBirthChange}
                    showYearDropdown dropdownMode="select" maxDate={moment().endOf('year')}
                  />
                </div>
                <div className="form-group col-md-6">
                  <label htmlFor="religious_identity">How do you identify religiously?</label>
                  <select className="form-control" id="religious_identity"
                    value={religious_identity}
                    onChange={this.onReligionChange}
                  >
                    {!religious_identity && <option value="" key="none"></option>}
                    {this.religionInfo.map(ri =>
                      <option value={ri.value} key={ri.value}>
                        {ri.label}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group row border-top pt-4 mt-2">
                <label htmlFor="dietary_preference" className="col-form-label col-md-6">Dietary Preference</label>
                <select className="form-control col-md-6" id="dietary_preference"
                  value={dietary_preference}
                  onChange={this.onDietaryPreferenceChange}
                >
                  {!dietary_preference && <option value="" key="none"></option>}
                  {this.dietaryInfo.map(di =>
                    <option value={di.value} key={di.value}>
                      {di.label}
                    </option>
                  )}
                </select>
              </div>
              <div className="form-group row">
                <div className="col-md-6">Are you gluten free?</div>
                <div className="col-md-6 pl-0">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="gluten_free"
                      checked={gluten_free} onChange={this.onToggleGlutenFree}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="dietary_additional" className="col-form-label col-md-6">
                  Do you have additional allergies or food needs?
                </label>
                <textarea className="form-control col-md-6" id="dietary_additional" rows="3"
                  value={dietary_additional}
                  onChange={this.onDietaryAdditionalInfoChange}
                />
              </div>

              <div className="form-group row border-top pt-4 mt-2">
                <div className="col-md-6">Will this be your first JMR?</div>
                <div className="col-md-6 pl-0">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="first_jmr"
                      checked={first_jmr} onChange={this.onToggleFirstJMR}
                    />
                  </div>
                </div>
              </div>
              <div className="form-group row">
                <label htmlFor="contact_share" className="col-form-label col-md-6">
                  A roster of participants will be shared with all attendees after the retreat.
                  Please select which information you would like to share
                </label>
                <select className="form-control col-md-6 mt-2" id="contact_share"
                  value={contact_share}
                  onChange={this.onContactShareChange}
                >
                  {this.contactShareInfo.map(cs =>
                    <option value={cs.value} key={cs.value}>
                      {cs.label}
                    </option>
                  )}
                </select>
              </div>
              <div className="form-group row">
                <label htmlFor="extra_info" className="col-form-label col-md-6">
                  What else can you tell us that will allow us to welcome you properly?
                </label>
                <textarea className="form-control col-md-6" id="extra_info" rows="3"
                  value={extra_info}
                  onChange={this.onExtraPersonalInfoChange}
                />
              </div>

              <button type='submit' className="btn btn-success float-right">Continue</button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

export default Profile;

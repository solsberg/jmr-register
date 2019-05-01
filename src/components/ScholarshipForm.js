import React from 'react';

class ScholarshipForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isYML: false,
      learn: '',
      relationships: '',
      gain: '',
      contribution: '',
      statement: '',
      support: ''
    };
  }

  componentWillMount() {
    const { scholarship } = this.props;
    if (!!scholarship) {
      this.initState(scholarship);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.scholarship && !!nextProps.scholarship) {
      this.initState(nextProps.scholarship);
    }
  }

  initState = (scholarship) => {
    if (scholarship.type === 'yml') {
      this.setState({
        isYML: true,
        learn: scholarship.learn || '',
        relationships: scholarship.relationships || '',
        gain: scholarship.gain || ''
      });
    } else {
      this.setState({
        isYML: false,
        contribution: scholarship.contribution || '',
        statement: scholarship.statement || '',
        support: scholarship.support || ''
      });
    }
  }


  onToggleYML = () => {
    this.setState({isYML: !this.state.isYML});
  }

  onUpdateLearn = (evt) => {
    this.setState({
      learn: evt.target.value
    });
  }

  onUpdateRelationships = (evt) => {
    this.setState({
      relationships: evt.target.value
    });
  }

  onUpdateGain = (evt) => {
    this.setState({
      gain: evt.target.value
    });
  }

  onUpdateContribution = (evt) => {
    this.setState({
      contribution: evt.target.value
    });
  }

  onUpdateStatementOfNeed = (evt) => {
    this.setState({
      statement: evt.target.value
    });
  }

  onUpdateSupport = (evt) => {
    this.setState({
      support: evt.target.value
    });
  }

  onApply = (evt) => {
    const { isYML, learn, relationships, gain, contribution, statement, support } = this.state;
    const { event, currentUser, applyForScholarship } = this.props;

    evt.preventDefault();
    applyForScholarship(event, currentUser, isYML ? {
      type: "yml",
      learn,
      relationships,
      gain
    } : {
      type: "aid",
      contribution,
      statement,
      support
    });
  }

  renderYMLForm = () => {
    const { learn, relationships, gain } = this.state;
    const { event } = this.props;
    return (
      <div>
        <p>
          The Jewish Men’s Retreat Fellowship Program for Young Men is for adult men ages eighteen through thirty-five who demonstrate an interest in attending the annual Jewish Men’s Retreat, now in its 28th year.
          JMR offers men an energetic weekend which weaves together spirited conversation, large and small group discussions, joyous worship services, text study, music, movement and laughter.
          We welcome all men to our community for this exciting weekend- whether gay, bisexual, straight or transgendered, younger or older, in relationship or not, and all expressions of Jewish observance.
        </p>
        <p>Eligibility Requirements:</p>
        <ul>
          <li>18 to 35 years of age</li>
          <li>Have an interest in exploring men’s issues and Judaism</li>
          <li>Have not attended more than one prior Jewish Men's Retreat</li>
          <li>Commit to attending the entire JMR28 program (mid-afternoon Friday, October 25, 2019, through the closing circle on Sunday, October 27, 2019, in the early afternoon).</li>
          <li>Complete the JMR Fellows Program application</li>
        </ul>

        <p>Benefits:</p>
        <ul>
          <li>Full financial support to attend JMR28 - October 25-27, 2019 (for first time attendee)</li>
          <li>50% financial support to attend JMR28 - October 25-27, 2019 (for second time attendee)</li>
          <li>Assistance in securing transportation to the event</li>
          <li>A pre-retreat call to prepare for the retreat</li>
          <li>Support to participate in the planning of future JMRs</li>
        </ul>

        <p class="small">
          The Jewish Men’s Retreat Fellowship Program for Young Men is supported by Jewish Men’s Retreat participants and others who have donated money Menschwork, Inc. for this purpose.
          As such, the availability of fellowships is limited in any given year.  To maximize the opportunity to receive a fellowship, we encourage you to submit the scholarship application no later than June 30, 2019.
          All applications received by such date will receive priority consideration (regardless of the actual date the application was received). Preference will be given to first time JMR attendees.
          Applicants will be notified of the decision no later than July 15, 2019. Applications received after June 30, 2019 will be considered on a funds-available basis in the order in which the application is received and notified within twenty-one days after the application is received.
        </p>

        <p className="small">
          All information provided will be maintained in confidence.
        </p>

        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="yml-relationships">In what ways would you like to expand your relationships with other Jewish men?</label>
            <textarea id="yml-relationships" className="form-control" rows="8"
              value={relationships} onChange={this.onUpdateRelationships}
            />
          </div>
        </div>
        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="yml-gain">What might you hope to gain from attending {event.title}?</label>
            <textarea id="yml-gain" className="form-control" rows="8"
              value={gain} onChange={this.onUpdateGain}
            />
          </div>
        </div>
        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="yml-learn">How did you learn about the Jewish Men’s Retreat Fellowship Program for Young Men?</label>
            <textarea id="yml-learn" className="form-control" rows="8"
              value={learn} onChange={this.onUpdateLearn}
            />
          </div>
        </div>
      </div>
    );
  }

  renderAidForm = () => {
    const { contribution, statement, support } = this.state;
    return (
      <div>
        <p className="small">
          The scholarship program is supported by Jewish Men’s Retreat participants and others who have donated money to Menschwork, Inc. for this purpose.
          As such, the availability of scholarship funds is limited in any given year.
          To maximize the opportunity to receive a scholarship, we encourage you to submit the scholarship application no later than June 30, 2019.
          All applications received by such date will receive priority consideration (regardless of the actual date the application was received).
          Applicants will be notified of the decision no later than July 15, 2019.
          Applications received after June 30, 2019 will be considered on a funds-available basis in the order in which the application is received and notified within twenty-one days after the application is received.
        </p>
        <p className="small">
          The scholarship program works on an honor system and Menschwork, Inc. will not request supporting financial documents.  All information provided will be maintained in confidence.
        </p>

        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="aid-need">Please provide a brief statement of your current circumstances that prevent you from paying the full registration fee.</label>
            <textarea id="aid-need" className="form-control" rows="6"
              value={statement} onChange={this.onUpdateStatementOfNeed}
            />
          </div>
        </div>
        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="aid-contrib">How much can you reasonably pay towards the retreat cost?</label>
            <textarea id="aid-contrib" className="form-control" rows="1"
              value={contribution} onChange={this.onUpdateContribution}
            />
          </div>
        </div>
        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="aid-support">Are you in a position to ask an individual or community organization (i.e. synagogue, Jewish federation, JCC, etc.) to help sponsor your attendance at JMR28?  If yes, Menschwork, Inc. will provide a letter on your behalf about the retreat and the benefits it offers to you and your Jewish community.</label>
            <textarea id="aid-support" className="form-control" rows="6"
              value={support} onChange={this.onUpdateSupport}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { isYML } = this.state;
    const { scholarship } = this.props;

    let submitted = !!scholarship && scholarship.submitted;

    return (
      <div className="my-4 offset-md-1 col-md-10">
        <h4>Scholarship Application Form</h4>

        <p>
          Menschwork, Inc. endeavors to include all men who wish to attend the Jewish Men's Retreat and offers a scholarship programs for:
          a) young men (ages 18-35) who are attending their first or second retreat (through the Jewish Men’s Retreat Fellowship Program for Young Men) and
          b) for men over age 35 who demonstrate need for financial assistance.
        </p>

        <form onSubmit={this.onApply}>
          <div className="form-check my-3">
            <input className="form-check-input" type="checkbox" id="yml"
              checked={isYML}
              onChange={this.onToggleYML}
            />
            <label className="form-check-label" htmlFor="yml">
              I am aged 18-35 and am attending my first or second retreat.
            </label>
          </div>

          {isYML ? this.renderYMLForm() : this.renderAidForm()}

          <button type='submit' className="btn btn-success">
            Apply
          </button>
        </form>
        <p className="mt-3 font-italic">By clicking Apply, I affirm the accuracy of the information contained within this application.</p>
        {submitted &&
          <div className="row justify-content-center">
            <div className="alert alert-info mt-3 col-10" role="alert">
              <p className="text-center p-3">
                We have received your application. We will be back in touch after we decide about the disbursements.
              </p>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default ScholarshipForm;

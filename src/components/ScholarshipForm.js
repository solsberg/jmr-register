import React from 'react';

class ScholarshipForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isYML: false,
      journey: '',
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
        journey: scholarship.journey || '',
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

  onUpdateJourney = (evt) => {
    this.setState({
      journey: evt.target.value
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
    const { isYML, journey, relationships, gain, contribution, statement, support } = this.state;
    const { event, currentUser, applyForScholarship } = this.props;

    evt.preventDefault();
    applyForScholarship(event, currentUser, isYML ? {
      type: "yml",
      journey,
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
    const { journey, relationships, gain } = this.state;
    const { event } = this.props;
    return (
      <div>
        <p>
          To apply for a JMR Fellowship, you must be 18 to 35 years of age, have an interest in exploring men’s issues and Judaism and a willingness to attend the entire weekend of activities.
        </p>
        <p>JMR Fellows will receive:</p>
        <ul>
          <li>Full financial support to attend the JMR weekend (or 50% support for 2nd time participants)</li>
          <li>Assistance in securing transportation to the event</li>
          <li>A JMR mentor who will be available before and during the JMR</li>
          <li>Support to participate in the planning of future JMRs</li>
        </ul>

        <p>Please provide brief answers to the following three questions:</p>

        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="yml-journey">Briefly describe your personal journey as a young Jewish man?</label>
            <textarea id="yml-journey" className="form-control" rows="8"
              value={journey} onChange={this.onUpdateJourney}
            />
          </div>
        </div>
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
            <label htmlFor="yml-gain">What might you hope to gain from attending {event.title} this year?</label>
            <textarea id="yml-gain" className="form-control" rows="8"
              value={gain} onChange={this.onUpdateGain}
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
        <p>Please provide brief answers to the following three questions:</p>

        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="aid-contrib">How much can you afford to pay?</label>
            <textarea id="aid-contrib" className="form-control" rows="1"
              value={contribution} onChange={this.onUpdateContribution}
            />
            <small id="contribHelp" className="form-text text-muted">How much can you comfortably contribute towards the retreat cost?</small>
          </div>
        </div>
        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="aid-need">Statement of Need</label>
            <textarea id="aid-need" className="form-control" rows="6"
              value={statement} onChange={this.onUpdateStatementOfNeed}
            />
            <small id="needHelp" className="form-text text-muted">Please provide give a brief statement of your current life circumstances that prevent you from paying the full amount. Note that we will not ask for a legal statement of any sort.</small>
          </div>
        </div>
        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="aid-support">Other Support Available?</label>
            <textarea id="aid-support" className="form-control" rows="6"
              value={support} onChange={this.onUpdateSupport}
            />
            <small id="supportHelp" className="form-text text-muted">Are you in a position to ask an individual or entity to sponsor your attendance and/or cover the difference between what you can afford and the full cost? If yes, we will be willing to provide a letter on your behalf about the potential benefits of the program to you and your community.</small>
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
          We want to include all men who wish to attend the Jewish Men&#39;s Retreat and especially young men, so we offer scholarships for those who need financial assistance.
          Over the years participants have donated money to support men who can&#39;t afford the full price of the retreat.
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
        <p className="mt-3 font-italic">NOTE: We will insure that your responses to these questions are protected.</p>
        {submitted &&
          <div className="row justify-content-center">
            <div className="alert alert-info mt-3 col-10" role="alert">
              <p className="text-center p-3">
                We have received your application. We will be back in touch after we decide about the disbursements in early September.
              </p>
            </div>
          </div>
        }
      </div>
    )
  }
}

export default ScholarshipForm;

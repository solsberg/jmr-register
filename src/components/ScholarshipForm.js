import React, { useEffect, useState, useMemo } from 'react';
import get from 'lodash/get';
import moment from 'moment';
import { useApplication } from '../providers/ApplicationProvider';
import { useRegistration } from '../providers/RegistrationProvider';

const ScholarshipForm = ({ event, currentUser }) => {
  const [isYML, setIsYML] = useState(false);
  const [learn, setLearn] = useState('');
  const [relationships, setRelationships] = useState('');
  const [gain, setGain] = useState('');
  const [contribution, setContribution] = useState('');
  const [statement, setStatement] = useState('');
  const [support, setSupport] = useState('');
  const [dirty, setDirty] = useState(false);
  const [applicationDate, setApplicationDate] = useState(null);
  const { registration, applyForScholarship } = useRegistration();
  const { serverTimestamp } = useApplication();

  const scholarship = useMemo(
    () => get(registration, "scholarship"),
    [ registration ]
  );

  useEffect(() => {
    if (!!scholarship) {
      setIsYML(scholarship.type === 'yml');
      setApplicationDate(scholarship.created_at);
      if (isYML) {
        setLearn(scholarship.learn || '');
        setRelationships(scholarship.relationships || '');
        setGain(scholarship.gain || '');
      } else {
        setContribution(scholarship.contribution || '');
        setStatement(scholarship.statement || '');
        setSupport(scholarship.support || '');
      }
    }
  }, [ scholarship, isYML ]);

  const onToggleYML = () => {
    setIsYML(!isYML);
  };

  const onUpdateLearn = (evt) => {
    setLearn(evt.target.value);
    setDirty(true);
  };

  const onUpdateRelationships = (evt) => {
    setRelationships(evt.target.value);
    setDirty(true);
  };

  const onUpdateGain = (evt) => {
    setGain(evt.target.value);
    setDirty(true);
  };

  const onUpdateContribution = (evt) => {
    setContribution(evt.target.value);
    setDirty(true);
  };

  const onUpdateStatementOfNeed = (evt) => {
    setStatement(evt.target.value);
    setDirty(true);
  };

  const onUpdateSupport = (evt) => {
    setSupport(evt.target.value);
    setDirty(true);
  };

  const onApply = (evt) => {
    evt.preventDefault();
    setDirty(false);
    const appTime = moment(applicationDate || serverTimestamp).valueOf();
    debugger;
    applyForScholarship(event, currentUser, isYML ? {
      type: "yml",
      created_at: appTime,
      learn,
      relationships,
      gain
    } : {
      type: "aid",
      created_at: appTime,
      contribution,
      statement,
      support
    });
  };

  const renderYMLForm = () => {
    return (
      <div>
        <p>
          The Jewish Men’s Retreat Fellowship Program for Young Men is for adult men ages eighteen through thirty-five who demonstrate an interest in attending the annual Jewish Men’s Retreat, now in its 33rd year.
          JMR offers men an energetic weekend which weaves together spirited conversation, large and small group discussions, joyous worship services, text study, music, movement and laughter.
          We welcome all men to our community for this exciting weekend- whether gay, bisexual, straight or transgendered, younger or older, in relationship or not, and all expressions of Jewish observance.
        </p>
        <p>Eligibility Requirements:</p>
        <ul>
          <li>18 to 35 years of age</li>
          <li>Have an interest in exploring men’s issues and Judaism</li>
          <li>Have not attended more than one prior Jewish Men's Retreat</li>
          <li>Commit to attending the entire JMR33 program (4pm Friday, November 8, 2024, through the closing circle on Sunday afternoon, November 10, 2024).</li>
          <li>Complete the JMR Fellows Program application</li>
        </ul>

        <p>Benefits:</p>
        <ul>
          <li>Full financial support to attend JMR33 - November 8-10, 2024 (for first time attendee)</li>
          <li>50% financial support to attend JMR33 - November 8-10, 2024 (for second time attendee)</li>
          <li>Assistance in securing transportation to the event</li>
          <li>A pre-retreat call to prepare for the retreat</li>
          <li>Support to participate in the planning of future JMRs</li>
        </ul>

        <p className="small">
          The Jewish Men’s Retreat Fellowship Program for Young Men is supported by Jewish Men’s Retreat participants and others who have donated money Menschwork, Inc. for this purpose.
          As such, the availability of fellowships is limited in any given year.  To maximize the opportunity to receive a fellowship, we encourage you to submit the scholarship application no later than June 15, 2024.
          All applications received by such date will receive priority consideration (regardless of the actual date the application was received). Preference will be given to first time JMR attendees.
          Applicants will be notified of the decision no later than July 1, 2024. Applications received after June 15, 2024 will be considered on a funds-available basis in the order in which the application is received and notified within twenty-one days after the application is received.
        </p>

        <p className="small">
          All information provided will be maintained in confidence.
        </p>

        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="yml-relationships">In what ways would you like to expand your relationships with other Jewish men?</label>
            <textarea id="yml-relationships" className="form-control" rows="8"
              value={relationships} onChange={onUpdateRelationships}
            />
          </div>
        </div>
        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="yml-gain">What might you hope to gain from attending {event.title}?</label>
            <textarea id="yml-gain" className="form-control" rows="8"
              value={gain} onChange={onUpdateGain}
            />
          </div>
        </div>
        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="yml-learn">How did you learn about the Jewish Men’s Retreat Fellowship Program for Young Men?</label>
            <textarea id="yml-learn" className="form-control" rows="8"
              value={learn} onChange={onUpdateLearn}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderAidForm = () => {
    return (
      <div>
        <p className="small">
          The scholarship program is supported by Jewish Men’s Retreat participants and others who have donated money to Menschwork, Inc. for this purpose.
          As such, the availability of scholarship funds is limited in any given year.
          To maximize the opportunity to receive a scholarship, we encourage you to submit the scholarship application no later than June 15, 2024.
          All applications received by such date will receive priority consideration (regardless of the actual date the application was received).
          Applicants will be notified of the decision no later than July 1, 2024.
          Applications received after June 15, 2024 will be considered on a funds-available basis in the order in which the application is received and notified within twenty-one days after the application is received.
        </p>
        <p className="small">
          The scholarship program works on an honor system and Menschwork, Inc. will not request supporting financial documents.  All information provided will be maintained in confidence.
        </p>

        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="aid-need">Please provide a brief statement of your current circumstances that prevent you from paying the full registration fee.</label>
            <textarea id="aid-need" className="form-control" rows="6"
              value={statement} onChange={onUpdateStatementOfNeed}
            />
          </div>
        </div>
        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="aid-contrib">How much can you reasonably pay towards the retreat cost?</label>
            <textarea id="aid-contrib" className="form-control" rows="1"
              value={contribution} onChange={onUpdateContribution}
            />
          </div>
        </div>
        <div className="form-row m-2">
          <div className="form-group w-100">
            <label htmlFor="aid-support">Are you in a position to ask an individual or community organization (i.e. synagogue, Jewish federation, JCC, etc.) to help sponsor your attendance at JMR33?  If yes, Menschwork, Inc. will provide a letter on your behalf about the retreat and the benefits it offers to you and your Jewish community.</label>
            <textarea id="aid-support" className="form-control" rows="6"
              value={support} onChange={onUpdateSupport}
            />
          </div>
        </div>
      </div>
    );
  };

  const submitted = !!scholarship && scholarship.submitted && !dirty;
  const isYMLSoldOut = get(event, `soldOut.yml`, false) && get(scholarship, 'type') !== 'yml';
  const ymlLabel = "I am aged 18-35 and am attending my first or second retreat.";

  return (
    <div className="my-4 offset-md-1 col-md-10">
      <h4>Scholarship Application Form</h4>

      <p>
        Menschwork, Inc. endeavors to include all men who wish to attend the Jewish Men's Retreat and offers a scholarship programs for:
        a) young men (ages 18-35) who are attending their first or second retreat (through the Jewish Men’s Retreat Fellowship Program for Young Men) and
        b) for men over age 35 who demonstrate need for financial assistance.
      </p>

      <form onSubmit={onApply}>
        <div className="form-check my-3">
          <input className="form-check-input" type="checkbox" id="yml"
            checked={isYML}
            disabled={isYMLSoldOut}
            onChange={onToggleYML}
          />
          <label className="form-check-label" htmlFor="yml">
            {isYMLSoldOut ? <s>{ymlLabel}</s> : ymlLabel}
          </label>
          {isYMLSoldOut && <em className="text-warning ml-2">No longer available</em>}
        </div>

        {isYML ? renderYMLForm() : renderAidForm()}

        <button type='submit' className="btn btn-success" disabled={!dirty}>
          Apply
        </button>
      </form>
      <p className="mt-3 font-italic">By clicking Apply, I affirm the accuracy of the information contained within this application.</p>
      {submitted &&
        <div className="row justify-content-center">
          <div className="alert alert-info mt-3 col-10" role="alert">
            <p className="text-center p-3">
              We have received your application. We will be back in touch after we have reviewed the applications and determine the level of financial aid that we will be able to offer.
            </p>
          </div>
        </div>
      }
    </div>
  )
};

export default ScholarshipForm;

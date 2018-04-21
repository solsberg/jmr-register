import React, { Component } from 'react';
import SignInContainer from '../containers/SignInContainer';

class RoomChoice extends Component {
  componentWillMount() {
    this.setState({
      submitted: false
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.currentUser && !!nextProps.currentUser && this.state.submitted) {
      this.apply(nextProps.currentUser);
    }
  }

  onSelectRoom = (evt) => {
    this.setState({
      roomChoice: evt.target.value
    });
  }

  handleSubmit = (evt) => {
    if (evt) {
      evt.preventDefault();
    }
    this.setState({
      submitted: true
    });
    if (this.props.currentUser) {
      this.apply();
    }
  }

  apply = (currentUser) => {
    const { history, match } = this.props;

    //TODO store room choice

    history.push(match.url + '/profile');
  }

  render() {
    if (this.state.submitted && !this.props.currentUser) {
      return (
        <SignInContainer />
      );
    }

    const { roomChoice } = this.state;
    return (
      <div>
        Welcome to JMR Registration
        <form onSubmit={this.handleSubmit}>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="roomChoice" id="rc-dormitory" value="dormitory" checked={roomChoice === 'dormitory'} onChange={this.onSelectRoom} />
            <label className="form-check-label" htmlFor="rc-dormitory">
              Dormitory
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="roomChoice" id="rc-basic" value="basic" checked={roomChoice === 'basic'} onChange={this.onSelectRoom} />
            <label className="form-check-label" htmlFor="rc-basic">
              Basic
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="roomChoice" id="rc-standard" value="standard" checked={roomChoice === 'standard'} onChange={this.onSelectRoom} />
            <label className="form-check-label" htmlFor="rc-standard">
              Standard
            </label>
          </div>
          <div className="form-check">
            <input className="form-check-input" type="radio" name="roomChoice" id="rc-plus" value="plus" checked={roomChoice === 'plus'} onChange={this.onSelectRoom} />
            <label className="form-check-label" htmlFor="rc-plus">
              Standard Plus
            </label>
          </div>
          <button type='submit' className="btn btn-success mr-5">Continue</button>
        </form>
      </div>
    );
  }
}

export default RoomChoice;

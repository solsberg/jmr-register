import React, { Component } from 'react';
import SignInContainer from '../containers/SignInContainer';

class RoomChoice extends Component {
  componentWillMount() {
    this.setState({
      submitted: false,
      roomChoice: this.props.order.roomChoice
    });
  }

  componentWillReceiveProps(nextProps) {
    const { order, currentUser } = this.props;
    console.log("wrp: ", nextProps);
    if (!order.roomChoice && !!nextProps.order.roomChoice) {
      this.setState({
        roomChoice: nextProps.order.roomChoice
      });
    }
    if (!currentUser && !!nextProps.currentUser && this.state.submitted) {
      this.apply(nextProps.currentUser);
    }
    if (!!currentUser && !nextProps.currentUser) {
      //clear current state when signing out
      this.setState({
        roomChoice: null
      });
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
      this.apply(this.props.currentUser);
    }
  }

  apply = (currentUser) => {
    const { history, match, event, applyRoomChoice } = this.props;

    applyRoomChoice(event, currentUser, this.state.roomChoice);

    history.push(match.url + '/profile');
  }

  renderRoomChoiceOption = (roomType, label) => {
    const { roomChoice } = this.state;
    const { madePayment } = this.props;

    return (
      <div className="form-check">
        <input className="form-check-input" type="radio" name="roomChoice"
          id={`rc-${roomType}`} value={roomType} checked={roomChoice === roomType} disabled={madePayment}
          onChange={this.onSelectRoom} />
        <label className="form-check-label" htmlFor={`rc-${roomType}`}>
          {label}
        </label>
      </div>
    );
  }

  render() {
    if (this.state.submitted && !this.props.currentUser) {
      return (
        <SignInContainer />
      );
    }

    return (
      <div>
        Welcome to JMR Registration
        <form onSubmit={this.handleSubmit}>
          {this.renderRoomChoiceOption('dormitory', 'Dormitory')}
          {this.renderRoomChoiceOption('basic', 'Basic')}
          {this.renderRoomChoiceOption('standard', 'Standard')}
          {this.renderRoomChoiceOption('plus', 'Standard Plus')}
          <button type='submit' className="btn btn-success mr-5">Continue</button>
        </form>
      </div>
    );
  }
}

export default RoomChoice;

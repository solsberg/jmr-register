import React, { Component } from 'react';
import classNames from 'classnames';
import { formatMoney, isEarlyDiscountAvailable } from '../lib/utils';
import SignInContainer from '../containers/SignInContainer';
import LodgingCard from './LodgingCard';
import ROOM_DATA from '../roomData.json';
import { LOADED } from '../constants';
import './RoomChoice.css';

class RoomChoice extends Component {
  componentWillMount() {
    this.setState({
      submitted: false,
      existingRegistration: false,
      waitingForRegistration: false,
      roomChoice: this.props.order.roomChoice,
      singleSupplement: !!this.props.order.singleSupplement,
      refrigeratorSelected: !!this.props.order.refrigerator,
      thursdayNight: !!this.props.order.thursdayNight,
      roommate: this.props.order.roommate || ''
    });
  }

  componentWillReceiveProps(nextProps) {
    const { order, currentUser } = this.props;
    if (!order.roomChoice && !!nextProps.order.roomChoice) {
      this.setState({
        roomChoice: nextProps.order.roomChoice,
        singleSupplement: !!nextProps.order.singleSupplement,
        refrigeratorSelected: !!nextProps.order.refrigerator,
        thursdayNight: !!nextProps.order.thursdayNight,
        roommate: nextProps.order.roommate || ''
      });
    }
    if (((!currentUser && !!nextProps.currentUser) || this.state.waitingForRegistration) &&
        this.state.submitted) {
      if (nextProps.registrationStatus === LOADED) {
        if (!nextProps.order.roomChoice) {
          this.apply(nextProps.currentUser);
        } else {
          this.setState({
            submitted: false,
            existingRegistration: true
          });
        }
      } else {
        this.setState({ waitingForRegistration: true });
      }
    } else if (!!currentUser && !nextProps.currentUser) {
      //clear current state when signing out
      this.setState({
        submitted: false,
        existingRegistration: false,
        waitingForRegistration: false,
        roomChoice: null,
        singleSupplement: false,
        refrigeratorSelected: false,
        thursdayNight: false,
        roommate: ''
      });
    }
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
    const { roomChoice, singleSupplement, refrigeratorSelected, thursdayNight, roommate } = this.state;

    applyRoomChoice(event, currentUser, {
      roomChoice,
      singleSupplement: !!singleSupplement && !!event.priceList.singleRoom[roomChoice],
      refrigerator: !!refrigeratorSelected && roomChoice !== 'camper' && roomChoice !== 'commuter',
      thursdayNight: !!thursdayNight && roomChoice !== 'commuter',
      roommate
    });

    history.push(match.url + '/profile');
  }

  renderRoomChoiceOption = (roomType) => {
    const { roomChoice, singleSupplement } = this.state;
    const { event, order, serverTimestamp } = this.props;

    const roomData = ROOM_DATA[roomType];
    let price = event.priceList.roomChoice[roomType];
    let strikeoutPrice;
    if (isEarlyDiscountAvailable(event, order, serverTimestamp)) {
      strikeoutPrice = price;
      price -= price * event.earlyDiscount.amount;
    }
    return (
      <LodgingCard
        roomType={roomType}
        title={roomData.title}
        description={roomData.description}
        price={price}
        strikeoutPrice={strikeoutPrice}
        priceSingle={event.priceList.singleRoom[roomType]}
        selected={roomChoice === roomType}
        singleSelected={!!singleSupplement}
        onClick={this.onSelectLodgingType}
        onToggleSingle={this.onToggleSingleSupplement}
      />
    );
  }

  onSelectLodgingType = (roomType) => {
    this.setState({roomChoice: roomType});
  }

  onToggleSingleSupplement = () => {
    this.setState({singleSupplement: !this.state.singleSupplement});
  }

  onToggleRefrigerator = () => {
    this.setState({refrigeratorSelected: !this.state.refrigeratorSelected});
  }

  onToggleThursdayNight = () => {
    this.setState({thursdayNight: !this.state.thursdayNight});
  }

  handleChangeRoommate = (evt) => {
    evt.preventDefault();
    this.setState({roommate: evt.target.value});
  }

  render() {
    const { currentUser, event, serverTimestamp } = this.props;
    const { roomChoice, submitted, singleSupplement, refrigeratorSelected,
      thursdayNight, roommate, existingRegistration } = this.state;

    if (submitted && !currentUser) {
      return (
        <SignInContainer />
      );
    }

    const noRoommate = (!!singleSupplement && roomChoice !== 'dormitory') || roomChoice === 'camper' || roomChoice === 'commuter';
    const noRefrigerator = roomChoice === 'camper' || roomChoice === 'commuter';
    const noThursday = roomChoice === 'commuter';

    return (
      <div className="mb-4">
        {existingRegistration &&
          <div className="alert alert-info" role="alert">
            <p className="text-center m-0">We found your existing registration.</p>
          </div>
        }
        <h5>Lodging and Price Options</h5>
        <p>Please click below to make your lodging choice. All prices are per person and include lodging, meals, and programming. If selecting a multiple occupancy room, you will have a roommate during the retreat. You can request a specific roommate below or we will assign someone.</p>
        {isEarlyDiscountAvailable(event, null, serverTimestamp) &&  //only consider current time for message display
          <div className=" text-danger">
            <h5 className="d-flex justify-content-center">
              Registration Now Open for JMR 27 October 19-21, 2018!
            </h5>
            <h6 className="d-flex justify-content-center">
              The per-person price below includes a LIMITED TIME {event.earlyDiscount.amount * 100}&#37; DISCOUNT!
            </h6>
          </div>
        }
        <div className="row justify-content-md-center">
          <form onSubmit={this.handleSubmit}>
            <div className="row">
              {this.renderRoomChoiceOption('plus')}
              {this.renderRoomChoiceOption('standard')}
            </div>
            <div className="row">
              {this.renderRoomChoiceOption('basic')}
              {this.renderRoomChoiceOption('dormitory')}
            </div>
            <div className="row">
              {this.renderRoomChoiceOption('camper')}
              {this.renderRoomChoiceOption('commuter')}
            </div>
            <h5 className="mt-4">Additional Options</h5>
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="thursday-night"
                checked={thursdayNight && !noThursday}
                disabled={noThursday}
                onChange={this.onToggleThursdayNight}
              />
              <label className={classNames("form-check-label", noThursday && "disabled")} htmlFor="thursday-night">
                Thursday evening arrival (for pre-retreat planning) - {formatMoney(event.priceList.thursdayNight, 0)}
              </label>
            </div>
            <div className="form-check mt-2">
              <input className="form-check-input" type="checkbox" id="refrigerator"
                checked={refrigeratorSelected && !noRefrigerator}
                disabled={noRefrigerator}
                onChange={this.onToggleRefrigerator}
              />
              <label className={classNames("form-check-label", noRefrigerator && "disabled")} htmlFor="refrigerator">
                Add a mini-fridge to your room - {formatMoney(event.priceList.refrigerator, 0)}
              </label>
            </div>
            <div className="form-group row mt-4">
              <label htmlFor="roommate" className={classNames("col-form-label col-md-4", noRoommate && "disabled")}>
                Requested Roommate
              </label>
              <input id="roommate" type="text" className="form-control col-md-6"
                placeholder="Optional"
                value={roommate} onChange={this.handleChangeRoommate}
                disabled={noRoommate}
              />
            </div>
            <button type='submit' className={classNames("btn float-right", roomChoice && "btn-success")} disabled={!roomChoice}>
              Continue
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default RoomChoice;

import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import moment from 'moment';
import get from 'lodash/get';
import { formatMoney, getEarlyDiscount, getPreRegistrationDiscount, isRoomUpgradeAvailable } from '../lib/utils';
import SignIn from '../components/SignIn';
import LodgingCard from './LodgingCard';
import ROOM_DATA from '../roomData.json';
import { LOADED } from '../constants';
import './RoomChoice.css';

class RoomChoice extends Component {
  componentWillMount() {
    this.setState({
      submitted: false,
      announcement: null,
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
          if (!!nextProps.bambam && !!nextProps.bambam.inviter) {
            this.setState({
              submitted: false,
              announcement: this.getBamBamMessage(nextProps.bambam)
            });
          } else {
            this.apply(nextProps.currentUser);
          }
        } else {
          this.setState({
            submitted: false,
            announcement: 'We found your existing registration.'
          });
        }
      } else {
        this.setState({ waitingForRegistration: true });
      }
    } else if (!!currentUser && !nextProps.currentUser) {
      //clear current state when signing out
      this.setState({
        submitted: false,
        announcement: null,
        waitingForRegistration: false,
        roomChoice: null,
        singleSupplement: false,
        refrigeratorSelected: false,
        thursdayNight: false,
        roommate: ''
      });
    } else if (!nextProps.order.created_at && !!nextProps.bambam && !!nextProps.bambam.inviter) {
      this.setState({
        announcement: this.getBamBamMessage(nextProps.bambam)
      });
    }
  }

  getBamBamMessage = (bambam) => {
    const {event, serverTimestamp} = this.props;

    const name = `${bambam.inviter.first_name} ${bambam.inviter.last_name}`;
    let message = `You have been invited to join us at ${event.title} by ${name} as part of ` +
      "our 'Be a Mensch, Bring a Mensch' program.";
    if (moment(serverTimestamp).isSameOrBefore(moment(bambam.inviter.invited_at)
        .add(event.bambamDiscount.registerByAmount, event.bambamDiscount.registerByUnit)
        .endOf('day'))) {
      message += ` You will each receive a ${event.bambamDiscount.amount * 100}% discount on your ` +
        "room rate when you complete your registration.";
    }
    return message;
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
    const { history, match, event, applyRoomChoice, madePayment } = this.props;
    const { roomChoice, singleSupplement, refrigeratorSelected, thursdayNight, roommate } = this.state;

    applyRoomChoice(event, currentUser, {
      roomChoice,
      singleSupplement: !!singleSupplement && !!event.priceList.singleRoom[roomChoice],
      refrigerator: !!refrigeratorSelected && roomChoice !== 'camper' && roomChoice !== 'commuter',
      thursdayNight: !!thursdayNight && roomChoice !== 'commuter',
      roommate
    }, madePayment);

    history.push(match.url + '/profile');
  }

  renderRoomChoiceOption = (roomType) => {
    const { roomChoice, singleSupplement } = this.state;
    const { event, order, serverTimestamp, roomUpgrade, currentUser } = this.props;

    const roomData = ROOM_DATA[roomType];
    let price = event.priceList.roomChoice[roomType];
    let strikeoutPrice;
    let discount = getPreRegistrationDiscount(currentUser, event, order, serverTimestamp) ||
        getEarlyDiscount(event, order, serverTimestamp);
    if (!!discount) {
      strikeoutPrice = price;
      if (discount.amount > 1) {
        price -= discount.amount;
      } else {
        price -= price * event.discount.amount;
      }
    }
    let upgradeType;
    if (isRoomUpgradeAvailable(roomUpgrade, order, event)) {
      upgradeType = roomData.upgradeTo && ROOM_DATA[roomData.upgradeTo].title;
    }
    let soldOut = get(event, `soldOut.${roomType}`, false) && order.roomChoice !== roomType;

    return (
      <LodgingCard
        roomType={roomType}
        title={roomData.title}
        description={roomData.description}
        price={price}
        strikeoutPrice={strikeoutPrice}
        roomUpgrade={upgradeType}
        priceSingle={event.priceList.singleRoom[roomType]}
        selected={roomChoice === roomType}
        singleSelected={!!singleSupplement}
        soldOut={!!soldOut}
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
    const { currentUser, event, serverTimestamp, madePayment, order, roomUpgrade, hasBalance, match } = this.props;
    const { roomChoice, submitted, singleSupplement, refrigeratorSelected,
      thursdayNight, roommate, announcement } = this.state;

    if (submitted && !currentUser) {
      return (
        <SignIn />
      );
    }

    const noRoommate = (!!singleSupplement && roomChoice !== 'dormitory') || roomChoice === 'camper' || roomChoice === 'commuter';
    const noRefrigerator = roomChoice === 'camper' || roomChoice === 'commuter';
    const noThursday = roomChoice === 'commuter';

    //only consider current time for message display
    let preRegistrationDiscount = getPreRegistrationDiscount(currentUser, event, order, serverTimestamp);
    let preRegistrationDiscountDisplay;
    if (!!preRegistrationDiscount) {
      if (preRegistrationDiscount.amount > 1) {
        preRegistrationDiscountDisplay = formatMoney(preRegistrationDiscount.amount, 0);
      } else {
        preRegistrationDiscountDisplay = (100 * preRegistrationDiscount.amount) + "%";
      }
    }
    let earlyDiscountDisplay;
    let earlyDiscount = {};
    if (!preRegistrationDiscount) {
      let earlyDiscount = getEarlyDiscount(event, null, serverTimestamp);
      if (!!earlyDiscount) {
        if (earlyDiscount.amount > 1) {
          earlyDiscountDisplay = formatMoney(earlyDiscount.amount, 0);
        } else {
          earlyDiscountDisplay = (100 * earlyDiscount.amount) + "%";
        }
      }
    }
    let roomUpgradeDisplay = isRoomUpgradeAvailable(roomUpgrade, order, event);

    return (
      <div className="mb-4">
        <div className="text-center offset-md-1 col-md-10 intro mb-3">
          <h5 className="font-italic">
            Menschwork invites you to join in the celebration of<br/>
          </h5>
          <h4 className="font-weight-bold">
            Jewish Men&#39;s Retreat 29
          </h4>
          <h5>
            <span className="font-weight-bold">Resilience.  Balance.  Equanimity.</span>
          </h5>
          <h6>
            <span className="font-italic">Isabella Freedman Jewish Retreat Center, Falls Village, CT - November 13-15, 2020</span>
          </h6>
        </div>
        {!!announcement &&
          <div className="alert alert-info" role="alert">
            <p className="text-center m-0">{announcement}</p>
          </div>
        }
        {!!hasBalance &&
          <div className="alert alert-info" role="alert">
            <p className="text-center m-0">
              Please <Link to={`${match.url}/payment`}>visit the Payment page</Link> to pay the remaining balance on your registration
            </p>
          </div>
        }
        <h5>Lodging and Price Options</h5>
        <p>Please click below to make your lodging choice. All prices are per person and include lodging, meals, and programming. If selecting a multiple occupancy room, you will have a roommate during the retreat. You can request a specific roommate below or we will assign someone.</p>
        {!!preRegistrationDiscountDisplay &&
          <div className="text-danger">
            <h6 className="d-flex justify-content-center">
              As you have pre-registered, the per-person price below includes a LIMITED TIME {preRegistrationDiscountDisplay} DISCOUNT through {moment(preRegistrationDiscount.endDate).format("MMMM Do")}!
            </h6>
          </div>
        }
        {!!earlyDiscountDisplay &&
          <div className="text-danger">
            <h6 className="d-flex justify-content-center">
              The per-person price below includes a LIMITED TIME {earlyDiscountDisplay} DISCOUNT through {moment(earlyDiscount.endDate).format("MMMM Do")}!
            </h6>
          </div>
        }
        {!!roomUpgradeDisplay &&
          <div className="text-danger">
            <h6 className="d-flex justify-content-center">
              As one of the first {event.roomUpgrade.firstN} registrants, you will receive a free room upgrade
              if you register now for a Basic or Standard room!
            </h6>
          </div>
        }
        <div className="row justify-content-md-center">
          <form onSubmit={this.handleSubmit}>
            <div className="d-flex flex-wrap justify-content-center">
              {this.renderRoomChoiceOption('plus')}
              {this.renderRoomChoiceOption('standard')}
            </div>
            <div className="d-flex flex-wrap justify-content-center">
              {this.renderRoomChoiceOption('basic')}
              {this.renderRoomChoiceOption('dormitory')}
            </div>
            <div className="d-flex flex-wrap justify-content-center">
              {this.renderRoomChoiceOption('camper')}
              {this.renderRoomChoiceOption('commuter')}
            </div>
            <div className="col-12">
              <h5 className="mt-4">Additional Options</h5>
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="thursday-night"
                  checked={thursdayNight && !noThursday}
                  disabled={noThursday}
                  onChange={this.onToggleThursdayNight}
                />
                <label className={classNames("form-check-label", noThursday && "disabled")} htmlFor="thursday-night">
                  Thursday evening arrival (for retreat planning team only) - {formatMoney(event.priceList.thursdayNight, 0)}
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
              <div className="form-group mt-4">
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
                {madePayment ? "Save Changes" : "Continue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

export default RoomChoice;

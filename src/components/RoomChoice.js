import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import classNames from 'classnames';
import moment from 'moment';
import get from 'lodash/get';
import has from 'lodash/has';
import { useApplication } from '../providers/ApplicationProvider';
import { useRegistration } from '../providers/RegistrationProvider';
import { formatMoney, getEarlyDiscount, getLateCharge, getPreRegistrationDiscount, isRoomUpgradeAvailable, calculateBalance } from '../lib/utils';
import SignIn from '../components/SignIn';
import LodgingCard from './LodgingCard';
import MoneyField from './MoneyField';
import Loading from './Loading';
import ROOM_DATA from '../roomData.json';
import { LOADED, LOADING } from '../constants';
import './RoomChoice.css';

const RoomChoice = ({ currentUser, event }) => {
  const [ submitted, setSubmitted ] = useState(false);
  const [ announcement, setAnnouncement ] = useState(null);
  const [ waitingForRegistration, setWaitingForRegistration ] = useState(false);
  const [ roomChoice, setRoomChoice ] = useState(null);
  const [ singleSupplement, setSingleSupplement ] = useState(false);
  const [ refrigeratorSelected, setRefrigeratorSelected ] = useState(false);
  const [ thursdayNight, setThursdayNight ] = useState(false);
  const [ roommate, setRoommate ] = useState('');
  const [ donation, setDonation ] = useState(null);
  const [ isCustomDonation, setIsCustomDonation ] = useState(false);
  const [ donationOption, setDonationOption ] = useState(null);
  const [ onlineExtraDonated, setOnlineExtraDonated ] = useState(true);
  const [ savedCurrentUser, setSavedCurrentUser ] = useState(null);
  const { serverTimestamp, roomUpgrade: roomUpgradeInApplication } = useApplication();
  const { addToCart, updateOrder, registration, bambam, roomUpgrade : roomUpgradeInRegistration, status : registrationStatus } = useRegistration();
  const navigate = useNavigate();

  const order = useMemo(
    () => Object.assign({}, get(registration, "order"), get(registration, "cart")),
    [ registration ]
  );
  const madePayment = !!get(registration, "account.payments");
  const payments = get(registration, "account.payments");
  const hasBalance = has(registration, 'order') && calculateBalance(registration, event, currentUser) > 0;

  const roomUpgrade = roomUpgradeInRegistration || roomUpgradeInApplication;

  const inferDonationOption = useCallback(() => {
    if (!order.roomChoice) {
      return null;
    } else if (order.donation === 36000) {
      return "donation_mishpacha";
    } else if (order.donation === 18000) {
      return "donation_endowment";
    } else if (order.donation === 9000) {
      return "donation_support";
    } else if (order.donation > 0) {
      return "donation_custom";
    } else {
      return "donation_none";
    }
  }, [ order ]);

  const isSingleRoomUnavailable = useCallback((roomType) => {
    if (!has(event, `priceList.singleRoom.${roomType}`)) {
      return true;
    }
    let soldOut = get(event, `soldOut.singleRooms.${roomType}`, false);
    return soldOut && !(order.roomChoice === roomType && order.singleSupplement && has(order, 'created_at'));
  }, [event, order]);

  const apply = useCallback(() => {
    let orderValues = {
      roomChoice,
      singleSupplement: !!singleSupplement && !!event.priceList.singleRoom[roomChoice] && !isSingleRoomUnavailable(roomChoice),
      refrigerator: !!refrigeratorSelected && roomChoice !== 'camper' && roomChoice !== 'commuter',
      thursdayNight: !!thursdayNight && roomChoice !== 'commuter',
      roommate,
      onlineExtraDonated: !!onlineExtraDonated
    };
    if (roomChoice === 'online_connection') {
      orderValues = Object.assign(orderValues, {
        refrigerator: false,
        thursdayNight: false,
        roommate: null
      });
    }

    if (event.onlineOnly) {
      orderValues.donation = isCustomDonation ? donation : null;
    } else if (donationOption === "donation_mishpacha") {
      orderValues.donation = 36000;
    } else if (donationOption === "donation_endowment") {
      orderValues.donation = 18000;
    } else if (donationOption === "donation_support") {
      orderValues.donation = 9000;
    } else if (donationOption === "donation_custom") {
      orderValues.donation = donation;
    } else {
      orderValues.donation = null;
    }
    (!madePayment ? addToCart : updateOrder)(event, currentUser, orderValues);

    navigate('profile');
  }, [event, currentUser, madePayment, addToCart, updateOrder, navigate, roomChoice, singleSupplement, refrigeratorSelected, thursdayNight, roommate, donationOption, donation, onlineExtraDonated, isCustomDonation, isSingleRoomUnavailable ]);

  useEffect(() => {
    if (order.roomChoice) {
      setRoomChoice(order.roomChoice);
      setSingleSupplement(!!order.singleSupplement);
      setRefrigeratorSelected(!!order.refrigerator);
      setThursdayNight(!!order.thursdayNight);
      setRoommate(order.roommate || '');
      setDonation(order.donation);
      setIsCustomDonation(order.roomChoice === "online_base" && order.donation > 0);
      setDonationOption(inferDonationOption(order));
      setOnlineExtraDonated(order.onlineExtraDonated);
    }
  }, [ order, inferDonationOption ]);

  const getBamBamMessage = useCallback(() => {
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
  }, [bambam, event, serverTimestamp]);

  useEffect(() => {
    if (((!savedCurrentUser && !!currentUser) || waitingForRegistration) &&
        submitted) {
      if (registrationStatus === LOADED) {
        if (!order.roomChoice) {
          if (!!bambam && !!bambam.inviter) {
            setSubmitted(false);
            setAnnouncement(getBamBamMessage());
          } else {
            apply();
          }
        } else {
          setSubmitted(false);
          setAnnouncement('We found your existing registration.');
        }
      } else {
        setWaitingForRegistration(true);
      }
    } else if (!!savedCurrentUser && !currentUser) {
      //clear current state when signing out
      setSubmitted(false);
      setAnnouncement(null);
      setWaitingForRegistration(false);
      setRoomChoice(null);
      setSingleSupplement(false);
      setRefrigeratorSelected(false);
      setThursdayNight(false);
      setRoommate('');
      setDonation(null);
      setIsCustomDonation(false);
      setDonationOption(null);
      setOnlineExtraDonated(true);
    } else if (!order.created_at && !!bambam && !!bambam.inviter) {
      setAnnouncement(getBamBamMessage());
    }
    setSavedCurrentUser(currentUser);
  }, [ currentUser, registrationStatus, savedCurrentUser, order, bambam, getBamBamMessage, apply, submitted, waitingForRegistration ]);

  const handleSubmit = (evt) => {
    if (evt) {
      evt.preventDefault();
    }
    setSubmitted(true);
    if (currentUser) {
      apply();
    }
  };

  const calculateTotalPayments = () => {
    let paymentsList = Object.keys(payments || {})
      .map(k => payments[k]);
    return paymentsList.reduce((acc, reg) => acc + reg.amount, 0);
  };

  const renderRoomChoiceOption = (roomType) => {
    const roomData = ROOM_DATA[roomType];
    let price = event.priceList.roomChoice[roomType];
    let strikeoutPrice;
    let orderForDiscount = Object.assign({}, order, { roomChoice: roomType });
    let discount = getPreRegistrationDiscount(currentUser, event, orderForDiscount, serverTimestamp) ||
        getEarlyDiscount(event, orderForDiscount, serverTimestamp);
    if (!!discount) {
      strikeoutPrice = price;
      if (discount.amount > 1) {
        price -= discount.amount;
      } else {
        price -= price * discount.amount;
      }
    }
    let lateCharge = getLateCharge(event, orderForDiscount, serverTimestamp);
    if (!!lateCharge) {
      if (lateCharge.amount > 1) {
        price += lateCharge.amount;
      } else {
        price += price * lateCharge.amount;
      }
    }
    let upgradeType;
    if (isRoomUpgradeAvailable(roomUpgrade, order, event)) {
      upgradeType = roomData.upgradeTo && ROOM_DATA[roomData.upgradeTo].title;
    }
    let soldOut = get(event, `soldOut.${roomType}`, false) && order.roomChoice !== roomType;
    let singleUnavailable = isSingleRoomUnavailable(roomType);

    return (
      <LodgingCard
        roomType={roomType}
        title={roomData.title}
        description={roomData.description}
        price={price}
        strikeoutPrice={strikeoutPrice}
        roomUpgrade={upgradeType}
        priceSingle={event.priceList.singleRoom[roomType]}
        singleUnavailable={singleUnavailable}
        selected={roomChoice === roomType}
        singleSelected={!!singleSupplement}
        soldOut={!!soldOut}
        onClick={onSelectLodgingType}
        onToggleSingle={onToggleSingleSupplement}
      />
    );
  };

  const onSelectLodgingType = (roomType) => {
    setRoomChoice(roomType);
  };

  // const onSelectOnlineType = (roomType, isCustomDonation) => {
  //   setRoomChoice(roomType);
  //   setIsCustomDonation(isCustomDonation);
  // };

  const onToggleSingleSupplement = () => {
    setSingleSupplement(!singleSupplement);
  };

  const onToggleRefrigerator = () => {
    setRefrigeratorSelected(!refrigeratorSelected);
  };

  const onToggleThursdayNight = () => {
    setThursdayNight(!thursdayNight);
  };

  const handleChangeRoommate = (evt) => {
    evt.preventDefault();
    setRoommate(evt.target.value);
  };

  const handleDonationChange = (amount) => {
    setDonation(amount);
  };

  const onSelectDonationType = (option) => {
    setDonationOption(option);
    if (option === "donation_custom" && [36000, 18000, 90000].indexOf(donation) >= 0) {
      setDonation(null);
    }
  };

  // renderOnlineJMR() {
  //   const { currentUser, event, serverTimestamp, madePayment, order, hasBalance } = this.props;
  //   const { roomChoice, announcement, isCustomDonation, donation } = this.state;

  //   let baseFee = event.priceList.roomChoice["online_base"];
  //   let baseLabel = "Basic Registration Fee";

  //   //only consider current time for message display
  //   let preRegistrationDiscount = getPreRegistrationDiscount(currentUser, event, order, serverTimestamp);
  //   if (!!preRegistrationDiscount) {
  //     if (preRegistrationDiscount.amount > 1) {
  //       baseFee -= preRegistrationDiscount.amount;
  //     } else {
  //       baseFee *= (1 - preRegistrationDiscount.amount);
  //     }
  //     baseLabel = `Pre-Registrant Early-Bird Registration Fee (register by ${moment(preRegistrationDiscount.endDate).format("MMMM D")} to receive discount)`;
  //   }
  //   let earlyDiscount = {};
  //   if (!preRegistrationDiscount) {
  //     earlyDiscount = getEarlyDiscount(event, null, serverTimestamp);
  //     if (!!earlyDiscount) {
  //       if (earlyDiscount.amount > 1) {
  //         baseFee -= earlyDiscount.amount;
  //       } else {
  //         baseFee *= (1 - earlyDiscount.amount);
  //       }
  //       baseLabel = `Registration Fee (register by ${moment(earlyDiscount.endDate).format("MMMM D")} to receive discount)`;
  //     }
  //   }
  //   let strikeoutFee = baseFee < event.priceList.roomChoice["online_base"] ? event.priceList.roomChoice["online_base"] : null;
  //   let canSubmit = !!roomChoice;
  //   if (roomChoice === "online_base" && isCustomDonation) {
  //     canSubmit = donation > 0;
  //   }

  //   return (
  //     <div className="mb-4">
  //       <div className="text-center offset-md-1 col-md-10 intro mb-3">
  //         <h5 className="font-italic">
  //           Menschwork invites you to join in the celebration of<br/>
  //         </h5>
  //         <h4 className="font-weight-bold">
  //           Jewish Men&#39;s Retreat 31
  //         </h4>
  //         <h5 className="font-weight-bold">
  //           <span className="text-primary">Resilience.</span>  Balance.  <span className="text-primary">Equanimity.</span>
  //         </h5>
  //         <h6 className="font-italic">
  //           This retreat will take place on-line
  //         </h6>
  //         <h6 className="font-italic">
  //           Friday October 15 at 4pm until Sunday October 17 at 2pm, 2021 (times approximate)
  //         </h6>
  //       </div>
  //       {!!announcement &&
  //         <div className="alert alert-info" role="alert">
  //           <p className="text-center m-0">{announcement}</p>
  //         </div>
  //       }
  //       {!!hasBalance &&
  //         <div className="alert alert-info" role="alert">
  //           <p className="text-center m-0">
  //             Please <Link to={`payment`}>visit the Payment page</Link> to pay the remaining balance on your registration
  //           </p>
  //         </div>
  //       }
  //       <div className="offset-md-1 col-md-10">
  //         <h5>Fee Options</h5>
  //         <p>
  //           Please indicate below the level at which you would like to contribute to the cost of putting on JMR31.
  //         </p>
  //         <p>
  //           All men who register will receive the JMR31 Package, a thoughtfully
  //           curated group of items to enhance the experience and connect men as
  //           a single Jewish community throughout the retreat.
  //         </p>
  //       </div>
  //       <div className="row justify-content-md-center">
  //         <form onSubmit={this.handleSubmit}>
  //           <div className="offset-md-2 col-md-8">
  //             <div className="form-check my-4">
  //               <input className="form-check-input" type="checkbox" id="roomChoiceBase"
  //                 checked={roomChoice === "online_base" && !isCustomDonation} onChange={() => this.onSelectOnlineType("online_base")}
  //               />
  //               <label className="form-check-label" htmlFor="roomChoiceBase">
  //                 <div style={{display: "inline-block"}}>
  //                   <span className="ml-2 font-weight-bold">{formatMoney(baseFee, 0)}</span>
  //                   {!!strikeoutFee && <span className="strikeout ml-1">{formatMoney(strikeoutFee, 0)}</span>}
  //                 </div>
  //                 <span className="ml-2 font-weight-bold">{baseLabel}</span>
  //               </label>
  //             </div>
  //             <div className="form-check my-4">
  //               <input className="form-check-input" type="checkbox" id="roomChoiceLevel1"
  //                 checked={roomChoice === "online_endowment"} onChange={() => this.onSelectOnlineType("online_endowment")}
  //               />
  //               <label className="form-check-label" htmlFor="roomChoiceLevel1">
  //                 <span className="ml-2 font-weight-bold">{formatMoney(event.priceList.roomChoice["online_endowment"], 0)}</span><span className="ml-2 font-weight-bold">Brother Keeper Endowment Level</span>
  //                   <div className="font-weight-light">
  //                     Your Brother Keeper Endowment will support Menschwork’s ability to purchase
  //                     prayer books, Havdalah candles, and other Jewish ritual items for the JMR31
  //                     Package delivered to each man who registers for JMR31.
  //                   </div>
  //               </label>
  //             </div>
  //             <div className="form-check my-3">
  //               <input className="form-check-input" type="checkbox" id="roomChoiceLevel2"
  //                 checked={roomChoice === "online_mishpacha"} onChange={() => this.onSelectOnlineType("online_mishpacha")}
  //               />
  //               <label className="form-check-label" htmlFor="roomChoiceLevel2">
  //                 <span className="ml-2 font-weight-bold">{formatMoney(event.priceList.roomChoice["online_mishpacha"], 0)}</span><span className="ml-2 font-weight-bold">Brother Keeper Mishpacha Level</span>
  //                   <div className="font-weight-light">
  //                     The Mishpacha level is less than most men pay attend the traditional Jewish
  //                     Men’s Retreat weekend.  Yet, your support as a Brother Keeper Mishpacha will
  //                     ensure the ability of men to attend JMR31 who may otherwise be unable to
  //                     afford to do so.  Your generous support will also help support the Jewish
  //                     Men’s Retreat Fellowship Program for Young Men and allow Menschwork to offer
  //                     programs such as the Webinar Series, MenschGroups, among its many other
  //                     current programs and programs in development.
  //                   </div>
  //               </label>
  //             </div>
  //             <div className="form-check my-4">
  //               <div>
  //                 <input className="form-check-input" type="checkbox" id="roomChoiceBasePlus"
  //                   checked={roomChoice === "online_base" && isCustomDonation} onChange={() => this.onSelectOnlineType("online_base", true)}
  //                 />
  //                 <label className="form-check-label" htmlFor="roomChoiceBasePlus">
  //                   <div style={{display: "inline-block"}}>
  //                     <span className="ml-2 font-weight-bold">{formatMoney(baseFee, 0)}</span>
  //                     {!!strikeoutFee && <span className="strikeout ml-1">{formatMoney(strikeoutFee, 0)}</span>}
  //                   </div>
  //                   <span className="mx-2 font-weight-bold">+</span>
  //                   <MoneyField id="donation"
  //                     amount={donation}
  //                     onChange={this.handleDonationChange}
  //                     minimumAmount={100}
  //                     maximumAmount={500000}
  //                     disabled={!isCustomDonation}
  //                     immediate={true}
  //                   />
  //                   <span className="ml-2 font-weight-bold">Choose your own additional contribution level</span>
  //                 </label>
  //               </div>
  //               <div className="font-weight-light">
  //                 Any amount contributed in addition to the registration fee will help Menschwork to provide items for the JMR31
  //                 Package delivered to each man who registers for JMR31.
  //               </div>
  //             </div>
  //             <p className="font-italic">
  //               Menschwork, Inc. is recognized by the IRS as a 501(c)(3) charitable organization.
  //             </p>
  //           </div>
  //           <div className="mt-2">
  //             <button type='submit' className={classNames("btn float-right", roomChoice && "btn-success")} disabled={!canSubmit}>
  //               {madePayment ? "Save Changes" : "Continue"}
  //             </button>
  //           </div>
  //         </form>
  //       </div>
  //     </div>
  //   );
  // }

  const renderDonationSection = () => {
    return (
      <div className="form-group mt-5">
        <h4 className="mt-4">Support Menschwork</h4>
        <p>
          Menschwork has endeavored to minimize the price increase from recent retreats as much as possible.
          Nevertheless, JMR34 may present a financial challenge to some men.  Menschwork offers need-based financial assistance on a funds-available basis.
          Please consider your role as a Brother Keeper by making a donation in addition to your registration fee.
        </p>
        <div>
          <div className="form-check my-3">
            <input className="form-check-input" type="checkbox" id="donation_mishpacha"
              checked={donationOption === "donation_mishpacha"} onChange={() => onSelectDonationType("donation_mishpacha")}
            />
            <label className="form-check-label" htmlFor="donation_mishpacha">
              <span className="ml-2 font-weight-bold">{formatMoney(36000, 0)}</span><span className="ml-2 font-weight-bold">Brother Keeper Mishpacha Level</span>
                <div className="font-weight-light">
                  Your contribution as a Brother Keeper at the Mishpacha Level will ensure the ability of men to attend JMR34 who may otherwise be unable to afford to do so.
                  Your generous contribution will also help support the Jewish Men’s Retreat Fellowship Program for Young Men.
                </div>
            </label>
          </div>
          <div className="form-check my-4">
            <input className="form-check-input" type="checkbox" id="donation_endowment"
              checked={donationOption === "donation_endowment"} onChange={() => onSelectDonationType("donation_endowment")}
            />
            <label className="form-check-label" htmlFor="donation_endowment">
              <span className="ml-2 font-weight-bold">{formatMoney(18000, 0)}</span><span className="ml-2 font-weight-bold">Brother Keeper Endowment Level</span>
              <div className="font-weight-light">
                Your contribution as a Brother Keeper at the Endowment Level will support the ability of Menschwork to continue to offer additional proramming throughout the year
                  such as our Mussar class, Webinars, online MenschGroups, among its many other current programs and programs in development.
              </div>
            </label>
          </div>
          <div className="form-check my-4">
            <input className="form-check-input" type="checkbox" id="donation_support"
              checked={donationOption === "donation_support"} onChange={() => onSelectDonationType("donation_support")}
            />
            <label className="form-check-label" htmlFor="donation_support">
              <span className="ml-2 font-weight-bold">{formatMoney(9000, 0)}</span><span className="ml-2 font-weight-bold">Brother Keeper Supporter Level</span>
            </label>
          </div>
          <div className="form-check my-4">
            <input className="form-check-input" type="checkbox" id="donation_discount"
              checked={donationOption === "donation_discount"} onChange={() => onSelectDonationType("donation_discount")}
            />
          </div>
          <div className="form-check my-4">
            <div>
              <input className="form-check-input" type="checkbox" id="donation_custom"
                checked={donationOption === "donation_custom"} onChange={() => onSelectDonationType("donation_custom")}
              />
              <label className="form-check-label" htmlFor="donation_custom">
                <MoneyField id="donation"
                  amount={donationOption === "donation_custom" && donation}
                  onChange={handleDonationChange}
                  minimumAmount={100}
                  maximumAmount={500000}
                  disabled={donationOption !== "donation_custom"}
                  immediate={true}
                />
                <span className="ml-2 font-weight-bold">Brother Keeper Level</span>
              </label>
            </div>
            <div className="font-weight-light">
              Your support as a Brother Keeper, at whatever amount is comfortable for you, will help support Menschwork's programs.
            </div>
          </div>
          <div className="form-check my-4">
            <input className="form-check-input" type="checkbox" id="donation_none"
              checked={donationOption === "donation_none"} onChange={() => onSelectDonationType("donation_none")}
            />
            <label className="form-check-label" htmlFor="donation_none">
              <span className="ml-2 font-weight-bold">No Donation at this time</span>
            </label>
          </div>
          <p className="font-italic">
            Menschwork, Inc. is recognized by the IRS as a 501(c)(3) charitable organization.
          </p>
        </div>
      </div>
    );
  };

  const handleOnlineRefundChange = (evt) => {
    setOnlineExtraDonated(evt.target.id === "onlineRefundNo");
  };

  const renderOnlineRefundOptions = () => {
    return (<div className="offset-md-2 col-md-8 my-3">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" value="" checked={onlineExtraDonated} id="onlineRefundNo" onChange={handleOnlineRefundChange} />
        <label class="form-check-label" for="onlineRefundNo">
          I am happy for Menschwork to keep the the additional amount I have already paid for a room
        </label>
      </div>
      <div class="form-check mt-2">
        <input class="form-check-input" type="checkbox" value="" checked={!onlineExtraDonated} id="onlineRefundYes" onChange={handleOnlineRefundChange} />
        <label class="form-check-label" for="onlineRefundYes">
          I would like to receive a refund for the difference in cost from the amount I have already paid for a room
        </label>
      </div>
    </div>);
  };

  if (submitted && !currentUser) {
    return (
      <SignIn />
    );
  }

  // if (event.onlineOnly) {
  //   return this.renderOnlineJMR();
  // }

  const noRoommate = (!!singleSupplement && roomChoice !== 'dormitory') || roomChoice === 'camper' || roomChoice === 'commuter';
  const noRefrigerator = roomChoice === 'camper' || roomChoice === 'commuter';
  const noThursday = roomChoice === 'commuter';

  //only consider current time for message display
  let preRegistrationDiscount = getPreRegistrationDiscount(currentUser, event, order, serverTimestamp);
  let preRegistrationDiscountDisplay;
  if (!!preRegistrationDiscount) {
    // if (preRegistrationDiscount.amount > 1) {
    //   preRegistrationDiscountDisplay = formatMoney(preRegistrationDiscount.amount, 0);
    // } else {
    //   preRegistrationDiscountDisplay = (100 * preRegistrationDiscount.amount) + "%";
    // }
  }
  let earlyDiscountDisplay;
  let earlyDiscount = {};
  if (!preRegistrationDiscountDisplay) {
    earlyDiscount = getEarlyDiscount(event, null, serverTimestamp);
    if (!!earlyDiscount) {
      if (earlyDiscount.amount > 1) {
        earlyDiscountDisplay = formatMoney(earlyDiscount.amount, 0);
      } else {
        earlyDiscountDisplay = (100 * earlyDiscount.amount) + "%";
      }
    }
  }
  let lateChargeDisplay;
  let lateCharge = {};
  if (!has(order, 'created_at') && !preRegistrationDiscountDisplay && !earlyDiscountDisplay &&
      has(event, 'priceList.lateCharge')) {
    lateCharge = event.priceList.lateCharge;
    if (moment(serverTimestamp).isBefore(lateCharge.startDate, 'day')) {
      if (lateCharge.amount > 1) {
        lateChargeDisplay = formatMoney(lateCharge.amount, 0);
      } else {
        lateChargeDisplay = (100 * lateCharge.amount) + "%";
      }
    }
  }
  let roomUpgradeDisplay = isRoomUpgradeAvailable(roomUpgrade, order, event);

  let canSubmit = !!roomChoice;
  if (!donationOption || (donationOption === "donation_custom" && !donation)) {
    canSubmit = false;
  }

  const hasOnlineOption = has(event, "priceList.roomChoice.online_connection") &&
    (!has(event, "roomTypes.online_connection.enabled") || !!event.roomTypes.online_connection.enabled);
  const isOnline = roomChoice === 'online_connection';
  let displayOnlineRefundOptions = false;
  if (isOnline && calculateTotalPayments() > event.priceList.roomChoice[roomChoice]) {
    displayOnlineRefundOptions = true;
  }

  let thursdayNightRate = event.priceList.thursdayNight;
  if (!!singleSupplement && !isSingleRoomUnavailable(roomChoice) && has(event, 'priceList.thursdayNightSingle')) {
    thursdayNightRate = event.priceList.thursdayNightSingle;
  }

  const displayWaitlist = !has(order, 'created_at') && event.status === 'WAITLIST';

  return (
    <div className="mb-4">
      <div className="text-center offset-md-1 col-md-10 intro mb-3">
        <h4 className="font-weight-bold">
          Register Now for JMR34: Heaven is all Around Us
        </h4>
        <h4>
          <span className="font-italic">Jewish Eco-spirituality and the Cultivation of Awe!</span>
        </h4>
        <h5 className="mt-2">
          <span>October 31 - November 2, 2025</span>
        </h5>
        <h6>
          <span className="font-italic">at Isabella Freedman Retreat Center, Falls Village, CT</span>
        </h6>
        <h6 className="mt-3">
          {/* <span className="font-italic">
            Please open and read the <a href="https://menschwork.org/wp-content/uploads/2022/06/Health-and-Safety-at-JMR31.pdf" target="_blank">
            JMR34 Health & Safety Statement</a>
  </span> */}
        </h6>

      </div>
      { registrationStatus === LOADING ?
        <div className="mt-3">
          <Loading spinnerScale={1.7} spinnerColor="888" />
        </div> :
        <div>
          {!!announcement &&
            <div className="alert alert-info" role="alert">
              <p className="text-center m-0">{announcement}</p>
            </div>
          }
          {!!hasBalance &&
            <div className="alert alert-info" role="alert">
              <p className="text-center m-0">
                Please <Link to={`payment`}>visit the Payment page</Link> to pay the remaining balance on your registration
              </p>
            </div>
          }
          {!!displayWaitlist && !order.allowWaitlist &&
            <div className="alert alert-warning" role="alert">
              <p className="text-center m-0">
                JMR34 is currently full.  We expect to receive some cancellations leading up to the retreat and are maintaining a waitlist.
                To join the waitlist, please continue to complete this registration form through the Payment page without submitting any
                payment. We will notify you if space becomes available.
              </p>
            </div>
          }
          {!!displayWaitlist && order.allowWaitlist &&
            <div className="alert alert-info" role="alert">
              <p className="text-center m-0">
                A place has opened up for you at JMR34! Please <Link to={`payment`}>visit the Payment page</Link> to accept your place and pay for your registration.
              </p>
            </div>
          }
          <h5>Lodging and Price Options</h5>
          <p>Please click below to make your lodging choice. All prices are per person and include lodging, meals, and programming. If selecting a multiple occupancy room, you will have a roommate during the retreat. You can request a specific roommate below or we will assign someone.</p>
          {!!preRegistrationDiscountDisplay &&
            <div className="text-danger">
              <h6 className="d-flex justify-content-center">
                As you have pre-registered, the per-person price below includes a LIMITED TIME {preRegistrationDiscountDisplay} EARLY-BIRD DISCOUNT through {moment(preRegistrationDiscount.endDate).format("MMMM Do")}!
              </h6>
            </div>
          }
          {!!earlyDiscountDisplay &&
            <div className="text-danger">
              <h6 className="d-flex justify-content-center">
                The per-person price below includes a LIMITED TIME {earlyDiscountDisplay} EARLY-BIRD DISCOUNT through {moment(earlyDiscount.endDate).format("MMMM Do")}!
              </h6>
            </div>
          }
          {!!lateChargeDisplay &&
            <div className="font-italic">
              <h6 className="d-flex justify-content-center">
                Please note, the attendance rates below will be subject to an additional late fee of {lateChargeDisplay} starting {moment(lateCharge.startDate).format("MMMM Do")}
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
            <form onSubmit={handleSubmit}>
              <div className="d-flex flex-wrap justify-content-center">
                {renderRoomChoiceOption('plus')}
                {renderRoomChoiceOption('standard')}
              </div>
              <div className="d-flex flex-wrap justify-content-center">
                {renderRoomChoiceOption('basic')}
                {renderRoomChoiceOption('dormitory')}
              </div>
              <div className="d-flex flex-wrap justify-content-center">
                {renderRoomChoiceOption('camper')}
                {renderRoomChoiceOption('commuter')}
              </div>
              {hasOnlineOption &&
                <div className="d-flex flex-wrap justify-content-center">
                  {renderRoomChoiceOption('online_connection')}
                </div>
              }
              { displayOnlineRefundOptions && renderOnlineRefundOptions() }
              <div className="col-12">
                <div>
                  <h5 className="mt-4">Additional Options</h5>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" id="thursday-night"
                      checked={thursdayNight && !noThursday && !isOnline}
                      disabled={noThursday || isOnline}
                      onChange={onToggleThursdayNight}
                    />
                    <label className={classNames("form-check-label", noThursday && "disabled")} htmlFor="thursday-night">
                      Thursday evening arrival (for retreat planning team only) - {formatMoney(thursdayNightRate, 0)}
                    </label>
                  </div>
                  { has(event, 'priceList.refrigerator') &&
                    <div className="form-check mt-2">
                      <input className="form-check-input" type="checkbox" id="refrigerator"
                        checked={refrigeratorSelected && !noRefrigerator}
                        disabled={noRefrigerator || isOnline}
                        onChange={onToggleRefrigerator}
                      />
                      <label className={classNames("form-check-label", noRefrigerator && "disabled")} htmlFor="refrigerator">
                        Add a mini-fridge to your room - {formatMoney(event.priceList.refrigerator, 0)}
                      </label>
                    </div>
                  }
                  <div className="form-group mt-4">
                    <label htmlFor="roommate" className={classNames("col-form-label col-md-4", noRoommate && "disabled")}>
                      Requested Roommate
                    </label>
                    <input id="roommate" type="text" className="form-control col-md-6"
                      placeholder="Optional"
                      value={isOnline ? "" : roommate} onChange={handleChangeRoommate}
                      disabled={noRoommate || isOnline}
                    />
                  </div>
                </div>
                <p className="small">
                  *Cancellation Policy: Payments made will be refunded in full (less a $50 processing fee per person) if Menschwork, Inc. receives written notice of cancellation at JMR@menschwork.org no later than noon on Monday, October 7, 2024. No refund is available if you cancel after such date.
                </p>
                { renderDonationSection() }
                <button type='submit' className={classNames("btn float-right", canSubmit && "btn-success")} disabled={!canSubmit}>
                  {madePayment ? "Save Changes" : "Continue"}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  );
};

export default RoomChoice;

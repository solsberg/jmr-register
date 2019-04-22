import React from 'react';
import { Link } from 'react-router-dom';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import { isRegistered } from '../../lib/utils';
import ROOM_DATA from '../../roomData.json';

const renderRoomChoice = ({user, registration}) => {
  let order = {...registration.order, ...registration.cart};
  let upgraded = order.roomUpgrade && !!ROOM_DATA[order.roomChoice].upgradeTo;

  return (
    <tr key={user.uid}>
      <th scope="row">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>
          {`${user.profile.first_name} ${user.profile.last_name}${upgraded && ' (upgraded)'}           `}
        </Link>
      </th>
      <td>{!!order.singleSupplement && "Yes"}</td>
      <td>{order.roommate}</td>
      <td>{!!order.refrigerator && "Yes"}</td>
    </tr>
  );
};

const renderRoomType = (roomType, registrations) => {
  let registrationsForRoomType = sortBy(registrations
    .filter(r => {
      let roomChoice = get(r, "registration.order.roomChoice");
      if (get(r, "registration.order.roomUpgrade") && !!ROOM_DATA[roomChoice].upgradeTo) {
        roomChoice = ROOM_DATA[roomChoice].upgradeTo;
      }
      return (roomChoice === roomType);
    }),
    r => [r.user.profile.last_name, r.user.profile.first_name]);
  return <tbody key={roomType}>
    <tr>
      <th colSpan="3">{ROOM_DATA[roomType].title}</th>
    </tr>
    {registrationsForRoomType.length === 0 &&
      <tr>
        <td colSpan="3"><span className="font-italic">None</span></td>
      </tr>
    }
    { registrationsForRoomType.map(r => renderRoomChoice(r)) }
  </tbody>;
};

const RoomChoices = ({registrations}) => {
  let registrationItems = (registrations || [])
    .filter((reg) => isRegistered(reg.registration));

  const roomTypes = ['plus', 'standard', 'basic', 'dormitory', 'camper', 'commuter'];

  return (
    <div className="mt-3">
      <h3 className="text-center">
        Accommodation Choices
      </h3>
      <table className="table table-striped table-sm report-table">
        <thead>
          <tr>
            <th></th>
            <th className="col-single">Single Room</th>
            <th>Room-mate</th>
            <th className="col-single">Fridge</th>
          </tr>
        </thead>
        {roomTypes.map(rt => renderRoomType(rt, registrationItems))}
      </table>
    </div>
  );
}

export default RoomChoices;

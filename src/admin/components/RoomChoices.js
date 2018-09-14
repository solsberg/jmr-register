import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';
import get from 'lodash/get';
import has from 'lodash/has';
import ROOM_DATA from '../../roomData.json';

const renderRoomChoice = ({user, registration}, event) => {
  let order = {...registration.order, ...registration.cart};

  return (
    <tr key={user.uid}>
      <th scope="row">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>{user.email}</Link>
      </th>
      <td>{user.profile && `${user.profile.first_name} ${user.profile.last_name}`}</td>
      <td>{!!order.singleSupplement && "Yes"}</td>
      <td>{order.roommate}</td>
    </tr>
  );
};

const renderRoomType = (roomType, registrations, event) => {
  let registrationsForRoomType = registrations
    .filter(r => get(r, "registration.order.roomChoice") === roomType);
  return <tbody>
    <tr>
      <th colspan="4">{ROOM_DATA[roomType].title}</th>
    </tr>
    {registrationsForRoomType.length === 0 &&
      <tr>
        <td colspan="4"><span className="font-italic">None</span></td>
      </tr>
    }
    { registrationsForRoomType.map(r => renderRoomChoice(r, event)) }
  </tbody>;
};

const RoomChoices = ({registrations, event}) => {
  let registrationItems = (registrations || [])
    .filter((reg) => has(reg, 'registration.account.payments') ||
      has(reg, 'registration.external_payment.registration'));

  const roomTypes = ['plus', 'standard', 'basic', 'dormitory', 'camper', 'commuter'];

  return (
    <div className="mt-3">
      <h3 className="text-center">
        Accommodation Choices
      </h3>
      <table className="table table-striped table-sm">
        <thead>
          <tr>
            <th></th>
            <th></th>
            <th>Single Room?</th>
            <th>Room-mate</th>
          </tr>
        </thead>
        {roomTypes.map(rt => renderRoomType(rt, registrationItems, event))}
      </table>
    </div>
  );
}

export default RoomChoices;

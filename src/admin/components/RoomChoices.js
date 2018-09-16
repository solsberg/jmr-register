import React from 'react';
import { Link } from 'react-router-dom';
import get from 'lodash/get';
import has from 'lodash/has';
import sortBy from 'lodash/sortBy';
import ROOM_DATA from '../../roomData.json';

const renderRoomChoice = ({user, registration}, event) => {
  let order = {...registration.order, ...registration.cart};

  return (
    <tr key={user.uid}>
      <th scope="row">
        <Link className="nav-link" to={`/admin/detail/${user.uid}`}>
          {`${user.profile.first_name} ${user.profile.last_name}            `}
        </Link>
      </th>
      <td>{!!order.singleSupplement && "Yes"}</td>
      <td>{order.roommate}</td>
    </tr>
  );
};

const renderRoomType = (roomType, registrations, event) => {
  let registrationsForRoomType = sortBy(registrations
    .filter(r => get(r, "registration.order.roomChoice") === roomType),
    r => [r.user.profile.last_name, r.user.profile.first_name]);
  return <tbody>
    <tr>
      <th colspan="3">{ROOM_DATA[roomType].title}</th>
    </tr>
    {registrationsForRoomType.length === 0 &&
      <tr>
        <td colspan="3"><span className="font-italic">None</span></td>
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
      <table className="table table-striped table-sm report-table">
        <thead>
          <tr>
            <th></th>
            <th class="col-single">Single Room?</th>
            <th>Room-mate</th>
          </tr>
        </thead>
        {roomTypes.map(rt => renderRoomType(rt, registrationItems, event))}
      </table>
    </div>
  );
}

export default RoomChoices;

import React from 'react'
import {render, Simulate, wait, fireEvent, prettyDOM} from 'react-testing-library'
import RoomChoice from '../../components/RoomChoice';

jest.mock('../../firebase', () => ({
  database: {
    ref: jest.fn()
  }
}));

const event = {
  earlyDiscount: {
    amount: 0.1,
    endDate: '2018-07-31'
  },
  priceList: {
    refrigerator: 2500,
    roomChoice: {
      basic: 42000,
      camper: 30000,
      commuter: 30000,
      dormitory: 38000,
      plus: 58000,
      standard: 50000
    },
    singleRoom: {
      basic: 12000,
      plus: 20000,
      standard: 16000
    },
    thursdayNight: 8000
  }
};

describe('when not logged in', () => {
  it('should not have anything selected initially', () => {
    const {getByLabelText, container} = render(<RoomChoice order={{}} event={event} />);

    const roomChoicePanes = container.querySelectorAll('.lodging-card');
    const thursdayNight = getByLabelText(/Thursday evening arrival/);
    const fridge = getByLabelText(/fridge/);
    const roommate = getByLabelText(/roommate/i);

    expect(roomChoicePanes.length).toEqual(6);
    roomChoicePanes.forEach(p => {
      expect(p.classList.contains('selected')).toBeFalsy();
    });

    expect(thursdayNight.checked).toBeFalsy();
    expect(fridge.checked).toBeFalsy();
    expect(roommate.value).toBeFalsy();
  });

  it('should select room type when clicked', () => {
    const {getByLabelText, container} = render(<RoomChoice order={{}} event={event} />);

    const roomChoicePanes = container.querySelectorAll('.lodging-card');

    Simulate.click(roomChoicePanes[3]);
    expect(roomChoicePanes[3].classList.contains('selected')).toBeTruthy();
  });
});

describe('when logged in', () => {
  const currentUser = "some-user";
  it('should submit the room choice', () => {
    let applyFn = jest.fn();
    const {getByText, container} = render(<RoomChoice order={{}}
      event={event}
      currentUser={currentUser}
      applyRoomChoice={applyFn} />);

    const roomChoicePanes = container.querySelectorAll('.lodging-card');
    Simulate.click(roomChoicePanes[3]);

    const submitButton = getByText('Continue');
    fireEvent.click(submitButton);

    expect(applyFn).toHaveBeenCalled();
    let [e, u, values] = applyFn.mock.calls[0];
    expect(values.roomChoice).toBeDefined();
  });
});

import * as actions from '../../actions/auth';
import { SIGN_IN } from '../../constants';

jest.mock('../../firebase', () => ({
  database: {
    ref: jest.fn()
  }
}));

describe('auth actions', () => {
  // it('should create an action to set the signed in user', () => {
  //   const user = {
  //     uid: 'some-uid',
  //     email: 'user@example.com'
  //   };
  //   const expectedAction = {
  //     type: SIGN_IN,
  //     uid: user.uid,
  //     email: user.email
  //   };
  //   expect(actions.signedIn(user)).toEqual(expectedAction);
  // });
});

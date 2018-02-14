import { driver, displayLogs, initFirebaseAdmin } from '../helpers';
import { signinPage, signupTabButton, emailField, passwordField, confirmPasswordField, signupSubmitButton, signinSubmitButton } from '../pageObjects/signin';
import { load } from '../pageObjects/index';
import { waitForEvent, signoutButton } from '../pageObjects/application';
import { earlyDepositRequest, displaysEarlyDepositRequest, waitForEarlyDepositRequest } from '../pageObjects/earlydeposit';

const signupUser = {
  email: 'newuser@e2etests.com',
  password: 'pa$$w0rd'
};
const signinUser = {
  email: 'existinguser@e2etests.com',
  password: 'pa55w0rd'
};

let firebaseAdmin;

const deleteUser = async (email) => {
  //lookup auth user
  let user;
  try {
    user = await firebaseAdmin.auth().getUserByEmail(email);
  } catch(e) {}
  if (!!user && !!user.uid) {
    //delete from db.users
    const userRef = firebaseAdmin.database().ref(`users/${user.uid}`);
    await userRef.remove();

    //delete auth user
    await firebaseAdmin.auth().deleteUser(user.uid);
  }
};

const createUser = async (email, password) => {
  //delete in case already exists
  await deleteUser(email);

  await firebaseAdmin.auth().createUser({
    email: email,
    password: password
  });
};

const signOut = async () => {
  let signout = await signoutButton();
  if (!!signout) {
    await signout.click();
  }
};

describe('SignUp', () => {
  beforeEach(async () => {
    firebaseAdmin = initFirebaseAdmin();
    await deleteUser(signupUser.email);
    await load();
    await waitForEvent();
  });

  it('should let a new user create an account', async () => {
    //initially display signin page
    expect(await signinPage().getText()).toContain(
      'Sign In'
    );

    //click on signin button to display signup form
    let button = await signupTabButton();
    await button.click();
    expect(await signinPage().getText()).toContain(
      'Create New Account'
    );

    //fill out form
    let email = await emailField(),
        password = await passwordField(),
        confirm = await confirmPasswordField();
    await email.sendKeys(signupUser.email);
    await password.sendKeys(signupUser.password);
    await confirm.sendKeys(signupUser.password);
    let submitButton = await signupSubmitButton();
    await submitButton.click();

    await waitForEarlyDepositRequest();
    // await displayLogs();
    // let source = await driver.getPageSource();
    // console.log("page source: ", source);

    //displays early deposit page
    expect(await displaysEarlyDepositRequest()).toBeTruthy();
  });
});

describe('SignIn', () => {
  beforeEach(async () => {
    firebaseAdmin = initFirebaseAdmin();
    await createUser(signinUser.email, signinUser.password);
    await load();
    await waitForEvent();
    await signOut();
    await waitForEvent();
  });

  it('should let an existing user log in', async () => {
    //initially display signin page
    expect(await signinPage().getText()).toContain(
      'Sign In'
    );

    //enter credentials
    let email = await emailField(),
        password = await passwordField();
    await email.sendKeys(signupUser.email);
    await password.sendKeys(signupUser.password);
    let submitButton = await signinSubmitButton();
    await submitButton.click();

    await waitForEarlyDepositRequest();

    //displays early deposit page
    expect(await displaysEarlyDepositRequest()).toBeTruthy();
  });
});

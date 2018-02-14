import { event } from './application';

const signinPageSelector = { css: '.signin-page' };
const signinTabSelector = { css: 'button#signin-btn' };
const signupTabSelector = { css: 'button#signup-btn' };

const emailFieldSelector = { css: 'input#email' };
const passwordFieldSelector = { css: 'input#password' };
const confirmPasswordFieldSelector = { css: 'input#confirm' };
const signupSubmitSelector = { css: 'button#signup-submit' };
const signinSubmitSelector = { css: 'button#signin-submit' };

export const signinPage = () => event().findElement(signinPageSelector);

export const signupTabButton = async () => {
  let page = await signinPage();
  return page.findElement(signupTabSelector);
}

export const emailField = async () => {
  let page = await signinPage();
  return page.findElement(emailFieldSelector);
}

export const passwordField = async () => {
  let page = await signinPage();
  return page.findElement(passwordFieldSelector);
}

export const confirmPasswordField = async () => {
  let page = await signinPage();
  return page.findElement(confirmPasswordFieldSelector);
}

export const signupSubmitButton = async () => {
  let page = await signinPage();
  return page.findElement(signupSubmitSelector);
}

export const signinSubmitButton = async () => {
  let page = await signinPage();
  return page.findElement(signinSubmitSelector);
}

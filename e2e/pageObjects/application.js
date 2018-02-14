import { until } from 'selenium-webdriver';
import { driver, defaultTimeout } from '../helpers';
import { root } from './index';

const eventSelector = { css: '.event' };
const signoutButtonSelector = { css: '#signout-btn' };

export const event = () => root().findElement(eventSelector);
export const signoutButton = async () => {
  let elements = await root().findElements(signoutButtonSelector);
  return elements.length > 0 && elements[0];
}

export const waitForEvent = async () => {
  await driver.wait(until.elementLocated(eventSelector), defaultTimeout);
};

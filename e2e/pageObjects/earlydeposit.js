import { event } from './application';
import { until, By } from 'selenium-webdriver';
import { driver, defaultTimeout } from '../helpers';

const earlyDepositRequestSelector = { css: '#early-deposit-request' };

export const earlyDepositRequest = () => event().findElement(earlyDepositRequestSelector);

export const displaysEarlyDepositRequest = async () => {
  let elements = await event().findElements(earlyDepositRequestSelector);
  return !!elements.length;
}

export const waitForEarlyDepositRequest = async () => {
  await driver.wait(until.elementLocated(By.id('early-deposit-request')), 5000);
}

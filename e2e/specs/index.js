import { driver } from '../helpers';
import { load } from '../pageObjects/index';

describe('index', () => {
  test('it should show the right title', async () => {
    await load();
    expect(await driver.getTitle()).toBe('Menschwork Registration');
  });
  test('it should show the right title', async () => {
    await load();
    expect(await driver.getTitle()).toBe('Menschwork Registration');
  });
});

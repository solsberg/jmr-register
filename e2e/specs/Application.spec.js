import { driver } from '../helpers';
import { waitForEvent, event } from '../pageObjects/application';
import { load } from '../pageObjects/index';

describe('events', () => {
  beforeEach(async () => {
    await load();
  });

  it('should load the event page', async () => {
    await waitForEvent();
    let url = await driver.getCurrentUrl();
    expect(url).toMatch(/jmr27$/);
  });

  // it('should show the right header', async () => {
  //   expect(await header().getText()).toBe('Welcome to React');
  // });
});

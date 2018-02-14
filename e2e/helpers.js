import { Builder, logging } from 'selenium-webdriver';
import firebaseAdmin from 'firebase-admin';
import firebaseAccountConfig from './firebaseAccountConfig-dev.json';

var loggingPrefs = new logging.Preferences();
loggingPrefs.setLevel('browser', logging.Level.ALL);

export const driver = new Builder()
  .forBrowser('chrome')
  .setLoggingPrefs(loggingPrefs)
  .usingServer('http://localhost:4444/wd/hub')
  .build();

export const displayLogs = async () => {
  let logs = await driver.manage().logs()
        .get('browser');
  console.log('browser log: ', logs);
};

let appInitialized = false;
export const initFirebaseAdmin = () => {
  if (!appInitialized) {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(firebaseAccountConfig),
      databaseURL: 'https://jmr-register.firebaseio.com'
    });
    appInitialized = true;
  }
  return firebaseAdmin;
};

afterAll(async () => {
  // Cleanup `process.on('exit')` event handlers to prevent a memory leak caused by the combination of `jest` & `tmp`.
  for (const listener of process.listeners('exit')) {
    listener();
    process.removeListener('exit', listener);
  }
  await driver.quit();
});

export const defaultTimeout = 10e3;

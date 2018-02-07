const common_config = {
};

const environment_configs = {
  production: {
    API_BASE_URL: 'https://jm43540w46.execute-api.us-east-1.amazonaws.com/prod/',
    FIREBASE_PROJECT_ID: 'jmr-register-live'
  },
  development: {
    API_BASE_URL: 'https://jm43540w46.execute-api.us-east-1.amazonaws.com/dev/',
    FIREBASE_PROJECT_ID: 'jmr-register'
  }
};

let env = process.env.NODE_ENV;
if (!!process.env.REACT_APP_STAGING) {
  env = 'development';
}
export default {...common_config, ...environment_configs[env]};

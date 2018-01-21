const common_config = {
};

const environment_configs = {
  production: {
  },
  development: {
    API_BASE_URL: 'https://jm43540w46.execute-api.us-east-1.amazonaws.com/dev/',
    FIREBASE_PROJECT_ID: 'jmr-register'
  }
};

export default {...common_config, ...environment_configs[process.env.NODE_ENV]};

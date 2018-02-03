This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).

### Environment Config settings

##### .env.<*env_name*>.local  
e.g.
>.env.development.local

REACT_APP_FIREBASE_API_KEY  
REACT_APP_STRIPE_PUBLIC_KEY  


##### config.js

API_BASE_URL  
FIREBASE_PROJECT_ID  

### Firebase Project settings
Settings to be duplicated between per-environment projects  

* Project settings
  * Public-facing name
* Database (can export/import json)
  * events key
  * imported contact info?
* Database permissions rules - copy & paste
* Authentication settings
  * Signin methods
    * with any method settings
    * Facebook AppID & secret
      * need to create at https://developers.facebook.com/apps/
      * set correct redirect url under Settings-Facebook Login - from firebaseConfig.authDomain
  * authorized domains
  * email templates
    * Password reset
    * Email verification

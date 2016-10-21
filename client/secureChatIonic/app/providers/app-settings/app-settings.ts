//Class to simply store app keys
export class AppSettings {

  //How to ignore changes on this file: http://stackoverflow.com/a/17410119
  //DO NOT UPLOAD ACTUAL KEYS TO GITHUB

  //Fake key for now, to get the dialog working
  //Can be stored on the client: http://stackoverflow.com/questions/6709883/facebook-app-security-what-if-someone-uses-my-appid
  static facebookAppId = '2345671234542689';

  //The name of the json object stored on the device
  /*
  schema
  {
        user: {
            name:""
            email:""
            etc....
        }
        keys: {
            public: 'sdjlaksjda'
            private: 'askjdklsjd'
        },
        access_token: 'token'
    }
  */
  static shushItemName = 'shushUser';

  //Add our server URL (Local testing not actual)
  //Must end with a slash
  static serverUrl = 'http://192.168.43.86:4780/api/v1/';

}

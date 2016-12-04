//Class to simply store app keys
export class AppSettings {

  //How to ignore changes on this file: http://stackoverflow.com/a/17410119 (If desired)

  //Can be stored on the client: http://stackoverflow.com/questions/6709883/facebook-app-security-what-if-someone-uses-my-appid
  static facebookAppId = '1867451080142485';

  //Poll interval for things like settings
  static pollInterval = 30000;

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

  /**
   * The public key store to validate friends against for conversations and things
   * schema
   * Key = User facebook id
   * Value = user public key
   */
  static shushLocalPublicKeyStore = 'shushPublicKeys';

  /**
   * The private key store for all users on the device
   * schema
   * Key = User facebook id
   * privateKey = the private key for the facebook id
   * publicKey = the public key for the facebook id
   */
  static shushLocalPrivateKeyStore = 'shushPrivateKeys';

  //Add our server URL (Not Final)
  //Must end with a slash
  static serverUrl = 'https://shushapi.aaronthedev.com/api/v1/';

}

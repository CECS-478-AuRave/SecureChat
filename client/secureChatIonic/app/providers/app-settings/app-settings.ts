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
  static shushLocalKeyStore = 'shushUserKeys';

  /*
   * Strings to show during a server public key change
   */
  static maliciousPublicKey = {
    title: 'Warning, A Public Key from the server has changed!',
    text: 'The public key we received from the server has changed. This means, either you friend has gotten a new device, or re-installed the application, or someone may have compromised the server and is trying to intercept your messages. We HIGHLY suggest you contact your friend, through another medium, and compare public keys from their "My profile tab" on their device, and their public profile on you\'re device. The public key of you\'re friend will be saved to this device from now on.'
  }

  //Add our server URL (Local testing not actual)
  //Must end with a slash
  static serverUrl = 'http://localhost:4780/api/v1/';

}

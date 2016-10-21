//Class to simply store app keys
export class AppSettings {

  //How to ignore changes on this file: http://stackoverflow.com/a/17410119
  //DO NOT UPLOAD ACTUAL KEYS TO GITHUB

  //Declare our keys
  static testing = 'testing test';

  //Fake key for now, to get the dialog working
  //Can be stored on the client: http://stackoverflow.com/questions/6709883/facebook-app-security-what-if-someone-uses-my-appid
  static facebookAppId = '2365441780952680';

  //The name of the json object stored on the device
  static shushItemName = 'shushUser';



  //Add our server URL (Local testing not actual)
  //Must end with a slash
  static serverUrl = 'http://192.168.43.86:4780/api/v1/';

}

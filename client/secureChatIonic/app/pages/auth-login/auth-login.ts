import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

//CryptoJs installed via: https://forum.ionicframework.com/t/import-crypto-js-in-ionic2/54869/3
import * as CryptoJS from 'crypto-js';

//Pages
import { AllConversationsPage } from '../../pages/all-conversations/all-conversations';

//Import our providers (services)
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppAuth } from '../../providers/app-auth/app-auth';

//3P JS library
//https://www.thepolyglotdeveloper.com/2016/01/include-external-javascript-libraries-in-an-angular-2-typescript-project/
declare var kbpgp: any;

/*
  Generated class for the AuthLoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/auth-login/auth-login.html',
})

export class AuthLoginPage {

  constructor(private navCtrl: NavController, private appNotify: AppNotify, private appAuth: AppAuth) { }

  //Call our log in function from our auth service
  login() {

    //Start Loading
    this.appNotify.startLoading('Logging in...');

    //Save a reference to this
    let self = this;

    let response = this.appAuth.login();

    //Respond to the callback
    response.subscribe(function(fbRes: any) {
      //Success!

      //Now subscribe to our server login response
      fbRes.request.subscribe(function(success: any) {
        //Success

        //Create our new user
        let userJson = {
          user: {},
          access_token: '',
          keys: {}
        };
        //Get the neccesary info from the user object
        userJson.user = success.user;
        userJson.access_token = fbRes.access_token;

        //TODO: Generate Encryption keys for the user if none
        //Use the access token and pbkdf2 to help generate the pgp key pair
        console.log(kbpgp);

        userJson.keys = {};

        //Save the user info
        localStorage.setItem(AppSettings.shushItemName, JSON.stringify(userJson));

        //Update the auth status
        self.appAuth.updateAuthStatus(true);

        //Stop Loading
        self.appNotify.stopLoading().then(function() {
          //Toast What Happened
          //In a timeout to avoid colliding with loading
          setTimeout(function() {
            //Show Toast
            self.appNotify.showToast('Login Successful!');

            //Redirect to messages page
            self.navCtrl.setRoot(AllConversationsPage);
          }, 250)
        });
      }, function(error) {
        //Error
        //Stop Loading
        self.appNotify.stopLoading().then(function() {

          //There was an error connecting to facebook
          self.appNotify.handleError(error);
        });
      }, function() {
        //Complete
      });
    }, function(error) {

      //Error
      //Stop Loading
      self.appNotify.stopLoading().then(function() {

        //There was an error connecting to facebook
        self.appNotify.showToast('Error, Facebook did not return your credentials.');
      });
    }, function() {
      //Subscription has completed
    })
  }

}

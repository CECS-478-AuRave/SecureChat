import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';

//Import Pages we navigate to
import { AllMessagesPage } from '../../pages/all-messages/all-messages';

//Import our providers (services)
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotification } from '../../providers/app-notification/app-notification';

/*
  Generated class for the AppAuth provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI
*/
@Injectable()
export class AppAuth {

  //Our user accesToken
  /*
  User schema
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
  user: any;

  //Class constructor
  constructor(private http: Http, private appNotification: AppNotification, private app: App) {

    //Grab our user from localstorage
    if (localStorage.getItem('shushUser')) {
      this.user = JSON.parse(localStorage.getItem('shushUser'));
      //TEMP
      //   this.user = {
      //     access_token: false
      //   };
    } else {
      this.user = {
        access_token: false
      };
    }
  }

  //Return our Login Status
  authStatus() {
    if (this.user.access_token) return true;
    return false;
  }

  //Initialize facebook
  initFacebook() {
    //Init the facebook sdk
    FB.init({
      appId: AppSettings.facebookAppId,
      cookie: true,
      version: 'v2.6'
    });
  }


  //Login
  //Scope asks for permissions that we need to create/identify users
  login() {

    //Make a reference to 'this' to avoid scoping this issue
    let self = this;
    FB.login(function(response) {

      //Response from facebook on function call
      let jsonResponse = response.authResponse;

      //Pass the access token to our server login
      let payload = {
        access_token: jsonResponse.accessToken
      }
      self.serverLogin(payload);

    }, {
        scope: 'email'
      });
  }

  //Logout
  logout() {
    FB.logout(function(response) {

      // Person is now logged out
      console.log(response);

      //No work is needed by the server, since the token will invalidate itself in OAuth
      //Simply redirect to home

    });
  }

  //Private functions for server requests
  //How to make REST requests in Angular 2: http://stackoverflow.com/questions/34671715/angular2-http-get-map-subscribe-and-observable-pattern-basic-understan/34672550
  private serverLogin(payload) {

    //Save a reference to this
    let self = this;

    //Convert the payload to a string
    JSON.stringify(payload);

    //Send the request with the payload to the server
    var response = this.http.post(AppSettings.serverUrl + 'login', payload).map(res => res.json());
    //Respond to the callback
    response.subscribe(function(success) {
      //Success!

      //Get the neccesary info from the user object
      self.user.user = success.user
      self.user.access_token = payload.access_token;
      //TODO: Generate Encryption keys for the user if none
      self.user.keys = {};

      //Save the user info
      localStorage.setItem('shushUser', JSON.stringify(self.user));

      //Show a notification
      self.appNotification.showToast('Login Successful!');

      //Redirect to messages page
      let nav = self.app.getRootNav();
      nav.setRoot(AllMessagesPage);

      //Redirect the user to the messages screen
      console.log(success);
    }, function(error) {

      //Error
      //TODO: Pass to error Handler
      self.appNotification.showToast('Login Failed');

      //Toast the user or something
      console.log(error);
    })

  }

}

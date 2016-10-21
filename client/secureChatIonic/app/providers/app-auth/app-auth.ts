import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';

//Import our providers (services)
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';

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

  //Class constructor
  constructor(private app: App, private http: Http, private appNotify: AppNotify) {
  }

  //Return our Login Status
  authStatus() {

    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName))
    if (user && user.access_token) {
      return true
    }
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

    //Start Loading
    this.appNotify.startLoading('Logging out...');

    //No work is needed by the server, since the token will invalidate itself in OAuth

    //Get our stored user
    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName))
    if (user && user.access_token) user.access_token = false;;
    if (user && user.user) user.user = {};

    //Set the user to false
    localStorage.setItem(AppSettings.shushItemName, JSON.stringify(user));

    //Store reference to this for timeout
    let self = this;

    //Stop Loading
    this.appNotify.stopLoading().then(function() {
      //Toast What Happened
      //In a timeout to avoid colliding with loading
      setTimeout(function() {
        self.appNotify.showToast('Logout Successful!');
      }, 250)
    });

    //Redirect to messages page
    // let nav = this.app.getRootNav();
    // nav.setRoot(Home);
  }

  //Private functions for server requests
  //How to make REST requests in Angular 2: http://stackoverflow.com/questions/34671715/angular2-http-get-map-subscribe-and-observable-pattern-basic-understan/34672550
  private serverLogin(payload) {

    //Start Loading
    this.appNotify.startLoading('Logging in...');

    //Save a reference to this
    let self = this;

    //Send the request with the payload to the server
    var response = this.http.post(AppSettings.serverUrl + 'login', payload).map(res => res.json());

    //Respond to the callback
    response.subscribe(function(success) {
      //Success!

      //Create our new user
      let userJson = {
        user: {},
        access_token: '',
        keys: {}
      };
      //Get the neccesary info from the user object
      userJson.user = success.user
      userJson.access_token = payload.access_token;
      //TODO: Generate Encryption keys for the user if none
      userJson.keys = {};

      //Save the user info
      localStorage.setItem(AppSettings.shushItemName, JSON.stringify(userJson));

      //Stop Loading
      self.appNotify.stopLoading().then(function() {
        //Toast What Happened
        //In a timeout to avoid colliding with loading
        setTimeout(function() {
          self.appNotify.showToast('Login Successful!');
        }, 250)
      });

      //Redirect to messages page
      //   let nav = self.app.getRootNav();
      //   nav.setRoot(AllMessagesPage);
    }, function(error) {

      //Error
      //Stop Loading
      self.appNotify.stopLoading().then(function() {
        //Pass to Error Handler
        self.appNotify.handleError(error);
      });
    }, function() {
      //Subscription has completed
    })

  }


}

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Facebook } from 'ionic-native';
import 'rxjs/add/operator/map';

//pages
import { Home } from '../../pages/home/home';

//Import our providers (services)
import { AppSettings } from '../../providers/app-settings/app-settings';

@Injectable()
export class AppAuth {

  //Our auth status
  authStatus: boolean;

  //Class constructor
  constructor(private http: Http) {

    //Ensure we have a user object in localstore
    //Ensure that we has a public key store, create one if not
    if(!localStorage.getItem(AppSettings.shushItemName)) {
      localStorage.setItem(AppSettings.shushItemName, JSON.stringify({}));
    }

    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName))
    if (user && user.access_token) {
      this.updateAuthStatus(true);
    } else {
      this.updateAuthStatus(false);
    }
  }

  //Return our Login Status
  updateAuthStatus(status) {
    this.authStatus = status;
  }

  //Initialize facebook
  initFacebook() {
    Facebook.browserInit(parseInt(AppSettings.facebookAppId), 'v2.8');
  }

  //Login
  //Scope asks for permissions that we need to create/identify users
  //How to make REST requests in Angular 2: http://stackoverflow.com/questions/34671715/angular2-http-get-map-subscribe-and-observable-pattern-basic-understan/34672550
  login() {

    //Get a reference to self
    let self = this;

    //Create our facebook requested permissions
    let fbPermissions = [
      'public_profile',
      'email',
    ];

    //Create a new observable
    //https://medium.com/@benlesh/learning-observable-by-building-observable-d5da57405d87#.g2xfbgf3h
    //observer.next => success, observer.error => error, observer.complete => complete
    return new Observable(function(observer) {
      console.log('Starting login!');
      Facebook.login(fbPermissions).then(response => {

        //Response from facebook on function call
        let jsonResponse = response.authResponse;

        //Check for an error
        if (!jsonResponse) {
          observer.error(response);
          return;
        }

        //Pass the access token to our server login
        let payload = {
          access_token: jsonResponse.accessToken
        }

        let serverRequest = self.http.post(AppSettings.serverUrl + 'login', payload).map(res => res.json());

        observer.next({
          request: serverRequest,
          access_token: jsonResponse.accessToken
        });

      }, function(error) {
        //Error
        observer.error(error);
      });
    });
  }

  //Logout
  logout() {
    //No work is needed by the server, since the token will invalidate itself in OAuth

    //Get our stored user
    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName))
    user = {};

    //Set the user to false
    localStorage.setItem(AppSettings.shushItemName, JSON.stringify(user));

    //Update the auth status
    this.updateAuthStatus(false);
  }


}

import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { App } from 'ionic-angular';
import 'rxjs/add/operator/map';
import {Observable} from 'rxjs/Observable';

//pages
import { Home } from '../../pages/home/home';

//Import our providers (services)
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';

@Injectable()
export class AppAuth {

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
  //How to make REST requests in Angular 2: http://stackoverflow.com/questions/34671715/angular2-http-get-map-subscribe-and-observable-pattern-basic-understan/34672550
  login() {

    //Get a reference to self
    let self = this;

    //Create a new observable
    //https://medium.com/@benlesh/learning-observable-by-building-observable-d5da57405d87#.g2xfbgf3h
    //observer.next => success, observer.error => error, observer.complete => complete
    return new Observable(function(observer) {

      FB.login(function(response) {

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

        let request = self.http.post(AppSettings.serverUrl + 'login', payload).map(res => res.json());


        observer.next({
          request: request,
          access_token: jsonResponse.accessToken
        });

      }, {
          scope: 'email'
        });

    })
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
    //Force the user to the login page
    let nav = this.app.getRootNav();
    nav.setRoot(Home);
  }


}

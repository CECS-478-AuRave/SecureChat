import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

//Import our providers (services)
import { AppSettings } from '../../providers/app-settings/app-settings';

/*
  Generated class for the AppAuth provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI
*/
@Injectable()
export class AppAuth {

  //Our user accesToken
  accesToken: string;

  //Class constructor
  constructor(private http: Http) {

    //Init the facebook sdk
    //Also, placing in a timeout, to allow animations before making request
    setTimeout(this.initFb(), 1000)
  }

  //Private functions for server requests
  private serverLogin() {
    // return this.http.post(this.heroesUrl, body, options)
    //   .map(this.extractData)
    //   .catch(this.handleError);
  }

  //Init facebook function
  initFb() {
    //Key must be in the same FB format, or ese everything is untestable
    FB.init({
      appId: AppSettings.facebookAppId,
      cookie: true,
      version: 'v2.6'
    });

    //Next, get the current log in status
    FB.getLoginStatus(function(response) {
      //We have our response on our user
      console.log(response);
      if (response.status === 'connected') {
        // Logged into your app and Facebook.
      } else if (response.status === 'not_authorized') {
        // The person is logged into Facebook, but not your app.
      } else {
        // The person is not logged into Facebook, so we're not sure if
        // they are logged into this app or not.
      }
    });
  }

  //Login
  //Scope asks for permissions that we need to create/identify users
  login() {
    FB.login(function(response) {
      //Response from facebook on function call
      console.log(response);
    }, {
        scope: 'email'
      });
  }

  //Logout
  logout() {
    FB.logout(function(response) {
      // Person is now logged out
      console.log(response);
    });
  }

}

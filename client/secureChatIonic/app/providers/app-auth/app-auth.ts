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
    setTimeout(function() {
      FB.init({
        appId: AppSettings.facebookAppId,
        cookie: true,
        version: 'v2.6'
      });
    }, 1000)
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

    //Convert the payload to a string
    JSON.stringify(payload);

    //Send the request with the payload to the server
    var response = this.http.post(AppSettings.serverUrl, payload).map(res => res.json());
    //Respond to the callback
    response.subscribe(function(success) {
      //Success!
      //Redirect the user to the messages screen
      console.log("YAY!");
      console.log(success);
    }, function(error) {
      //error
      //Toast the user or something
      console.log("BOO!");
      console.log(error);
    })

  }

}

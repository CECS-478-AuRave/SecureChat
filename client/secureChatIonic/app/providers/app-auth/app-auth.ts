import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

//Import our providers (services)
import { AppKeys } from '../../providers/app-keys/app-keys';

/*
  Generated class for the AppAuth provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI
*/
@Injectable()
export class AppAuth {

  //Class constructor
  constructor(private http: Http) {

    //Init the facebook sdk
    //Key must be in the same format, or ese everything is untestable
    window.fbAsyncInit = function() {
      FB.init({
        appId: AppKeys.facebookApiKey,
        version: 'v2.6'
      });
    };
    window.fbAsyncInit();
  }

  //Login
  login() {
    FB.login(function(response) {
      //Response from facebook on function call
      console.log(response);
    });
  }

}

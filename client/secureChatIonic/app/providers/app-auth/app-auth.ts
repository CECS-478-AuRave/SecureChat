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

    window.fbAsyncInit = function() {
      FB.init({
        appId: '{your-app-id}',
        status: true,
        cookie: true,
        version: 'v2.6'
      });
    };

    // //Set our services
    // this.fbService = fb;
    //
    // //Initialize our facebook service
    // let fbParams: FacebookInitParams = {
    //   appId: AppKeys.facebookApiKey,
    //   version: 'v2.4'
    // };
    // this.fbService.init(fbParams);
  }

  //Login
  login() {
    FB.login(function(response) {
      //Response from facebook on function call
    });
    return AppKeys.facebookApiKey;
  }

}

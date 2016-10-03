import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { FacebookService, FacebookLoginResponse } from 'ng2-facebook-sdk/dist';
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

  //Declare our injected Services
  fbService: FacebookService;

  //Class constructor
  constructor(private http: Http, private fb: FacebookService) {

    //Set our services
    this.fbService = fb;

    //Initialize our facebook service
    this.fbService.init({
      appId: AppKeys.facebookApiKey,
      version: 'v2.4'
    });
  }

  //Login
  login() {
    this.fbService.login().then(
      (response: FacebookLoginResponse) => console.log(response),
      (error: any) => console.error(error)
    );
    return AppKeys.facebookApiKey;
  }

}

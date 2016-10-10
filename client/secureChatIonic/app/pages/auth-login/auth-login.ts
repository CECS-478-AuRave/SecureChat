import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

//Import our providers (services)
import { AppAuth } from '../../providers/app-auth/app-auth';

/*
  Generated class for the AuthLoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/auth-login/auth-login.html',
})

export class AuthLoginPage {

  //Declare our service we shall be injecting
  private authProvider: AppAuth;

  constructor(private navCtrl: NavController, private injectedAuth: AppAuth) {

    //Set our service to our variable
    this.authProvider = injectedAuth;
  }

  login() {
    console.log(this.authProvider.login());
  }

}

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

  constructor(private navCtrl: NavController) {
  }

  login()  {
      console.log(AppAuth.login());
  }

}

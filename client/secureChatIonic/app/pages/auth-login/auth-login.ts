import { Component, ViewChild } from '@angular/core';
import { Content, NavController } from 'ionic-angular';

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
  //Get reference to our ion-content
  @ViewChild(Content) content: Content;

  constructor(private navCtrl: NavController, private authProvider: AppAuth) { }

  //Function called once the view is full loaded
  ionViewDidEnter() {
    //Initialize facebook
    this.authProvider.initFacebook();
  }

  //Call our log in function from our auth service
  login() {
    this.authProvider.login();
  }

}

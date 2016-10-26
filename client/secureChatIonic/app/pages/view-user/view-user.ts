import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';

/*
  Generated class for the ViewUserPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/view-user/view-user.html',
})
export class ViewUserPage {

  user: any;

  constructor(private changeDetector: ChangeDetectorRef, private navCtrl: NavController, private navParams: NavParams) {
    if (!this.navParams.get('friend')) {
      //Initialize the page with the user
      let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));
      this.user = user.user;
      console.log(this.user);

      //Update the UI
      //this.changeDetector.detectChanges();
    }

    //Grab the friend
  }

}

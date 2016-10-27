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
      let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName)).user;
      this.user = user;
      console.log(this.user);

      //Update the UI
      //this.changeDetector.detectChanges();
    }

    //Grab the friend
  }

  //Get the user type. 0 = not friend, 1 = friend, 2 = current user
  getUserType() {
    //Get our current user
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName)).user;
    //If they are the user, return 2
    if (this.user._id == user._id) return 2;

    //Now check if it is a user or not
    //If they are not the user, return 0. else return 1;
    if (this.user.friends.indexOf(user._id) < 0) return 0;
    else return 1;
  }

}

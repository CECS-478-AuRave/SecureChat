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

  //Get the user type. 0 = is the user, 1 = not friend, 2 = pending friend, 3 = friend
  getUserType() {
    //Get our current user
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName)).user;
    //If they are the user, return
    if (this.user._id == user._id) return 0;

    //Check if they are a friend, return 3
    if (this.user.friends.indexOf(user._id) > 0) return 3;
    //Check if they are a pending friend
    else if (this.user.pendingFriends.indexOf(user._id) > 0) return 2;
    //Else they are not our friend
    else return 1;
  }

}

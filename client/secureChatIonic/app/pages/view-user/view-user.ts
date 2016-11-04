import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppUsers} from '../../providers/app-users/app-users';

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

  constructor(private changeDetector: ChangeDetectorRef, private navCtrl: NavController, private navParams: NavParams, private appNotify: AppNotify, private appUsers: AppUsers) {


    //Get our user
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName)).user;

    //Set to ourselves for now
    this.user = user;

    //Get the passed user
    let passedUser = this.navParams.get('user');

    //Check if we should show our user, return if it is
    if (!passedUser || passedUser._id == user._id) return;

    //Start Loading
    this.appNotify.startLoading('Getting User...');

    console.log(passedUser);

    //Grab the User
    let request = this.appUsers.getUserById(passedUser.facebook.id);

    //Get a reference to this
    let self = this;

    //Subscribe to the request
    request.subscribe(function(success) {
      //success

      //Stop loading
      self.appNotify.stopLoading().then(function() {
        console.log(success);
      });

    }, function(error) {
      //error

      //Stop loading
      self.appNotify.stopLoading().then(function() {
        self.appNotify.handleError(error);
      });

    }, function() {
      //Complete
    });
  }

  //Get the user type. 0 = is the user, 1 = not friend, 2 = pending friend, 3 = friend
  getUserType() {

    //CHeck if we currently have a user
    if(!this.user || !this.user._id) return;

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

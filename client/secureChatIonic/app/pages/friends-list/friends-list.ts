import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppUsers} from '../../providers/app-users/app-users';

/*
  Generated class for the FriendsListPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/friends-list/friends-list.html',
})
export class FriendsListPage {

  friends: any;

  constructor(private changeDetector: ChangeDetectorRef, private navCtrl: NavController, private appNotify: AppNotify, private appUsers: AppUsers) {

    //Get the user
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

    //Update our user object with any new friends

    //Set the friends on the user object
    this.friends = user.user.friends;
  }

  //Function called once the view is full loaded
  ionViewDidEnter() {

    //Update our user

    //Start Loading
    this.appNotify.startLoading('Getting Friends...');

    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName))

    if (!user || !user.user) return;

    //Start polling to get messages
    let request = this.appUsers.getUserById(user.user._id);

    //Get a reference to this
    let self = this;

    //Get our current conversation
    request.subscribe(function(success) {
      //Success!
      //Stop loading
      self.appNotify.stopLoading().then(function() {

        //Save our user object
        user.user = success;
        localStorage.setItem(AppSettings.shushItemName, JSON.stringify(user));

      });
    }, function(error) {
      //Error!
      //Stop Loading
      self.appNotify.stopLoading().then(function() {
        self.appNotify.handleError(error);
      });

    }, function() {
      //Completed
    })
  }

  //Function to return if we have conversations
  hasFriends() {
    //Return true if we have no friends object, or if the length is not zero
    if (!this.friends && this.friends.length != 0) return true;
    else return false;
  }

}

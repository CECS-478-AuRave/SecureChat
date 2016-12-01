import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppUsers} from '../../providers/app-users/app-users';

//Our Pages we navigate to
import { NewConversationPage } from '../../pages/new-conversation/new-conversation';

/*
  Generated class for the ViewUserPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/view-user/view-user.html',
})
export class ViewUserPage {

  //Map of what each user type means, and map to what request to make on the user
  userTypeMap: any;

  //The user that is being displayed
  user: any;

  constructor(private changeDetector: ChangeDetectorRef, private navCtrl: NavController, private navParams: NavParams, private appNotify: AppNotify, private appUsers: AppUsers) {

    //Create our map of user types, and their requests
    this.userTypeMap = {
      currentUser: 0,
      notFriend: 1,
      requestPending: 2,
      pendingFriend: 3,
      friend: 4,
      requests: {
        addFriend: 10,
        acceptRequest: 11,
        declineRequest: 12,
        deleteFriend: 13
      }
    }

    //Get our user
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName)).user

    //Set to ourselves for now
    this.user = user;

    //Get the passed user
    let passedUser = this.navParams.get('user');

    //Check if we should show our user, return if it is
    if (!passedUser || passedUser._id == user._id) return;

    //Get the user
    this.getUser(passedUser, false);


  }

  //Function to get the user
  getUser(passedUser, toastText) {
    //Start Loading
    this.appNotify.startLoading('Getting User...');

    //Grab the User
    let request = this.appUsers.getUserById(passedUser.facebook.id);

    //Get a reference to this
    let self = this;

    //Subscribe to the request
    request.subscribe(function(success) {
      //success

      //Stop loading
      self.appNotify.stopLoading().then(function() {
        //Set our user
        self.user = success;

        //Update the UI
        self.changeDetector.detectChanges();

        //Toast the success
        if(toastText) self.appNotify.showToast(toastText);
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

  //Function that will make the needed request for the user
  //E.g, add friend, remove friend etc...
  //Generalized since they will all just toast the result, and update the UI
  editUserStatus(requestType) {

    //Start Loading
    this.appNotify.startLoading('Getting User...');

    //Get a reference to this
    let self = this;

    //Our user id
    let userId = this.user.facebook.id;

    //Get our request and success text
    let observe: any;
    let successText: any;

    if(this.userTypeMap.requests.addFriend === requestType) {
      observe = this.appUsers.addFriend(userId);
      successText = 'Sent friend request!';
    } else if(this.userTypeMap.requests.acceptRequest === requestType) {
      observe = this.appUsers.acceptFriend(userId);
      successText = 'You are now friends!';
    } else if(this.userTypeMap.requests.declineRequest === requestType) {
      observe = this.appUsers.declineFriend(userId);
      successText = 'Declined the friend request.';
    } else if(this.userTypeMap.requests.deleteFriend === requestType) {
      observe = this.appUsers.deleteFriend(userId);
      successText = 'Friend deleted';
    } else {
      //Invlid request type
      return;
    }

    observe.subscribe(function(success) {
      //Success

      //Stop loading
      self.appNotify.stopLoading().then(function() {

        //Get the user, and send the successText
        self.getUser(self.user, successText);
      });
    }, function(error) {
      //Error

      //Stop loading
      self.appNotify.stopLoading().then(function() {
        self.appNotify.handleError(error);
      });
    }, function() {
      //Complete

      //Update the UI
      self.changeDetector.detectChanges();
    });

  }

  //Get the user type, refers to the user type map in the constructor
  getUserType() {

    //CHeck if we currently have a user
    if(!this.user || !this.user._id) return;

    //Get our current user
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName)).user;

    //If they are the user, return
    if (this.user._id == user._id) return this.userTypeMap.currentUser;

    //Check if they are a friend, return 3
    if (this.user.friends.indexOf(user.facebook.id) > 0) return this.userTypeMap.friend;
    //Check if they are a pending friend
    else if (user.pendingFriends.indexOf(this.user.facebook.id) >= 0) return this.userTypeMap.pendingFriend;
    //Check if the user has us as a pending request
    else if (this.user.pendingFriends.indexOf(user.facebook.id) >= 0) return this.userTypeMap.requestPending;
    //Else they are not our friend
    else return this.userTypeMap.notFriend;
  }

  //Function to handle if a user would like to send another user a message
  sendUserMessage() {

    //Go to the new conversation page, and pass the user
    this.navCtrl.push(NewConversationPage, {
      user: this.user
    });
  }

}

import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppUsers } from '../../providers/app-users/app-users';

//Our Pages
import { ViewUserPage } from '../../pages/view-user/view-user';

/*
  Generated class for the SearchFriendsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/search-friends/search-friends.html',
})
export class SearchFriendsPage {

  //Our Search bar content
  searchQuery: string = '';

  //Our returned items we searched for
  searchItems: string[];

  //Our observable request
  searchRequest: any;

  //If we are currently making requests to the backend
  isLoading: boolean;

  constructor(private changeDetector: ChangeDetectorRef, private navCtrl: NavController, private navParams: NavParams, private appNotify: AppNotify, private appUsers: AppUsers) {

    //Set our search items to empty
    this.searchItems = [];

    //Set is loading to false
    this.isLoading = false;
  }

  //Go to a users page
  goToUser(user) {
    //Go to the conversation page, and pass the conversation id
    this.navCtrl.push(ViewUserPage, {
      user: user
    });
  }

  //Make a request to the server to search for a user
  getSearchQuery() {

    //Dont query if no text
    if(this.searchQuery.length <= 0) return;

    //Set our search items to empty
    this.searchItems = [];

    //Start loading
    this.isLoading = true;

    //Cancel any observables we have running
    if(this.searchRequest) this.searchRequest.unsubscribe();

    //Get a reference to self
    let self = this;

    //Search for the user
    this.appUsers.searchUsers(this.searchQuery).subscribe(function(success) {
      //Success!

      //Set is loading to false
      self.isLoading = false;

      //Set our returned search items
      self.searchItems = success;

      //Update the UI
      self.changeDetector.detectChanges();

    }, function(error) {
      //Error!

      //Set is loading to false
      self.isLoading = false;

      //Error
      self.appNotify.handleError(error, [{
        status: 404,
        callback: function() {
          //Dontdo anything
          self.searchItems = [];
        }
      }]);

      //Update the UI
      self.changeDetector.detectChanges();
    }, function() {
      //Completed
    });
  }
}

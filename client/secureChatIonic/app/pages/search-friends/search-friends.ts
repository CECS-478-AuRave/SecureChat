import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppUsers } from '../../providers/app-users/app-users';

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

  constructor(private navCtrl: NavController, private appNotify: AppNotify, private appUsers: AppUsers) {

    //Set our search items to empty
    this.searchItems = [];

    //Set is loading to false
    this.isLoading = false;
  }

  getSearchQuery() {

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
      this.isLoading = false;


      console.log(success);

      //Set our returned search items

      // if the value is an empty string don't filter the items
      if (this.searchQuery && this.searchQuery.trim() != '') {
        this.searchItems = this.searchItems.filter((item) => {
          return (item.toLowerCase().indexOf(this.searchQuery.toLowerCase()) > -1);
        })
      }
    }, function(error) {
      //Set is loading to false
      this.isLoading = false;

      //Error
      self.appNotify.handleError(error);
    }, function() {
      //Completed
    })
  }
}

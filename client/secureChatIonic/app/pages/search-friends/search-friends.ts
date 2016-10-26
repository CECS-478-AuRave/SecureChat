import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';

/*
  Generated class for the SearchFriendsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/search-friends/search-friends.html',
})
export class SearchFriendsPage {

  searchQuery: string = '';
  searchItems: string[];

  constructor(private navCtrl: NavController) {
    this.initializeSearchItems();
  }

  initializeSearchItems() {
    this.searchItems = [
      'Amsterdam',
      'Bogota',
    ];
  }

  getSearchItems(ev: any) {
    // Reset items back to all of the items
    this.initializeSearchItems();

    // set val to the value of the searchbar
    let val = ev.target.value;

    // if the value is an empty string don't filter the items
    if (val && val.trim() != '') {
      this.searchItems = this.searchItems.filter((item) => {
        return (item.toLowerCase().indexOf(val.toLowerCase()) > -1);
      })
    }
  }
}

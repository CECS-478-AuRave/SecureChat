import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

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

  constructor(private navCtrl: NavController) {

    //Initialize friends
    this.friends = [2, 3, 4, 5];
  }

}

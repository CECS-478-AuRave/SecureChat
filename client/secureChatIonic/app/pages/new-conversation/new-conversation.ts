import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppMessaging } from '../../providers/app-messaging/app-messaging';
import { AppUsers} from '../../providers/app-users/app-users';

@Component({
  templateUrl: 'build/pages/new-conversation/new-conversation.html',
})
export class NewConversationPage {

  //Our reply ng-model data
  replyMessage: string;

  //Our user's friends
  friends: any;

  constructor(private changeDetector: ChangeDetectorRef, private navCtrl: NavController, private navParams: NavParams, private appNotify: AppNotify,
    private appMessaging: AppMessaging, private appUsers: AppUsers) {

    //Initialize friends
    this.friends = [];
  }

  //Call function every time the view loads
  ionViewDidEnter() {

    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName))

    if (!user || !user.user) return;

    //Start Loading
    this.appNotify.startLoading('Getting Friends...');

    //Start polling to get messages
    let request = this.appUsers.getUserFriends();

    //Get a reference to this
    let self = this;

    //Get our current conversation
    request.subscribe(function(success) {
      //Success!
      //Stop loading
      self.appNotify.stopLoading().then(function() {

        //Save our friends
        self.friends = success;

        if(self.navParams.get('user')) {
          //TODO: set a friend as check if we were passed a user
        }

        //Update the UI
        self.changeDetector.detectChanges();
      });
    }, function(error) {
      //Error!
      //Stop Loading
      self.appNotify.stopLoading().then(function() {
        self.appNotify.handleError(error, [
          {
            status: '404',
            callback: function() {
              //Do nothing, because they simply don't have friends yet
            }
          }
        ]);
      });

    }, function() {
      //Completed
    })
  }

  createConversation(keyCode) {
    //Check if there is a key press, and if there is, if it is enter
    if (keyCode && keyCode != 13) return true;

    //Check if the reply text is empty
    if (this.replyMessage.length < 1) return false;
  }

}

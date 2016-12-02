import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

//Pages
import { AllConversationsPage } from '../../pages/all-conversations/all-conversations';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppCrypto } from '../../providers/app-crypto/app-crypto';
import { NgForTextFilter } from '../../providers/app-pipes/app-pipes';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppMessaging } from '../../providers/app-messaging/app-messaging';
import { AppUsers} from '../../providers/app-users/app-users';

@Component({
  templateUrl: 'build/pages/new-conversation/new-conversation.html',
  pipes: [NgForTextFilter]
})
export class NewConversationPage {

  //Our convoMessage ng-model data
  convoMessage: string;

  //Our user's friends
  friends: any;

  //Facebook Ids of Friends that will be added in the new conversation
  convoFriends: any;

  constructor(private changeDetector: ChangeDetectorRef, private navCtrl: NavController, private navParams: NavParams, private appNotify: AppNotify,
    private appCrypto: AppCrypto, private appMessaging: AppMessaging, private appUsers: AppUsers) {

    //Initialize friends
    this.friends = [];

    //INitialize friends in the conversation
    this.convoFriends = [];

    //Intialize conversation friends
    this.convoMessage = '';
  }

  //Call function every time the view loads
  ionViewWillEnter() {

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

          //Timeout the checking of the friend to get working with UI
          let passedUser = self.navParams.get('user');
          for(let i = 0; i < self.friends.length; i++) {
            if(self.friends[i].facebook.id === passedUser.facebook.id) {
              //Add the id to our convoFriends
              self.convoFriends.push(self.friends[i]._id);
              i = self.friends.length;
            }
          }
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

  //Function to add a friend to the convofriends array
  editConvoFriends(friend) {
    //Get the index of the friend we are searching for
    let index = this.convoFriends.indexOf(friend._id);

    //Remove the friend if they already exist, add them if they dont
    if(index < 0) this.convoFriends.push(friend._id);
    else this.convoFriends.splice(index, 1);
  }

  createConversation(keyCode) {
    //Check if there is a key press, and if there is, if it is enter
    //Return true instead of false to allow the keypress
    if (keyCode && keyCode != 13) return true;

    //Check if the convo text is empty
    if (this.convoMessage.length < 1) return false;

    //Check that we included some friends
    if (this.convoFriends.length < 1) return false;

    //Get a reference to this
    let self = this;

    //Start Loading
    this.appNotify.startLoading('Sending Message...');

    //Encrypt the messages

    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

    //Create our payload
    var payload = {
      access_token: user.access_token,
      members: this.convoFriends,
      message: this.convoMessage,
    }

    this.appMessaging.conversationCreate(payload).subscribe(function(success) {
      //Success

      //Stop Loading, and go to the all conversations view
      self.appNotify.stopLoading().then(function() {
        self.navCtrl.setRoot(AllConversationsPage);
      });
    }, function(error) {
      //Error
      self.appNotify.stopLoading().then(function() {
        //Pass to Error Handler
        self.appNotify.handleError(error, [{
          status: 409,
          callback: function() {
            //Go back home
            self.navCtrl.setRoot(AllConversationsPage);

            //Timeout and show the toast
            setTimeout(function() {
              self.appNotify.showToast('Conversation already exists!');
            }, 10);
          }
        }]);
      });
    }, function() {
      //Complete
    });
  }

}

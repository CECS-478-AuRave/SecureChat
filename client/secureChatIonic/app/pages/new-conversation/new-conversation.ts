import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Observable } from "rxjs/Observable";

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
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

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

    //Get the facebook ids from the _ids out of the friends
    //Using .slice() to get a copy of this.friends
    let convoFbFriends = this.friends.slice(0);
    convoFbFriends.filter(function(friend) {
      return self.convoFriends.includes(friend._id);
    });

    //Validate all of the friends
    for(var i = 0; i < convoFbFriends.length; i++) {
      //If not valid, return
      if(!this.appCrypto.validateLocalPublicKey(convoFbFriends[i], convoFbFriends[i].publicKey)) {
        i = convoFbFriends.length;
        return false;
      }
    }

    //Add ourselves to the convofb friends to be encrypted for
    let localUser = JSON.parse(localStorage.getItem(AppSettings.shushItemName));
    convoFbFriends.push(localUser);

    //Start Loading
    this.appNotify.startLoading('Encrypting and Sending Message...');

    //Encrypt the messages
    //Create an observable to wrap around encrypting each message
    let encryptObserve = new Observable(function(encryptReturn) {
      //Our final messages array
      //Key is the user id
      //Values are the message, and the message key
      let encryptedMessages = {};

      //Our keyStores
      let localKeyStore = JSON.parse(localStorage.getItem(AppSettings.shushLocalPublicKeyStore));
      let localPrivateKeyStore = JSON.parse(localStorage.getItem(AppSettings.shushLocalPrivateKeyStore));

      //Loop through all of the ids in our members
      for(let i = 0; i < convoFbFriends.length; i++) {

        //Get the key
        let encryptionKey = '';
        if(convoFbFriends[i].facebook.id != localUser.facebook.id) encryptionKey = localKeyStore[convoFbFriends[i].facebook.id].keys.pgp;
        else encryptionKey = localPrivateKeyStore[convoFbFriends[i].facebook.id].publicKey;

        //Encrypt a copy of the message for each user in group
        self.appCrypto.encryptMessage(self.convoMessage,
          encryptionKey,
          convoFbFriends[i]._id)
          .subscribe(function(response: any) {

          //Get the facebook id from the response
          let responseId = response.userId;

          //Delete the facebook id from the response
          delete response.userId;

          //Push onto the encrypted messages
          encryptedMessages[responseId] = response;

          //Check if we have encrypted all messages
          if(Object.keys(encryptedMessages).length >= convoFbFriends.length) {
            //Return the encrypted messages to the observer
            encryptReturn.next(encryptedMessages);
          }
        });
      }
    });

    //Subscribe to the message encrypting
    encryptObserve.subscribe(function(encryptedResponse) {
      //Grab our user from localstorage
      let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

      //Create our payload
      var payload = {
        access_token: user.access_token,
        members: self.convoFriends,
        messages: encryptedResponse,
      }

      self.appMessaging.conversationCreate(payload).subscribe(function(success) {
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
    });
  }

}

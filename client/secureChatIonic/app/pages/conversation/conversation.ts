import { Component, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Content, NavController, NavParams } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppCrypto } from '../../providers/app-crypto/app-crypto';
import { AppMessaging } from '../../providers/app-messaging/app-messaging';

/*
  Generated class for the ConversationPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/conversation/conversation.html'
})
export class ConversationPage {
  //Get reference to our ion-content
  @ViewChild(Content) content: Content;

  //Our Current Conversation
  convo: any;

  //The Id of our conversation
  convoId: any;

  //Our conversation title
  convoTitle: any;

  //Our reply ng-model data
  replyMessage: string;

  //Our scroll duration for auto-scrolling through the messages
  scrollDuration: number;

  //Our message Polling
  pollingRequest: any;

  constructor(private changeDetector: ChangeDetectorRef, private navCtrl: NavController, private navParams: NavParams, private appNotify: AppNotify, private appCrypto: AppCrypto, private appMessaging: AppMessaging) {

    //Initialize our reply message to an empty string
    this.replyMessage = '';

    //Initialize our scroll duration
    this.scrollDuration = 350;

    //Get the conversation passed from the last page
    this.convo = this.navParams.get('conversation');
    this.convoId = this.convo.conversationID;

    //Get the conversation title
    this.convoTitle = this.getConvoTitle(this.convo);

    //User messages can be tagged in HTML, by comparing user ids in the ngFor
  }

  //Function called once the view is full loaded
  ionViewDidEnter() {

    //Scroll to the bottom of the messages (Request below is for polling, not getting messages)
    this.content.scrollToBottom(this.scrollDuration);

    //Verify all public keys in the conversation on load
    //Since from the backend, we are populating the users field in the conversation,
    //we know we are getting most up to date, database public keys for users
    for(let i = 0; i < this.convo.members.length; i++) {
      //Validate each public key,
      //Will handle showing the alert on bad key
      this.appCrypto.validateLocalPublicKey(this.convo.members[i], this.convo.members[i].publicKey);
    }

    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

    //Start polling to get messages
    let poll = this.appMessaging.conversationRequestPoll(user.access_token);

    //Get a reference to this
    let self = this;

    this.pollingRequest = poll.subscribe(function(success) {
      //Success!

      //Stop loading
      self.appNotify.stopLoading().then(function() {

        //Add our messages/Get our conversation
        self.appMessaging.conversations = success;

        //Update our conversations
        self.updateConversation();
      });
    }, function(error) {
      //Error!

      //Stop Loading
      self.appNotify.stopLoading().then(function() {
        //Pass to Error Handler
        self.appNotify.handleError(error, [{
          status: 404,
          callback: function() {
            //Pop back to the All conversations view

            self.navCtrl.pop();
          }
        }]);
      });

    }, function() {
      //Completed
    })
  }

  //Function to update our conversation
  updateConversation() {

    //Find and update our current conversation
    for (let i = 0; i < this.appMessaging.conversations.length; ++i) {
      if (this.convoId == this.appMessaging.conversations[i]._id) {

        //Update the conversation
        this.convo = this.appMessaging.conversations[i];

        //Break from the loop
        i = this.appMessaging.conversations.length;
      }
    }

    //Update the UI
    this.changeDetector.detectChanges();

    //Scroll to the bottom of the messages
    this.content.scrollToBottom(this.scrollDuration);
  }

  //Function to get the title of the conversationId
  getConvoTitle(conversation) {

    //Return if no senders
    if (conversation.length < 1) return 'Conversation';

    //Initialize our variables
    var convoTitle = '';

    //Get the names of the members spilt by spaces
    for (let i = 0; i < conversation.members.length; ++i) {
      convoTitle += conversation.members[i].name;
      if (i < conversation.members.length - 1) convoTitle += ', ';
    }

    //Shorten the conversation title to 30 characters
    if (convoTitle.length > 29) convoTitle = convoTitle.substring(0, 27) + '...';

    //Return the conversation title
    return convoTitle;
  }

  //Function to send a message (Done from click)
  sendReply(keyCode) {

    //Check if there is a key press, and if there is, if it is enter
    if (keyCode && keyCode != 13) return true;

    //Check if the reply text is empty
    if (this.replyMessage.length < 1) return false;

    //Start Loading
    this.appNotify.startLoading('Sending Message...');

    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

    //Create our payload
    var payload = {
      access_token: user.access_token,
      message: this.replyMessage,
      conversationID: this.convoId
    }

    //Get a reference to this
    let self = this;

    //Make our request
    this.appMessaging.conversationReply(payload).subscribe(function(success) {
      //Success

      //Stop Loading
      self.appNotify.stopLoading().then(function() {

        //Set our convo to the the success result
        self.convo = success;

        //Empty the reply message
        self.replyMessage = '';

        //Update the UI
        self.changeDetector.detectChanges();

        //Scroll to the bottom of the messages
        self.content.scrollToBottom(self.scrollDuration);

        //Toast the user
        self.appNotify.showToast('Message Sent!');
      });

    }, function(error) {
      //Error
      //Stop Loading
      self.appNotify.stopLoading().then(function() {
        //Pass to Error Handler
        self.appNotify.handleError(error, [{
          status: 404,
          callback: function() {
            //Pop back to the All conversations view

            self.navCtrl.pop();
          }
        }]);
      });
    }, function() {
      //Completed
    });
  }

  //Run on page leave
  ionViewWillLeave() {
    //Stop
    this.pollingRequest.unsubscribe();
  }
}

import { Component, ChangeDetectorRef } from '@angular/core';
import { NavController } from 'ionic-angular';

//Import to conversation view
import { ConversationPage } from '../../pages/conversation/conversation';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppMessaging } from '../../providers/app-messaging/app-messaging';

@Component({
  templateUrl: 'build/pages/all-conversations/all-conversations.html'
})
export class AllConversationsPage {

  //Our recent conversations
  convoList: any;

  //Our message Polling
  pollingRequest: any;

  constructor(private changeDetector: ChangeDetectorRef, private navCtrl: NavController, private appNotify: AppNotify, private appMessaging: AppMessaging) {

    //polling done and requests done on very request
  }

  //Function called once the view is full loaded
  ionViewDidEnter() {

    //Start Loading
    this.appNotify.startLoading('Getting Messages...');

    //Get the messages on view load, and start a polling request

    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName))

    //Start polling to get messages
    let request = this.appMessaging.conversationRequest(user.access_token);

    //Get a reference to this
    let self = this;

    //Get our current conversation
    request.subscribe(function(success) {
      //Success!
      //Stop loading
      self.appNotify.stopLoading().then(function() {
        self.messageGetSuccess(success);
      });
    }, function(error) {
      //Error!
      //Stop Loading
      self.appNotify.stopLoading().then(function() {
        self.messageGetError(error);
      });

    }, function() {
      //Completed
    })

    //Start polling to get messages
    let poll = this.appMessaging.conversationRequestPoll(user.access_token);

    this.pollingRequest = poll.subscribe(function(success) {
      //Success!
      self.messageGetSuccess(success);
    }, function(error) {
      //Error!
      self.messageGetError(error);
    }, function() {
      //Completed
    });
  }

  //Functions to handle observable responses
  messageGetSuccess(success) {
    //Add our messages
    this.appMessaging.conversations = success
    this.convoList = this.appMessaging.conversations;

    //Update the UI
    this.changeDetector.detectChanges();
  }

  messageGetError(error) {

    //reference to this
    let self = this;

    //Pass to Error Handler
    this.appNotify.handleError(error, [{
      status: 404,
      callback: function() {
        //Simply set all conversations to an empty array
        self.convoList = [];

        //Update the UI
        self.changeDetector.detectChanges();
      }
    }]);
  }

  //Function to return if we have conversations
  hasConversations() {
    if (this.convoList && this.convoList.length == 0) return true;
    else return true;
  }

  //Function to reutn the users in a conversations
  getConvoMembers(convo: any) {

    //Get the last message sender

    //Get the names of the members spilt by spaces
    let members = '';
    for (let i = 0; i < convo.memberNames.length; ++i) {
      members += convo.memberNames[i].split(' ')[0];
      if (i < convo.memberNames.length - 1) members += ', ';
    }

    return this.shortenText(members, 20);

  }

  getConvoLatestText(convo: any) {

    //Get the last message sender
    let lastMessage = convo.message[convo.message.length - 1];

    let lastSender = lastMessage.from.split(' ')[0];
    let lastText = lastMessage.message;

    return this.shortenText(lastSender + ': ' + lastText, 35)
  }

  //Function to return
  //Get shortened text with elipses
  shortenText(text: string, textMax) {

    //First check if the text is already short
    if (text.length < textMax) return text;
    else {
      //Get a substring of text
      text = text.substring(0, (textMax - 3));
      text = text + '...';
      return text;
    }
  }

  //Fucntion to run when an item is clicked
  convoClick(convo) {
    //Go to the conversation page, and pass the conversation id
    this.navCtrl.push(ConversationPage, {
      conversation: convo
    });
  }

  //Run on page leave
  ionViewWillLeave() {
    //Stop
    this.pollingRequest.unsubscribe();
  }

}

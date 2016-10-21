import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

//Import to conversation view
import { ConversationPage } from '../../pages/conversation/conversation';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppMessaging } from '../../providers/app-messaging/app-messaging';

@Component({
  templateUrl: 'build/pages/all-conversations/all-conversations.html',
})
export class AllConversationsPage {

  //Our recent conversations
  allConversations: any;

  //If we have the conversations
  hasConversations: boolean;

  constructor(private navCtrl: NavController, private appNotify: AppNotify, private appMessaging: AppMessaging) {

    //Start Loading
    this.appNotify.startLoading('Getting Messages...');

    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName))

    //Make a request to get the messages
    let request = this.appMessaging.conversationRequest(user.access_token);

    //Get a reference to this
    let self = this;

    request.subscribe(function(success) {
      //Success!

      //Stop loading
      self.appNotify.stopLoading().then(function() {
        self.allConversations = success;
        //console.log(self.allConversations);
      });
    }, function(error) {
      //Error!

      //Stop Loading
      self.appNotify.stopLoading().then(function() {
        //Pass to Error Handler
        self.appNotify.handleError(error);
      });

    }, function() {
      //Completed
    })


  }

  //Get shortened text with elipses
  shortenText(text: string) {
    let textMax = 35;
    //First check if the text is already short
    if (text.length < textMax) return text;
    else {
      //Get a substring of text
      text = text.substring(0, (textMax - 1));
      text = text + '...';
      return text;
    }
  }

  //Fucntion to run when an item is clicked
  convoClick(id) {
    //Go to the conversation page, and pass the conversation id
    this.navCtrl.push(ConversationPage, {
      conversationId: id
    });
  }

}

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

//Import to conversation view
import { ConversationPage } from '../../pages/conversation/conversation';

//Import our providers
import { AppMessaging } from '../../providers/app-messaging/app-messaging'
import { AppAuth } from '../../providers/app-auth/app-auth';

/*
  Generated class for the AllMessagesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/all-messages/all-messages.html',
})
export class AllMessagesPage {

  //Our NavController
  location: NavController;

  //Our recent conversations
  recentMessages: any;

  constructor(private navCtrl: NavController, private appMessaging: AppMessaging, private appAuth: AppAuth) {

    //Set our nav controller
    this.location = navCtrl;

    //Make a request to get the messages
    this.recentMessages = this.appMessaging.getConversations(this.appAuth.user.access_token);
  }

  //Get shortened text with elipses
  shortenText(text: string) {
    //First check if the text is already short
    if (text.length < 21) return text;
    else {
      //Get a substring of text
      text = text.substring(0, 20);
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

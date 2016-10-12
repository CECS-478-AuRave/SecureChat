import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

//Import to conversation view
import { ConversationPage } from '../../pages/conversation/conversation';

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
  recentMessages: Array<any>;

  constructor(private navCtrl: NavController) {

    //Set our nav controller
    this.location = navCtrl;

    //Recent messages from all conversations (template for now)
    this.recentMessages = [
      {
        user: "Kumin In",
        text: "Sup dude!",
        conversationId: "1457"
      },
      {
        user: "Bob Smith",
        text: "What's the homework?",
        conversationId: "1243"
      }
    ];
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

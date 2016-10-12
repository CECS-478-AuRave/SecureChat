import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

/*
  Generated class for the ConversationPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/conversation/conversation.html',
})
export class ConversationPage {

  //The id of the conversation
  convoId: string;

  //The title of the conversation
  convoTitle: string;

  //Our array of messages of the conversation
  conversation: Array<any>;

  constructor(private navCtrl: NavController, private navParams: NavParams) {

    //Get the conversation ID passed from the last page
    this.convoId = this.navParams.get('conversationId');

    //Get our conversation (Template for now)
    this.conversation = [
      {
        sender: "kumin",
        message: "hey there!"
      },
      {
        sender: "kumin",
        message: "dude?"
      },
      {
        sender: "aaron",
        message: "sup dude! Cool to work with you!"
      }
    ];

    //Get the conversation title, function being called, but not returning?
    this.convoTitle = this.getConvoTitle();
  }

  getConvoTitle() {

    //Return if no senders
    if (this.conversation.length < 1) return 'Conversation';

    //Initialize our variables
    var convoTitle = '';
    var convoMembers = [];

    //Find all unique senders in the conversation
    for (let i = 0; i < this.conversation.length; i++) {
      if (convoMembers.indexOf(this.conversation[i].sender) > 0) {
        convoMembers.push(this.conversation[i].sender);
      }
    }

    //Add all the senders to the conversation title
    for (let i = 0; i < convoMembers.length; i++) {
      convoTitle = convoTitle + convoMembers[i];
    }

    //Shorten the conversation title to 30 characters
    if (convoTitle.length > 29) convoTitle = convoTitle.substring(0, 27) + '...';

    //Return the conversation title
    return convoTitle;
  }

}

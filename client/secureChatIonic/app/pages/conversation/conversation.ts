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
  }

}

import { Component, ViewChild } from '@angular/core';
import { Content, NavController, NavParams } from 'ionic-angular';

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

  //The id of the conversation
  convoId: string;

  //The title of the conversation
  convoTitle: string;

  //Our array of messages of the conversation
  conversation: Array<any>;

  //Our reply ng-model data
  replyMessage: string;

  //Our scroll duration for auto-scrolling through the messages
  scrollDuration: number;

  constructor(private navCtrl: NavController, private navParams: NavParams) {

    //Get the conversation ID passed from the last page
    this.convoId = this.navParams.get('conversationId');

    //Get our conversation (Template for now)
    this.conversation = [
      {
        senderId: "1034",
        sender: "kumin",
        message: "hey there!"
      },
      {
        senderId: "1034",
        sender: "kumin",
        message: "dude?"
      },
      {
        senderId: "2424",
        sender: "aaron",
        message: "sup dude! Cool to work with you!"
      },
      {
        senderId: "2424",
        sender: "aaron",
        message: "sup dude! Cool to work with you!"
      },
      {
        senderId: "2424",
        sender: "aaron",
        message: "sup dude! Cool to work with you!"
      },
      {
        senderId: "2424",
        sender: "aaron",
        message: "sup dude! Cool to work with you!"
      },
      {
        senderId: "2424",
        sender: "aaron",
        message: "sup dude! Cool to work with you!"
      },
      {
        senderId: "2424",
        sender: "aaron",
        message: "sup dude! Cool to work with you!"
      }
    ];

    //Get the conversation title, function being called, but not returning?
    this.convoTitle = this.getConvoTitle(this.conversation);

    //Tag which messages were sent by the user
    this.conversation = this.findUserMessages(this.conversation);

    //Initialize our reply message to an empty string
    this.replyMessage = '';

    //Initialize our scroll duration
    this.scrollDuration = 350;
  }

  //Function called once the view is full loaded
  ionViewDidEnter() {
    //Scroll to the bottom of the messages
    this.content.scrollToBottom(this.scrollDuration);
  }

  //Function to get the title of the conversationId
  getConvoTitle(messages: Array<any>) {

    //Return if no senders
    if (messages.length < 1) return 'Conversation';

    //Initialize our variables
    var convoTitle = '';
    var convoMembers = [];

    //Find all unique senders in the conversation
    for (let i = 0; i < this.conversation.length; i++) {
      if (convoMembers.indexOf(this.conversation[i].sender) < 0) {
        convoMembers.push(this.conversation[i].sender);
      }
    }

    //Add all the senders to the conversation title
    for (let i = 0; i < convoMembers.length; i++) {
      //Also, add the needed commas
      if (i >= convoMembers.length - 1) convoTitle = convoTitle + convoMembers[i];
      else convoTitle = convoTitle + convoMembers[i] + ", ";
    }

    //Shorten the conversation title to 30 characters
    if (convoTitle.length > 29) convoTitle = convoTitle.substring(0, 27) + '...';

    //Return the conversation title
    return convoTitle;
  }

  //Function to tag the messages that were sent by this user
  findUserMessages(messages: Array<any>) {

    //Get out user settings from localStorage
    var userToken = JSON.parse(localStorage.getItem("shushUser"));

    //Simply iterate through the array
    for (let i = 0; i < messages.length; ++i) {
      if (messages[i].senderId = userToken.id) messages[i].isUser = true;
    }

    return messages;
  }

  //Function to send a message (Done from click)
  sendReply(keyCode) {

    //Check if there is a key press, and if there is, if it is enter
    if (keyCode && keyCode != 13) return true;

    //Check if the reply text is empty
    if (this.replyMessage.length < 1) return false;

    //TODO: Connect message sending to the backend
    this.conversation.push({
      senderId: "2424",
      sender: "aaron",
      message: this.replyMessage
    });

    //Empty the reply message
    this.replyMessage = '';

    //Scroll to the bottom of the messages
    setTimeout(() => {
      this.content.scrollToBottom(this.scrollDuration);//300ms animation speed
    });

  }

}

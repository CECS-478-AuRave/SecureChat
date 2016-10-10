import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

/*
  Generated class for the AllMessagesPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/all-messages/all-messages.html',
})
export class AllMessagesPage {

  //Our recent conversations
  recentMessages: Array<any>;

  constructor(private navCtrl: NavController) {
    this.recentMessages = [
      {
        user: "Kumin In",
        text: "Sup dude!"
      },
      {
        user: "Bob Smith",
        text: "What's the homework?"
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
  convoClick() {
    console.log("clicked!");
  }

}

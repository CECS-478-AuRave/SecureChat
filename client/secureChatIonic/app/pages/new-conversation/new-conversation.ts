import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppMessaging } from '../../providers/app-messaging/app-messaging';

@Component({
  templateUrl: 'build/pages/new-conversation/new-conversation.html',
})
export class NewConversationPage {

  //Our reply ng-model data
  replyMessage: string;

  constructor(private navCtrl: NavController, private navParams: NavParams, private appNotify: AppNotify, private appMessaging: AppMessaging) {

  }

  createConversation(keyCode) {
    //Check if there is a key press, and if there is, if it is enter
    if (keyCode && keyCode != 13) return true;

    //Check if the reply text is empty
    if (this.replyMessage.length < 1) return false;
  }

}

import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppMessaging } from '../../providers/app-messaging/app-messaging';

@Component({
  templateUrl: 'build/pages/new-conversation/new-conversation.html',
})
export class NewConversationPage {

  constructor(private navCtrl: NavController) {

  }

}

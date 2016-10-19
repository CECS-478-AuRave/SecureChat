import { Injectable } from '@angular/core';
import { ToastController } from 'ionic-angular';

/*
  Generated class for the AppNotification provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

//Handle All Notifications to be shown to the user
@Injectable()
export class AppNotification {

  constructor(private toastCtrl: ToastController) { }

  //Show a Static toast
  showToast(toastContent) {
    const toast = this.toastCtrl.create({
      message: toastContent,
      showCloseButton: true,
      position: 'bottom',
      duration: 2000,
      closeButtonText: 'Ok'
    });
    toast.present();
  }

}

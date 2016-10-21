import { Injectable } from '@angular/core';
import { App, LoadingController, ToastController  } from 'ionic-angular';

//Our Providers
import { AppSettings } from '../../providers/app-settings/app-settings';

//Handle Async requests, loading spinners, Toasts, and general errors
@Injectable()
export class AppNotify {

  //Our Loader
  loader: any;

  //Our default loading string
  defaultMessage: 'Loading, please wait...';

  constructor(private app: App, private loadingCtrl: LoadingController, private toastCtrl: ToastController) {
  }

  //Show a Static toast
  showToast(toastContent) {
    //Ensure we aren't toasting nothing
    if (!toastContent) return;

    let toast = this.toastCtrl.create({
      message: toastContent,
      showCloseButton: true,
      position: 'bottom',
      duration: 2000,
      closeButtonText: 'Ok'
    });
    toast.present();
  }

  //Function to start loading
  startLoading(loadingString) {
    //First make sure we stop loading
    if (!loadingString) loadingString = this.defaultMessage;
    this.loader = this.loadingCtrl.create({
      content: loadingString
    });
    return this.loader.present();
  }

  //Function to stop Loading
  stopLoading() {
    return this.loader.dismiss();
  }

  //Function to handle Errors
  handleError(error) {

    //TODO: Allow for overiding error codes, and using custom callbacks

    //Log the error
    console.log(error);

    //Get our status
    let status = error.status;

    if (status == 400) {
      //400 Bad Request
      this.showToast('Bad Request. Please ensure your input is correct.');
    } else if (status == 401) {
      //401 Unauthorized

      //Set the access token to false
      let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));
      user.access_token = false;
      localStorage.setItem(AppSettings.shushItemName, JSON.stringify(user))

      //Force the user to the login page
      //Will Create circular dependency, need to create pages provider
      //   let nav = this.app.getRootNav();
      //   nav.setRoot(AuthLoginPage);

      //Toast the user
      this.showToast('Unauthorized. Please log back in.');
    } else if (status == 404) {

      //Toast the user
      this.showToast('Could not be found. Please ensure your input is complete and correct.');

    } else if (status == 500) {
      //Internal Server Error

      //Toast the user
      this.showToast('Internal Server Error. Please try making the request again, or at a later time.');
    } else {
      this.showToast('Error ' + status + ': Please Contact Developers for help.');
    }


  }

}

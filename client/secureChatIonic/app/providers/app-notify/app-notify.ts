import { Injectable, ViewChild, ChangeDetectorRef } from '@angular/core';
import { App, Nav, LoadingController, ToastController, AlertController } from 'ionic-angular';

//Our Providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppAuth } from '../../providers/app-auth/app-auth';

//Page to redirect to on 401
import { Home } from '../../pages/home/home';

//Handle Async requests, loading spinners, Toasts, and general errors
@Injectable()
export class AppNotify {

  //Our Nav
  @ViewChild(Nav) nav: Nav;

  //Our login pages
  loginPage: any;

  //Our Loader
  loader: any;

  //Our default loading string
  defaultMessage: 'Loading, please wait...';

  constructor(private changeDetector: ChangeDetectorRef, private app: App, private appAuth: AppAuth, private loadingCtrl: LoadingController, private toastCtrl: ToastController, private alertCtrl: AlertController) {
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
    //Return the promise of the toast present
    let toastPromise = toast.present();

    return toastPromise;
  }

  //Function to start loading
  startLoading(loadingString) {
    //First make sure we stop loading
    if (!loadingString) loadingString = this.defaultMessage;
    this.loader = this.loadingCtrl.create({
      content: loadingString
    });

    //Work around for freezing modals in ionic beta 11
    //https://github.com/driftyco/ionic/issues/6325
    //Get a reference to this
    let self = this;
    this.loader.onDidDismiss(() => {
      setTimeout(function() {
        //self.loader.dismiss();
        //self.loader.destroy();
      }, 0);
    });

    return this.loader.present();
  }

  //Function to stop Loading
  stopLoading() {
    //Dismiss the loader
    let promise = this.loader.dismiss();

    //Return loader promise
    return promise;
  }

  //Function to handle Errors
  handleError(error, expected?) {

    //TODO: Allow for overiding error codes, and using custom callbacks

    //Get our status
    let status = error.status;

    //Check if we have any callbacks for specific error codes
    if (expected) {
      for (let i = 0; i < expected.length; ++i) {
        if (expected[i].status == status) {

          //Launch the call abck and return
          expected[i].callback();
          return;
        }

      }
    }

    //Log the error
    console.log(error);

    if (status == 400) {
      //400 Bad Request
      this.showToast('Bad Request. Please ensure your input is correct.');
    } else if (status == 401) {
      //401 Unauthorized

      //Logout
      this.appAuth.logout();

      //Redirect to home
      let nav = this.app.getActiveNav();
      nav.setRoot(Home);

      //Toast the user
      this.showToast('Unauthorized. Please log back in.');
    } else if (status == 404) {

      //Toast the user
      this.showToast('Could not be found. Please ensure your input is complete and correct.');

    } else if (status == 409) {

      //Toast the user
      this.showToast('There was a conflict with the server. Please make sure this does not already exist.');

    } else if (status == 500) {
      //Internal Server Error

      //Toast the user
      this.showToast('Internal Server Error. Please try making the request again, or at a later time.');
    } else {
      this.showToast('Error ' + status + ': Please Contact Developers for help.');
    }


  }

}

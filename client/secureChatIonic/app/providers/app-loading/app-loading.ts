import { Injectable } from '@angular/core';
import { LoadingController } from 'ionic-angular';


/*
  Generated class for the AppLoading provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

//Handle Async requests, loading spinners, and general errors
@Injectable()
export class AppLoading {

  //Our Loader
  loader: any;

  //Our default loading string
  defaultMessage: 'Loading, please wait...';

  constructor(private loadingCtrl: LoadingController) {
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

    //

  }

}

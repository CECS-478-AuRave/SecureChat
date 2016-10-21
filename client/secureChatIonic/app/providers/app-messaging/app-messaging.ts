import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppAuth } from '../../providers/app-auth/app-auth';
import { AppNotification } from '../../providers/app-notification/app-notification';
import { AppLoading } from '../../providers/app-loading/app-loading';

/*
  Generated class for the AppMessaging provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppMessaging {

  constructor(private http: Http, private appSettings: AppSettings, private appAuth: AppAuth, private appNotification: AppNotification, private appLoading: AppLoading) { }

  //Return all the conversations for a user
  public getConversations() {

    //Start Loading
    this.appLoading.startLoading('Getting Messages...');

    //Our access_token header
    let headers = {
      access_token: this.appAuth.user.access_token
    };

    //Send the request with the payload to the server
    var response = this.http.get(AppSettings.serverUrl + 'conversation', headers).map(res => res.json());

    //Get a reference to this
    let self = this;

    response.subscribe(function(success) {
      //Success!
      console.log(success);

      //Stop loading
      return self.appLoading.stopLoading().then(function() {
        return success;
      });
    }, function(error) {
      //Error!

      //Stop Loading
      self.appLoading.stopLoading().then(function() {
        //Pass to Error Handler
        self.appLoading.handleError(error);
      });

    }, function() {
      //Completed
    })


  }


}

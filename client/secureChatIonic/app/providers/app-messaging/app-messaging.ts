import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';

/*
  Generated class for the AppMessaging provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppMessaging {

  constructor(private http: Http, private appSettings: AppSettings, private appNotify: AppNotify) { }

  //Return all the conversations for a user
  public getConversations(token) {

    //Start Loading
    this.appNotify.startLoading('Getting Messages...');

    //Our access_token header
    let headers = {
      access_token: token
    };

    //Send the request with the payload to the server
    var response = this.http.get(AppSettings.serverUrl + 'conversation', headers).map(res => res.json());

    //Get a reference to this
    let self = this;

    response.subscribe(function(success) {
      //Success!
      console.log(success);

      //Stop loading
      return self.appNotify.stopLoading().then(function() {
        return success;
      });
    }, function(error) {
      //Error!

      //Stop Loading
      self.appNotify.stopLoading().then(function() {
        //Pass to Error Handler
        self.appNotify.handleError(error);
      });

    }, function() {
      //Completed
    })


  }


}

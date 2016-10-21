import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/observable/interval';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/map';


//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';

@Injectable()
export class AppMessaging {

  constructor(private http: Http, private appSettings: AppSettings) { }

  //Return all the conversations for a user
  conversationRequest(token) {

    //Our headers
    let headers = new Headers({
      access_token: token
    });
    let options = new RequestOptions({ headers: headers });

    //Continually poll the server in an interval to get messages
    //Poll Interval every 30 seconds
    let pollInterval = 5000;
    return Observable.interval(pollInterval)
      .switchMap(() => this.http.get(AppSettings.serverUrl + 'conversation', options))
      .map(res => res.json());
  }


}

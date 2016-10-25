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

  //Our conversations
  conversations: any;

  //Return all the conversations for a user, for server polling
  conversationRequest(token) {

    //Our headers
    let headers = new Headers({
      access_token: token
    });
    let options = new RequestOptions({ headers: headers });

    //Continually poll the server in an interval to get messages
    //Poll Interval from the App Settings
    return this.http.get(AppSettings.serverUrl + 'conversation', options).map(res => res.json());
  }

  //Return all the conversations for a user, for server polling
  conversationRequestPoll(token) {

    //Our headers
    let headers = new Headers({
      access_token: token
    });
    let options = new RequestOptions({ headers: headers });

    //Continually poll the server in an interval to get messages
    //Poll Interval from the App Settings
    return Observable.interval(AppSettings.pollInterval)
      .switchMap(() => this.http.get(AppSettings.serverUrl + 'conversation', options))
      .map(res => res.json());
  }

  //POST to the server a new message
  conversationReply(payload) {

    //Update the conversation on the server
    return this.http.put(AppSettings.serverUrl + 'conversation', payload).map(res => res.json());
  }


}

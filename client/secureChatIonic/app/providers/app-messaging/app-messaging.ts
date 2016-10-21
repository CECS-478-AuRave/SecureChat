import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
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

    //Send the request with the payload to the server
    return this.http.get(AppSettings.serverUrl + 'conversation', options).map(res => res.json());


  }


}

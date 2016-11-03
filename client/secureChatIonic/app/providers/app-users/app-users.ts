import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from "rxjs/Observable";

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';

/*
  Generated class for the AppUsers provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
//Class to manage our usrs, and their relationsships (Friends)
@Injectable()
export class AppUsers {

  constructor(private http: Http) { }

  //Gets the user by their facebook id
  getUserById(userId) {

    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

    //Our headers
    let headers = new Headers({
      access_token: user.access_token
    });
    let options = new RequestOptions({ headers: headers });

    //Return our request
    let url = AppSettings.serverUrl + "user/id/" + userId;
    return this.http.get(url, options).map(res => res.json());
  }

  //Search for a user with a query string
  //Searches by name and email
  searchUsers(queryString) {
    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

    //Our headers
    let headers = new Headers({
      access_token: user.access_token
    });
    let options = new RequestOptions({ headers: headers });

    //Return our request
    let url = AppSettings.serverUrl + "user?queryString=" + queryString;
    return this.http.get(url, options).map(res => res.json());
  }

}

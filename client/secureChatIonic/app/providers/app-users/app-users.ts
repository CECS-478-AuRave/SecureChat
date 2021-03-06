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
  getUserById(userId, token: any) {

    if(!token) {
      //Grab our user from localstorage
      let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));
      token = user.access_token;
    }

    //Our headers
    let headers = new Headers({
      access_token: token
    });
    let options = new RequestOptions({ headers: headers });

    //Return our request
    let url = AppSettings.serverUrl + "user/" + userId;
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

  //Get a user's array of friends
  getUserFriends() {
    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

    //Our headers
    let headers = new Headers({
      access_token: user.access_token
    });
    let options = new RequestOptions({ headers: headers });

    //Return our request
    let url = AppSettings.serverUrl + "user/friend/get";
    return this.http.get(url, options).map(res => res.json());
  }

  //Add yourself toa user's pendingFriends
  addFriend(userId) {

    //Call our friend edit
    return this.editFriend('user/friend/add', userId);
  }

  //AAccept a pending friend
  acceptFriend(userId) {

    //Call our friend edit
    return this.editFriend('user/friend/accept', userId);
  }


  //Decline a pending friend
  declineFriend(userId) {

    //Call our friend edit
    return this.editFriend('user/friend/decline', userId);
  }


  //Delete a current friend
  deleteFriend(userId) {

    //Call our friend edit
    return this.editFriend('user/friend/delete', userId);
  }

  //Generalized function for friend manipulation
  editFriend(urlPath, userId) {
    //Grab our user from localstorage
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

    //Our headers
    let headers = new Headers({
      access_token: user.access_token
    });
    let options = new RequestOptions({ headers: headers });

    //Our payload
    let payload = {
      otherUserID: userId
    }

    return this.http.put(AppSettings.serverUrl + urlPath, payload, options).map(res => res.json());
  }

  //Helper function to shorten text, often used with user names
  //Get shortened text with elipses
  static shortenText(text: string, textMax) {

    //First check if the text is already short
    if (text.length < textMax) return text;
    else {
      //Get a substring of text
      text = text.substring(0, (textMax - 3));
      text = text + '...';
      return text;
    }
  }

}

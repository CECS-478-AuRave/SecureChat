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

  //Create/POST a new conversation
  conversationCreate(payload) {

    //Payload should have the following params
    //token: The users Facebook token
    //members: array of users facebook ids(not including the current user)
    //message: the string to initialize the message with

    //Post the conversation on the server
    return this.http.post(AppSettings.serverUrl + 'conversation', payload).map(res => res.json());
  }

  //PUT a new message within a conversation
  conversationReply(payload) {

    //Update the conversation on the server
    return this.http.put(AppSettings.serverUrl + 'conversation', payload).map(res => res.json());
  }

  //Helper Function to filter out all messages in a convo for the current users, and parse their json
  filterConvoMessages(convo, oldConvo) {

    //Grab our user from localstorage
    let userId = JSON.parse(localStorage.getItem(AppSettings.shushItemName))._id;

    //If we have an old convo, filter the same has the new convo
    if(oldConvo) {
      for(let i = 0; i < oldConvo.messages.length; i++) {
        oldConvo.messages[i].message = oldConvo.messages[i].message.filter(function(message) {
          return userId == message.issuedTo._id;
        });
      }
    }

    //Loop through our messaegs
    for(let i = 0; i < convo.messages.length; i++) {
      convo.messages[i].message = convo.messages[i].message.filter(function(message) {
        return userId == message.issuedTo._id;
      });

      //Parse the message json, the message key is a pgp string
      if (typeof convo.messages[i].message[0].message === 'string' || convo.messages[i].message[0].message instanceof String) {

          //Don't do anything if we have already decrypted
          if(oldConvo && oldConvo.messages[i] && oldConvo.messages[i].message[0].decryptedMessage) {
            convo.messages[i] = oldConvo.messages[i];
          }
          else {
            convo.messages[i].message[0].message = JSON.parse(convo.messages[i].message[0].message);
          }
      }
    }

    //Return the filtered convo
    return convo;
  }
}

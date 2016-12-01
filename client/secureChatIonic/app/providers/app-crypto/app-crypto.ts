import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';

//CryptoJs installed via: https://forum.ionicframework.com/t/import-crypto-js-in-ionic2/54869/3
import * as CryptoJs from 'crypto-js';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';

//3P JS library
//https://www.thepolyglotdeveloper.com/2016/01/include-external-javascript-libraries-in-an-angular-2-typescript-project/
//Using kbpgp over open pgp for licensing reasons
declare var kbpgp: any;

@Injectable()
export class AppCrypto {

  constructor(private http: Http, private appNotify: AppNotify, private appSettings: AppSettings) {
    //Ensure that we has a public key store, create one if not
    if(!localStorage.getItem(AppSettings.shushLocalKeyStore)) {
      localStorage.setItem(AppSettings.shushLocalKeyStore, JSON.stringify({}));
    }
  }

  //Function to return keys for the user
  //Returns either a Json returning keys, false if now keys were found,
  getUserKeys() {
    //Attempt to get the keys from the local user
    let localUser;
    if(localStorage.getItem(AppSettings.shushItemName)) localUser = JSON.parse(localStorage.getItem(AppSettings.shushItemName));
    if(localUser && localUser.keys) return localUser.keys;
    else return false;
  }

  generateUserKeys(passedUser) {
    //Start the open pgp key genreturn
    //Intialize our library
    let openpgp = kbpgp["const"].openpgp;

    //Grab our options
    let options = {
      userid: passedUser.name + passedUser.facebook.id,
      primary: {
        nbits: 4096,
        flags: openpgp.certify_keys | openpgp.sign_data | openpgp.auth | openpgp.encrypt_comm | openpgp.encrypt_storage,
        expire_in: 0  // never expire
      },
      subkeys: [
        {
          nbits: 2048,
          flags: openpgp.sign_data,
          expire_in: 0
        }, {
          nbits: 2048,
          flags: openpgp.encrypt_comm | openpgp.encrypt_storage,
          expire_in: 0
        }
      ]
    };

    //Generate the keys

    //Return a new observable that can be subscribed to
    return new Observable(function(observer) {
      kbpgp.KeyManager.generate(options, function(err, keys) {
        if (!err) {
          // sign keys's subkeys
          keys.sign({}, function(err) {

            // export demo; dump the private with a passphrase
            //Export the private kye
            keys.export_pgp_private ({
              passphrase: passedUser.access_token
            }, function(err, pgp_private) {

              //Next, export the public key
              keys.export_pgp_public({}, function(err, pgp_public) {

                //Return to our observer
                observer.next({
                  publicKey: pgp_public,
                  privateKey: pgp_private
                });
              });
            });
          });
        }
      });
    });
  }

  //Set the public key for a user
  setPublicKey(payload) {
    //Payload should have the following params
    //token: The users Facebook token
    //public key: the public key of the user

    //Post the conversation on the server
    return this.http.put(AppSettings.serverUrl + 'user/publicKey', payload).map(res => res.json());
  }

  //Get the public key for a user
  getPublicKey(token, facebookId) {

    //Our headers
    let headers = new Headers({
      access_token: token
    });
    let options = new RequestOptions({ headers: headers });

    //Return the get request
    return this.http.get(AppSettings.serverUrl + 'user/publicKey/' + facebookId).map(res => res.json());
  }

  //Function to validate a users id and an input public key
  //True if the key did not exists, or the keys match
  //False otherwise
  validateLocalPublicKey(passedUser, publicKey) {

    //Ignore the request if it is the current user
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName)).user;

    if(passedUser.facebook.id == user.facebook.id) {
      return true;
    }

    //Get the local key store
    let localKeyStore = JSON.parse(localStorage.getItem(AppSettings.shushLocalKeyStore));

    //Check if the key exists in the map
    if(!localKeyStore[passedUser.facebook.id]) {
      //Doesn't exist, add it to key store
      this.updateLocalPublicKey(passedUser.facebook.id, publicKey);
      return true;
    } else if(localKeyStore[passedUser.facebook.id] == publicKey) {
        //Does exist, and is valid, return true
        console.log('Valid!');
        return true;
    }
    else {
      //Does exist, but has changed, alert the user!
      //Alert the user of possible malicious acitivity
      this.appNotify.showAlert(AppSettings.maliciousPublicKey.title,
        AppSettings.maliciousPublicKey.text).then(function() {
          //Update and don't show alert for this user again
          this.updateLocalPublicKey(passedUser.facebook.id, publicKey);
        });
      return false;
    }
  }

  //Function to update the local key store with the new key
  updateLocalPublicKey(facebookId, publicKey) {
    //Get the local key store
    let localKeyStore = JSON.parse(localStorage.getItem(AppSettings.shushLocalKeyStore));

    //Set the key and save
    localKeyStore[facebookId] = publicKey;
    localStorage.setItem(AppSettings.shushLocalKeyStore, JSON.stringify(localKeyStore));
  }
}

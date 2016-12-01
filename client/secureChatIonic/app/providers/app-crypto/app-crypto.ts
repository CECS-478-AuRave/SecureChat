import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';

//CryptoJs installed via: https://forum.ionicframework.com/t/import-crypto-js-in-ionic2/54869/3
import * as CryptoJs from 'crypto-js';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';

//3P JS library
//https://www.thepolyglotdeveloper.com/2016/01/include-external-javascript-libraries-in-an-angular-2-typescript-project/
//Using kbpgp over open pgp for licensing reasons
declare var kbpgp: any;

@Injectable()
export class AppCrypto {

  constructor(private http: Http, private appSettings: AppSettings) { }

  //Function to return keys for the user
  //Returns either a Json returning keys, false if now keys were found,
  getUserKeys() {
    //Generate Encryption keys for the user if none
    let localUser = JSON.parse(localStorage.getItem(AppSettings.shushItemName)).user;
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
}

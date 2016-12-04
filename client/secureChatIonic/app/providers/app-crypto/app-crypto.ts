import { Injectable } from '@angular/core';
import { ModalController } from 'ionic-angular';
import { Http, RequestOptions, Headers } from '@angular/http';
import { Observable } from "rxjs/Observable";
import 'rxjs/add/operator/map';

//CryptoJs installed via: https://forum.ionicframework.com/t/import-crypto-js-in-ionic2/54869/3
import * as CryptoJs from 'crypto-js';

//Import our providers
import { AppSettings } from '../../providers/app-settings/app-settings';

//Import Modals
import { MaliciousKey } from '../../pages/malicious-key/malicious-key';

//3P JS library
//https://www.thepolyglotdeveloper.com/2016/01/include-external-javascript-libraries-in-an-angular-2-typescript-project/
//Using kbpgp over open pgp for licensing reasons
declare var kbpgp: any;

@Injectable()
export class AppCrypto {

  constructor(private http: Http, private modalCtrl: ModalController, private appSettings: AppSettings) {
    //Ensure that we has a public/private key store, create one if not
    if(!localStorage.getItem(AppSettings.shushLocalPublicKeyStore)) {
      localStorage.setItem(AppSettings.shushLocalPublicKeyStore, JSON.stringify({}));
    }
    if(!localStorage.getItem(AppSettings.shushLocalPrivateKeyStore)) {
      localStorage.setItem(AppSettings.shushLocalPrivateKeyStore, JSON.stringify({}));
    }
  }

  //Function to return keys for the user
  //Returns either a Json returning keys, false if now keys were found,
  getUserKeys(facebookId) {
    //Attempt to get the keys from the local user
    let localUser;
    if(localStorage.getItem(AppSettings.shushLocalPrivateKeyStore))
      localUser = JSON.parse(localStorage.getItem(AppSettings.shushLocalPrivateKeyStore));
    if(localUser && localUser[facebookId]) return localUser[facebookId];
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
        nbits: 2048,
        flags: openpgp.certify_keys | openpgp.sign_data | openpgp.auth | openpgp.encrypt_comm | openpgp.encrypt_storage,
        expire_in: 0  // never expire
      },
      subkeys: []
    };

    //Get a reference to this
    let self = this;

    //Generate the keys
    //Return a new observable that can be subscribed to
    return new Observable(function(observer) {
      kbpgp.KeyManager.generate(options, function(err, keys) {
        if (!err) {
          // sign keys's subkeys
          keys.sign({}, function(err) {

            //Export the private key
            keys.export_pgp_private ({}, function(err, pgp_private) {

              //Next, export the public key
              keys.export_pgp_public({}, function(err, pgp_public) {

                //Save to our local private key store
                self.updateLocalPrivateKeyStore(passedUser.facebook.id, pgp_public, pgp_private);

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
  validateLocalPublicKey(passedUser, publicKeys) {

    //Ignore the request if it is the current user
    let user = JSON.parse(localStorage.getItem(AppSettings.shushItemName));

    if(passedUser.facebook.id == user.facebook.id) {
      return true;
    }

    //Get the local key store
    let localKeyStore = JSON.parse(localStorage.getItem(AppSettings.shushLocalPublicKeyStore));

    //Check if the key exists in the map
    if(!localKeyStore[passedUser.facebook.id]) {
      //Doesn't exist, add it to key store
      this.updateLocalPublicKeyStore(passedUser.facebook.id, publicKeys);
      return true;
    } else if(localKeyStore[passedUser.facebook.id].keys.pgp == publicKeys.keys.pgp) {
        //Does exist, and is valid, return true
        return true;
    }
    else {
      //Does exist, but has changed, alert the user!
      //Alert the user of possible malicious acitivity
      this.modalCtrl.create(MaliciousKey).present();
      //Update and don't show alert for this user again
      this.updateLocalPublicKeyStore(passedUser.facebook.id, publicKeys);
      return false;
    }
  }

  //Function to update the local key store with the new key
  updateLocalPublicKeyStore(facebookId, publicKeys) {
    //Get the local key store
    let localKeyStore = JSON.parse(localStorage.getItem(AppSettings.shushLocalPublicKeyStore));

    //Set the key and save
    localKeyStore[facebookId] = publicKeys;
    localStorage.setItem(AppSettings.shushLocalPublicKeyStore, JSON.stringify(localKeyStore));
  }

  //Function to update the private key store with new key
  updateLocalPrivateKeyStore(facebookId, publicKey, privateKey) {
    //Get the local key store
    let localKeyStore = JSON.parse(localStorage.getItem(AppSettings.shushLocalPrivateKeyStore));

    //Reset the keys and save
    localKeyStore[facebookId] = {};
    localKeyStore[facebookId].publicKey = publicKey;
    localKeyStore[facebookId].privateKey = privateKey;
    localStorage.setItem(AppSettings.shushLocalPrivateKeyStore, JSON.stringify(localKeyStore));
  }

  //Function to encrypt plaintext, to ciphertext
  //Also, identifier that can be passed back to callbacks and things
  encryptMessage(plainText, publicKey, identifier) {

    //Get a reference to this
    let self = this;

    //Create our observable
    return new Observable(function(observer) {

      //Generate two keys, one for AES, one for HMAC
      let aesKey = self.getCryptoString();
      let hmacKey = self.getCryptoString();

      //Encrypt the message with AES
      let cipherText = CryptoJs.AES.encrypt(plainText, aesKey).toString();

      //Computer the HMAC of the ciphertext
      let cipherTextHmac = CryptoJs.HmacSHA256(cipherText, hmacKey).toString();

      //Stringify our keys
      let jsonKeys = JSON.stringify({
        aesKey: aesKey,
        hmacKey: hmacKey
      });

      //Stringify our final message
      let jsonMessage = JSON.stringify({
        messageText: cipherText,
        messageHmac: cipherTextHmac
      });

      //Encrypt our AES and HMAC keys
      kbpgp.KeyManager.import_from_armored_pgp({
        armored: publicKey
      }, function(err, keyManager) {
        if (!err) {

          //Encrypt the AES key
          var params = {
            msg: jsonKeys,
            encrypt_for: keyManager
          };
          kbpgp.box(params, function(err, encryptedKeys, encryptedKeysBuffer) {
            if(!err) {
              //Return the result
              observer.next({
                identifier,
                message: jsonMessage,
                messageKey: encryptedKeys
              });
            } else {
              console.log('Encryption error!');
              console.log(err);
            }
          });
        } else {
          console.log('Encrypt Key Import error!');
          console.log(err);
        }
      });
    });
  }

  //Function to decrypt a message
  //Also, identifier that can be passed back to callbacks and things
  decryptMessage(messageText, messageHmac, encryptedKeys, identifier) {

    //Create the observable
    return new Observable(function(observer) {

      //First decrypt the messageKey
      //Grab the user's public/private key from the device
      let facebookId = JSON.parse(localStorage.getItem(AppSettings.shushItemName)).facebook.id;
      let localKeyStore = JSON.parse(localStorage.getItem(AppSettings.shushLocalPrivateKeyStore));
      if(!localKeyStore[facebookId]) return;
      let privateKey = localKeyStore[facebookId].privateKey;

      //Create our key manager from the private key
      kbpgp.KeyManager.import_from_armored_pgp({
        armored: privateKey
      }, function(err, keyManager) {
        if (!err) {
          kbpgp.unbox({
            keyfetch: keyManager,
            armored: encryptedKeys
          }, function(err, messageKeyJson) {
            if(!err) {
              //Now we have the keys!

              //Parse the keys Json
              let decryptedKeys = JSON.parse(messageKeyJson);

              //First, compute the hmac of the cipher text of the message we received
              let computedHmac = CryptoJs.HmacSHA256(messageText, decryptedKeys.hmacKey).toString();

              //Check if the HMAC is true
              if(computedHmac == messageHmac) {
                //Our message was not tampered!!!

                //Decrypt with the AES Key
                //Must pass the encoding on decrypt
                //http://ramkulkarni.com/blog/encrypting-data-with-crypto-js-in-javascript/
                let decryptedMessage =
                  CryptoJs.AES.decrypt(messageText, decryptedKeys.aesKey).toString(CryptoJs.enc.Utf8);

                //Return the decrypted message
                observer.next({
                  identifier,
                  decryptedMessage
                })
              }
            } else {
              console.log('there was an error!');
              console.log(err);
            }
          });
        }
      });
    });
  }

  //Private function to get a 256 bit long string/key
  private getCryptoString() {
    //loop to get a long string
    let cryptoString = '';
    for(let i = 0; i < 5; i++) {
      cryptoString += Math.random().toString(36).substr(2, 24);
    }

    return CryptoJs.SHA256(cryptoString).toString();
  }
}

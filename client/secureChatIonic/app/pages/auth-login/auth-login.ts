import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

//CryptoJs installed via: https://forum.ionicframework.com/t/import-crypto-js-in-ionic2/54869/3
import * as CryptoJs from 'crypto-js';

//Pages
import { AllConversationsPage } from '../../pages/all-conversations/all-conversations';

//Import our providers (services)
import { AppSettings } from '../../providers/app-settings/app-settings';
import { AppNotify } from '../../providers/app-notify/app-notify';
import { AppAuth } from '../../providers/app-auth/app-auth';

//3P JS library
//https://www.thepolyglotdeveloper.com/2016/01/include-external-javascript-libraries-in-an-angular-2-typescript-project/
//Using kbpgp over open pgp for licensing reasons
declare var kbpgp: any;

/*
  Generated class for the AuthLoginPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/auth-login/auth-login.html',
})

export class AuthLoginPage {

  constructor(private navCtrl: NavController, private appNotify: AppNotify, private appAuth: AppAuth) { }

  //Call our log in function from our auth service
  login() {

    //Start Loading
    this.appNotify.startLoading('Logging in...');

    //Save a reference to this
    let self = this;

    let response = this.appAuth.login();

    //Respond to the callback
    response.subscribe(function(fbRes: any) {
      //Success!

      //Now subscribe to our server login response
      fbRes.request.subscribe(function(success: any) {
        //Success

        //Create our new user
        let userJson: any;
        //Schema for userjson
        userJson = {
          user: {},
          access_token: '',
          keys: {}
        };
        //Get the neccesary info from the user object
        userJson.user = success.user;
        userJson.access_token = fbRes.access_token;

        //Generate Encryption keys for the user if none
        let localUser = JSON.parse(localStorage.getItem(AppSettings.shushItemName));
        if(localUser && localUser.keys) userJson.keys = localUser.keys;
        else {

          //Start the open pgp key gen
          //Intialize our library
          let openpgp = kbpgp["const"].openpgp;

          //Grab our options
          let options = {
            userid: userJson.user.name + userJson.user.facebook.id,
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

          kbpgp.KeyManager.generate(options, function(err, keys) {
            if (!err) {
              // sign keys's subkeys
              keys.sign({}, function(err) {
                console.log(keys);
                // export demo; dump the private with a passphrase
                keys.export_pgp_private ({
                  passphrase: fbRes.access_token
                }, function(err, pgp_private) {
                  console.log("private key: ", pgp_private);
                });
                keys.export_pgp_public({}, function(err, pgp_public) {
                  console.log("public key: ", pgp_public);
                });
              });
            }
          });
        }

        //Save the user info
        localStorage.setItem(AppSettings.shushItemName, JSON.stringify(userJson));

        //Update the auth status
        self.appAuth.updateAuthStatus(true);

        //Stop Loading
        self.appNotify.stopLoading().then(function() {
          //Toast What Happened
          //In a timeout to avoid colliding with loading
          setTimeout(function() {
            //Show Toast
            self.appNotify.showToast('Login Successful!');

            //Redirect to messages page
            self.navCtrl.setRoot(AllConversationsPage);
          }, 250)
        });
      }, function(error) {
        //Error
        //Stop Loading
        self.appNotify.stopLoading().then(function() {

          //There was an error connecting to facebook
          self.appNotify.handleError(error);
        });
      }, function() {
        //Complete
      });
    }, function(error) {

      //Error
      //Stop Loading
      self.appNotify.stopLoading().then(function() {

        //There was an error connecting to facebook
        self.appNotify.showToast('Error, Facebook did not return your credentials.');
      });
    }, function() {
      //Subscription has completed
    })
  }

}

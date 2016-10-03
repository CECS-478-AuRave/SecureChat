import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the AppKeys provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppKeys {

    //How to ignore changes on this file: http://stackoverflow.com/a/17410119
    //DO NOT UPLOAD ACTUAL KEYS TO GITHUB

    //Declare our keys
    static testing = 'testing test';
    static facebookApiKey = 'FACEBOOK KEY HERE';

  constructor(private http: Http) {
  }

}

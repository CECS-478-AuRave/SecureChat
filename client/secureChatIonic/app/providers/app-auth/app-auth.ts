import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the AppAuth provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/
@Injectable()
export class AppAuth {

    //Declare our keys
    testing: string;

    //Class constructor
  constructor(private http: Http) {

      //Set our keys
      this.testing = 'hello testing keys';
  }

}

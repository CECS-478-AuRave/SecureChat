import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

//Import our providers (services)
import { AppKeys } from '../../providers/app-keys/app-keys';

/*
  Generated class for the AppAuth provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI
*/
@Injectable()
export class AppAuth {

  //Our user accesToken
  accesToken: string;

  //Class constructor
  constructor(private http: Http) {
  }

  //Login
  login() {

  }

  //Logout
  logout() {
  }

}

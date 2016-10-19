import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

/*
  Generated class for the AppLoading provider.

  See https://angular.io/docs/ts/latest/guide/dependency-injection.html
  for more info on providers and Angular 2 DI.
*/

//Handle Async requests, loading spinners, and general errors
@Injectable()
export class AppLoading {

  constructor(private http: Http) { }

}

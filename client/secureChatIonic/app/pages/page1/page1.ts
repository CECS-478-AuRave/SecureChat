import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/page1/page1.html'
})
export class Page1 {

  constructor(public navCtrl: NavController) {
  }

  //Function to test ng-click, aka (click)
  testFunc() {
      console.log("Hello, test!");
  }
}

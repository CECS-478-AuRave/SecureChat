import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/home/home.html'
})
export class Home {

  constructor(public navCtrl: NavController) {
  }

  //Function to test ng-click, aka (click)
  testFunc() {
      console.log("Hello, test!");
  }
}

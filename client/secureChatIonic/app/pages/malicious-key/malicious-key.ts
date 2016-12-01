import { Component } from '@angular/core';
import { ModalController, ViewController } from 'ionic-angular';

@Component({
  templateUrl: 'build/pages/malicious-key/malicious-key.html'
})
export class MaliciousKey {

  constructor(private modalCtrl: ModalController, private viewCtrl: ViewController) {
  }

  closeModal() {
    this.viewCtrl.dismiss();
  }
}

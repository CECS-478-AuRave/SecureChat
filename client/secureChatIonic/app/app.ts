import { Component, ViewChild } from '@angular/core';
import { ionicBootstrap, Platform, Nav } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

//Import our pages
import { Home } from './pages/home/home';
import { AllMessagesPage } from './pages/all-messages/all-messages';
import { AuthLoginPage } from './pages/auth-login/auth-login';

//Import our providers (services)
import { AppKeys } from './providers/app-keys/app-keys';
import { AppAuth } from './providers/app-auth/app-auth';

@Component({
  templateUrl: 'build/app.html',
  providers: [AppKeys, AppAuth]
})
class MyApp {
  @ViewChild(Nav) nav: Nav;

  rootPage: any = Home;

  pages: Array<{ title: string, component: any }>;

  constructor(public platform: Platform) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.pages = [
      { title: 'Home', component: Home },
      { title: 'Messages', component: AllMessagesPage },
      { title: 'Login', component: AuthLoginPage }
    ];

    //TODO: Temporary! A fake user settings json
    localStorage.setItem("shushUser", JSON.stringify({
      id: "2424",
      name: "test",
      session: "token"
    }));

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }
}

ionicBootstrap(MyApp);

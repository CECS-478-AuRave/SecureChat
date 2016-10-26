import { Component, ViewChild, ChangeDetectionStrategy } from '@angular/core';
import { ionicBootstrap, Platform, Nav } from 'ionic-angular';
import { StatusBar } from 'ionic-native';

//Import our providers (services)
import { AppSettings } from './providers/app-settings/app-settings';
import { AppNotify } from './providers/app-notify/app-notify';
import { AppAuth } from './providers/app-auth/app-auth';
import { AppMessaging } from './providers/app-messaging/app-messaging';

//Import our pages
import { Home } from './pages/home/home';
import { AuthLoginPage } from './pages/auth-login/auth-login';
import { AllConversationsPage } from './pages/all-conversations/all-conversations';
import { ConversationPage } from './pages/conversation/conversation';

//Change detection needed for updating "this" AKA $scope
@Component({
  templateUrl: 'build/app.html',
  providers: [AppSettings, AppAuth, AppMessaging, AppNotify],
  changeDetection: ChangeDetectionStrategy.OnPush
})
class MyApp {
  @ViewChild(Nav) nav: Nav;

  //Our Home Page
  rootPage: any;

  //Our Array of pages depending on state
  alwaysPages: Array<{ title: string, component: any }>;
  noAuthPages: Array<{ title: string, component: any }>;
  authPages: Array<{ title: string, component: any }>;

  constructor(public platform: Platform, private authProvider: AppAuth, private appNotify: AppNotify) {
    this.initializeApp();

    // used for an example of ngFor and navigation
    this.alwaysPages = [
      { title: 'Home', component: Home }
    ];
    this.noAuthPages = [
      { title: 'Login', component: AuthLoginPage }
    ];
    this.authPages = [
      { title: 'Messages', component: AllConversationsPage }
    ];

    //Set our root page
    if (this.isLoggedIn()) this.rootPage = AllConversationsPage;
    else this.rootPage = Home;

  }

  initializeApp() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleDefault();

      //Initialize facebook
      this.authProvider.initFacebook();
    });
  }

  openPage(page) {
    // Reset the content nav to have just this page
    // we wouldn't want the back button to show in this scenario
    this.nav.setRoot(page.component);
  }

  //Check if we are logged in
  isLoggedIn() {

    //Get the auth Status
    return this.authProvider.authStatus;
  }

  //Logout the user
  logout() {
    //Start Loading
    this.appNotify.startLoading('Logging out...');

    this.authProvider.logout();

    //Store reference to this for timeout
    let self = this;

    //Stop Loading
    this.appNotify.stopLoading().then(function() {
      //Toast What Happened
      //In a timeout to avoid colliding with loading
      setTimeout(function() {

        //Go back home
        self.rootPage = Home;
        self.nav.setRoot(Home);

        self.appNotify.showToast('Logout Successful!');
      }, 250)
    });
  }
}

ionicBootstrap(MyApp);

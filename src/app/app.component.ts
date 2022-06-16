import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { RiaService } from './ria.service';
import { Router } from '@angular/router';
import Parse from 'parse';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {

    showTabs: boolean;

    constructor(
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public service: RiaService,
        public router: Router
    ) {

        this.initializeApp();
        Parse.serverURL = 'https://realassist.b4a.io/';//'https://parseapi.back4app.com/';
        Parse.initialize(
            "XM10Z1gNI1gN90BqwSkVLlCK874pc4KjvL1tdij0",
            "dFJcsyQ98YVtX8Co7M8KWcEHqHiZhHAC6GKNagw7"
        );

    }

    async initializeApp() {
        await this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            //this.service.getUser();
           if(this.router.url === '/'){
               this.showTabs = false;
           } else {
               this.showTabs = true;
           }
            var user = Parse.User.current();
            
            if (!user) {
                this.router.navigate(['home/login'])
                
            } else {
                if (this.router.url == '') {
                this.router.navigate(['account'])
                }
                if (user.get('readyToAssist')) {
                    this.service.subscribeToRequests();
                }
            }
            this.service.getAssistanceRequests();
            //this.service.getUser();
        });
    }
}

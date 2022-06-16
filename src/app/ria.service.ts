import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import Parse from 'parse';
import { ToastController, AlertController, ActionSheetController, ModalController } from '@ionic/angular';
import { Geolocation } from '@awesome-cordova-plugins/geolocation/ngx';
import { ViewJobPage } from './view-job/view-job.page';
import { DiagnosticCategory } from 'typescript';

@Injectable({
  providedIn: 'root'
})
export class RiaService {
    public user: any;
     
    public selectedJob: any;
    public asssistanceRequested: any;
    public mapLoaded: boolean = false;

    public watchedGeolocation: any;
    public myGpsPosition: any;
    public readyToAssist: boolean;
    public affiliatedOffices: any = [
        {
        name: "TREG: Virginia Beach",
        }, {
        name: "TREG: Chesapeake"
        }
    ]

    public acceptedRequest: any;

    public requestSubscription: any;
    public assistTravelRadius: number = 15;
    public positionSubs: any;

    constructor(
        public router: Router,
        private toastController: ToastController,
        private alertController: AlertController,
        public geolocation: Geolocation,
        private actionSheetCtrl: ActionSheetController,
        private modalController: ModalController,
   

    ) {

    }
     
    async getAssistanceRequests() {
        let query = new Parse.Query('AgentRequests')
        query.include('agent');
        query.include('atProperty');
        await query.find().then((results) => {

            this.asssistanceRequested = results;
        
        }).catch(err => {
            console.log(err)
        })
    }

    async getUser() {
        this.user = await Parse.User.current();
        this.readyToAssist = this.user.get('readyToAssist');
        return this.user;
    }


    async initGeoTracking() {
        if (!this.watchedGeolocation) {
            var position;
            this.watchedGeolocation =  this.geolocation.watchPosition(); 
            this.positionSubs = await this.watchedGeolocation.subscribe((data) => {
               
                position = {
                    latitude: data.coords.latitude,
                    longitude: data.coords.longitude
                };

                this.myGpsPosition = position;
                this.user.set('agentLocation', new Parse.GeoPoint({ latitude: position.latitude, longitude: position.longitude }));
                this.user.save();
                console.log(this.myGpsPosition)
            }); 
        }
    };

    unsubscribeFromWatchPosition() {
        this.positionSubs.unsubscribe();
    }

    async subscribeToRequests() {
        let query = new Parse.Query('AgentRequests');
        this.requestSubscription = await query.subscribe();

        this.requestSubscription.on('create', (request) => {
            if (request.get('agent').id != this.user.id) {
                //Query request to pull complete information
                let query = new Parse.Query('AgentRequests');
                query.equalTo('objectId', request.id);
                query.include('atProperty');
                query.first().then((property) => {
                    console.log(request)
                    console.log(property)

                    //Calculate Radius to determine location of point
                    var latU = this.user.get('agentLocation').latitude;
                    var longU = this.user.get('agentLocation').longitude;
                    var latR = property.get('atProperty').get('location').latitude;
                    var longR = property.get('atProperty').get('location').longitude;
                    var deltaLat = (latU - latR) * Math.PI / 180;
                    var deltaLong = (longU - longR) * Math.PI / 180;
                    var a = 0.5 - Math.cos(deltaLat) / 2 + Math.cos(latR * Math.PI / 180) * Math.cos(latU * Math.PI / 180) * (1 - Math.cos(deltaLong)) / 2;

                    var distance = Math.round(6371000 * 2 * Math.asin(Math.sqrt(a))); // Result in Meters
                    distance = distance / 1609; //To get in Miles

                    console.log(distance, this.assistTravelRadius);
                    if (distance <= this.assistTravelRadius) {
                        this.notifyAgent(request);
                    }
                }).catch(err => console.log(err));
            };
        });
    };

    setTravelRadius(value) {
        this.assistTravelRadius = value;
        console.log(value)
    };

    async notifyAgent(request) {
        const actionSheet = await this.actionSheetCtrl.create({
            header: 'New Request!',
            backdropDismiss: false,
            animated: true,
            cssClass: 'actionSheet',
            mode: 'ios',
            buttons: [
            {
                text: 'View Request', 
                icon: 'checkmark-circle', 
                data: {},
                    handler: () => {
                        this.viewMoreDetails(-1, request);
                }
            }, {
                text: 'Reject',
                    icon: 'close-circle',
                    role: 'destructive',
                data: {},
                handler: () => {
                    console.log('Reject Clicked');
                }
            }]
        });
        await actionSheet.present();  
    }


    async viewMoreDetails(i, incomRequest) {
        if (i != -1) {
            this.selectedJob = this.asssistanceRequested[i];
        } else {
            this.selectedJob = incomRequest;
        }
        const modal = await this.modalController.create({
            component: ViewJobPage,
            cssClass: 'my-custom-class'
        });
        return await modal.present();
    }

    createAccount() {
        this.router.navigate(['home/create-account']);
    }

    forgotPassword() {
        
    }

    async createRequest() {
        this.router.navigate(['create-request']);
    }

    goToMap() { 
        this.router.navigate(['map']);
    }

    async getLocation() {

    }

    async logOut() {
        await Parse.User.logOut().then((user) => {
            this.user = user;
            this.presentToast('You have been successfully logged out');
            this.router.navigate(['home/login'], { replaceUrl: true })
        }).catch(err => {
            console.log(err);
            this.presentToast(err.message)
        })
    }

    async presentToast(message) { 
        const toast = await this.toastController.create({
            message: message,
            cssClass: 'toastAlert',
            duration: 2000
        });
        await toast.present();
    }

    async alertUserYesNo(message) {
        let result;
        let answer = false;
        const alert = await this.alertController.create({
            cssClass: 'yesnoAlert',
            header: 'Ready to Assist?',
            message: message,
            backdropDismiss: false,
            buttons: [
                {
                    text: 'Not yet', 
                    cssClass: 'secondary', 
                    id: 'cancel-button',
                    handler: () => {
                        answer = false;
                    }
                }, {
                    text: 'I am ready',
                    id: 'confirm-button', 
                    handler: () => {
                        answer = true;
                    }
                }
            ]
        });

        await alert.present(); 
        await alert.onDidDismiss().then((data) => {
           
        })

        return answer;

    }

    async stopAssistingAlert(message) {
     
        let answer = false;
        const alert = await this.alertController.create({
            cssClass: 'yesnoAlert',
            header: 'Ready to Assist?',
            message: message,
            backdropDismiss: false,
            buttons: [
                {
                    text: 'Not yet', 
                    cssClass: 'secondary',
                    id: 'cancel-button', 
                    handler: () => {
                        answer = false
                         
                    }
                }, {
                    text: 'Stop Assisting',
                    id: 'confirm-button', 
                    handler: () => {
                        answer = true;
                    }
                }
            ]
        });

        await alert.present();
        await alert.onDidDismiss().then((data) => {
             
            
        })

        return answer;

    }

    navigateTo(url) {
        this.router.navigate([url]);
    }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RiaService } from '../ria.service';
import Parse from 'parse';
import { Animation, AnimationController } from '@ionic/angular';   
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.page.html',
  styleUrls: ['./account.page.scss'],
})
export class AccountPage implements OnInit {
  assistedAgents: any = [];
  readyToAssist: boolean = false;
  myGpsPosition: any;
  watchedGeolocation: any;
  isEditing: boolean = false;

  user: any;
  fullName: string;
  phone: string;
  email: string;
  realtorLicense: any;
  picture: any;
  firmAffiliation: any;
  newFirmAffiliation: any;
  firms: any;

  uploadingImg:boolean = false;

  historyAnim: any;
  requestHistory: any = [];

  assignedAnim: any;
  assignedRequest: any = [];

  constructor(
    public service: RiaService,
    private animationCtrl: AnimationController,
    private cd: ChangeDetectorRef,  
    private router: Router
  ) {

   }

  ngOnInit() {
     
  }

  ionViewWillEnter(){
    this.getAgentsAssisted(); 
    this.getUserData();

  }

  getAgentsAssisted(){
     
  }

  async getUserData(){
    var user = Parse.User.current();
    let query = new Parse.Query('User');
    query.equalTo('objectId', user.id);
    query.include('firmAffiliation')
    await query.first().then((user)=>{
      this.user = user;
      this.service.user = user;
    })
 
    this.readyToAssist = this.user.get('readyToAssist');
    if(this.readyToAssist){
      this.service.initGeoTracking();
    }
    
    this.fullName = this.user.get('fullName');
    this.phone = this.user.get('phoneNumber');
    this.email = this.user.get('username');
    this.firmAffiliation = this.user.get('firmAffiliation').get('name'); 
    this.realtorLicense = this.user.get('realtorLicenseNum');
    this.picture = this.user.get('picture');

    this.getAssignedRequests();
  }

  async getAssignedRequests(){
    let query = new Parse.Query('AgentRequests');
    query.equalTo('assignedAgent', Parse.Object.extend('_User').createWithoutData(this.user.id).toPointer());
    query.include('atProperty');
    query.include('agent');
    await query.find().then((result)=>{ 
      this.assignedRequest = result; 
    }).catch(err=>console.log(err))
  }

  editInfo(){
    if(!this.isEditing){
      this.isEditing = true;
      
    } else {
      this.isEditing = false;
    }
  }

  async updateInfo(){
    this.user.set('fullName', this.fullName);
    this.user.set('phoneNumber', this.phone);
    this.user.set('email', this.email);
    this.user.set('username', this.email);
    this.user.set('picture', this.picture)
 //   if(this.newFirmAffiliation){
  //    this.user.set('firmAffiliation', Parse.Object.extend('RealEstateFirms').createWithoutData(this.newFirmAffiliation.id).toPointer())
 //   }
    await this.user.save()
    this.getUserData();
    this.service.presentToast('Your information has been updated');
    this.isEditing = false; 
  }
 

  async beginStopAssisting(){ 
  if(!this.readyToAssist){
        var response = await this.service.alertUserYesNo('Marking yourself as available will allow for new Assistance Requests that are near you to notify you' + 
            'and will required your acceptance or rejection. Please only mark as available if you are willing and able to assist your fellow agent.'); 
 
   if(response){
     this.readyToAssist = response;
     this.service.initGeoTracking();
        this.user.set('readyToAssist', this.readyToAssist);
        await this.user.save();
        this.service.presentToast('You have been marked as available to Assist!')
        this.service.readyToAssist = response;
        this.service.subscribeToRequests();
        //setTimeout(()=>{
        //this.router.navigate(['assist']) 
        //},600)
   }
   if(!response){
     this.service.readyToAssist = false;
   } 

    } else {
      var response = await this.service.stopAssistingAlert('You are currently active. By marking yourself as not ready, you will not receive notifications when a new' +
      'agent needs assistance. Are you sure?'); 
       if(response){
        this.readyToAssist = !response; 
        this.service.readyToAssist = !response;
        this.user.set('readyToAssist', this.readyToAssist);
        await this.user.save();
        this.service.requestSubscription.unsubscribe();
        this.service.unsubscribeFromWatchPosition();
        this.service.presentToast('You are no longer assisting Agents');

   }
    }
 
  }

  seeToggle(){
    console.log(this.readyToAssist)
  }

  async showAssignedRequests(){
     if(this.assignedAnim){
      this.assignedAnim.direction('reverse');
      await this.assignedAnim.play();
      this.assignedAnim = null;
      return;
    }
    let popup = document.getElementById('assigned') 
    this.assignedAnim = this.animationCtrl.create()
    .addElement(popup)
    .duration(200)
    .iterations(1)
    .fromTo('display', 'none', 'block')
    .fromTo('height', '0px', '500px')
    .fromTo('opacity', '0', '1');

   await this.assignedAnim.play();
  }


  changedOffice(index){
     this.newFirmAffiliation = this.firms[index];
     console.log(this.newFirmAffiliation)
  }

  async showHistory(){
    if(this.historyAnim){
      this.historyAnim.direction('reverse');
      await this.historyAnim.play();
      this.historyAnim = null;
      return;
    }
    let popup = document.getElementById('history') 
    this.historyAnim = this.animationCtrl.create()
    .addElement(popup)
    .duration(200)
    .iterations(1)
    .fromTo('display', 'none', 'block')
    .fromTo('height', '0px', '500px')
    .fromTo('opacity', '0', '1');

   await this.historyAnim.play();
  }

  initUpload(){
    var input = document.getElementById('input');
    input.click();
  }

  async picChange(event) {  
    this.uploadingImg = true;
   
    var files = event.srcElement.files  
    let file = event.target.files[0] 
    let reader = new FileReader() 
    reader.onload = (e:any)=>{
    let fileData = e.target.result 
      const base64Image = fileData;
            const name = file.name;
            const parseFile = new Parse.File(name, {
                base64: base64Image
            });  
              parseFile.save().then((savedFile) => {
                this.picture = savedFile;  
                this.uploadingImg = false;
                this.cd.detectChanges();
              
            }).catch(error =>{
                this.uploadingImg = false;

              console.log(error)
              this.service.presentToast(error.message); 
            })
      }
    reader.readAsDataURL(file)   
 }

}

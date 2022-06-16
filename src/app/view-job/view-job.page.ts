import { Component, OnInit } from '@angular/core';
import { RiaService } from '../ria.service';
import { ModalController } from '@ionic/angular'; 
import Parse from 'parse';

@Component({
  selector: 'app-view-job',
  templateUrl: './view-job.page.html',
  styleUrls: ['./view-job.page.scss'],
})
export class ViewJobPage implements OnInit {
  request: any; 
  showingDate: any;
  startTime: any;
  endTime: any;
  picture: any;
  agent: any;
  address: any;

  user: any;
  assitingAgent: boolean = false;
  constructor(
    public service: RiaService,
    private modalController: ModalController
  ) { }


  ngOnInit() {
     this.request = this.service.selectedJob;   
        this.showingDate = new Date( this.request.get('showingDate'));
        this.startTime = new Date( this.request.get('startTime'));
        this.endTime = new Date( this.request.get('endTime'));
        this.picture = this.request.get('atProperty').get('image').url();
        this.agent = this.request.get('agent').get('fullName');
        this.address = this.request.get('atProperty').get('address');
        this.user = Parse.User.current();
  }

  ionViewWillEnter(){
     this.verifyIfAssisting();
  }

  closeModal(){
    this.modalController.dismiss();
  }

  async assistWithRequest(){
    let search = new Parse.Query('AgentRequests');
    search.equalTo('objectId', this.request.id);
    await search.first().then((req)=>{
      req.set('assignedAgent', Parse.Object.extend('_User').createWithoutData(this.user.id).toPointer());
      req.save() 
      this.request = req;
      this.service.presentToast('You have been assigned to this Request');
      this.closeModal();
      this.service.router.navigate(['account'])
    }).catch(err=>{console.log(err)})
    
  }

  verifyIfAssisting(){
   if(this.request.get('assignedAgent')){
    if(this.request.get('assignedAgent').id == this.user.id){
      this.assitingAgent = true;
    }
   }
  }

}

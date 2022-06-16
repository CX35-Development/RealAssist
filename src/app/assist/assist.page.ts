import { Component, OnInit } from '@angular/core';
import { RiaService } from '../ria.service';
import { ModalController } from '@ionic/angular';
import Parse from 'parse';

@Component({
  selector: 'app-assist',
  templateUrl: './assist.page.html',
  styleUrls: ['./assist.page.scss'],
})
export class AssistPage implements OnInit {

  asssistanceRequested: any = [];
  showingDate: any = [];
  startTime: any = [];
  endTime: any = [];

  assignedJob: any = [];

  user: any;

  constructor(
    public service: RiaService,
    private modalController: ModalController
  ) { }

  ngOnInit() { 
     this.user = Parse.User.current();
  }

  ionViewWillEnter(){
   this.service.getAssistanceRequests().then(()=>{
     this.getRequests(); 
   }); 
    
  }

  ionViewDidEnter(){
   
     
  }

  async getRequests(){
      this.asssistanceRequested = this.service.asssistanceRequested;
        for(let i=0; i <  this.asssistanceRequested.length; i++){
        this.showingDate[i] = new Date( this.asssistanceRequested[i].get('showingDate'));
        this.startTime[i] = new Date( this.asssistanceRequested[i].get('startTime'));
        this.endTime[i] = new Date( this.asssistanceRequested[i].get('endTime')); 
        if(this.asssistanceRequested[i].get('assignedAgent')){
        if(this.asssistanceRequested[i].get('assignedAgent').id == this.user.id){
            this.assignedJob[i] = true;
        }  
        }
      }   
  }


}

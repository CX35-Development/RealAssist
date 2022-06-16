import { Component, OnInit } from '@angular/core';
import Parse from 'parse';
import { RiaService } from '../ria.service';
@Component({
  selector: 'app-agents',
  templateUrl: './agents.page.html',
  styleUrls: ['./agents.page.scss'],
})
export class AgentsPage implements OnInit {
  allFirmAgents: any = [];
  user: any;
  constructor(
    public service: RiaService
  ) { }

  ngOnInit() {
    this.user = Parse.User.current();
  }

  ionViewWillEnter(){
    this.getAllAgents();
  }

  async getAllAgents(){
     let query = new Parse.Query('User');
     query.equalTo('firmAffiliation', Parse.Object.extend('RealEstateFirms').createWithoutData(this.user.get('firmAffiliation').id).toPointer());
     await query.find().then((result)=>{
        
       this.allFirmAgents = result;
     }).catch(err=>{console.log(err)})
  }

}

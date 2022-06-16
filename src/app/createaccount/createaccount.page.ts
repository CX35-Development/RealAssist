import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { RiaService } from '../ria.service';
import Parse from 'parse';
import { Router } from '@angular/router';

@Component({
  selector: 'app-createaccount',
  templateUrl: './createaccount.page.html',
  styleUrls: ['./createaccount.page.scss'],
})
export class CreateaccountPage implements OnInit {
  fullName: string;
  email: string;
  phone: string;
  license: number;
  firms: any = [];
  selectedFirm: any;
  password1: any;
  password2: any;
  picture: any;


  constructor(
    public service: RiaService,
    private router: Router,
    private cd: ChangeDetectorRef
  ) {
    
   }

  ngOnInit() {
    this.getOffices();
  }

  async getOffices(){
    let query = new Parse.Query('RealEstateFirms');
    await query.find().then((result)=>{
      this.firms = result;
    }).catch(err=>{
      console.log(err);
      })
  }

  officeSelection(officeId){ 
    for(let i=0; i<this.firms.length; i++){
      if(officeId == this.firms[i].id){
        this.selectedFirm = this.firms[i].id;
      }
    } 
  }

  async verifyInformationAndCreate(){
    if(!this.fullName){
      this.service.presentToast('You name is required');
      return;
    } else 
    if(!this.email){
      this.service.presentToast('Email is required');
      return;
    } else 
    if(!this.phone){
      this.service.presentToast('Phone number is required');
      return;
    } else 
    if(!this.license){
      this.service.presentToast('Real Estate License required');
      return;
    } else 
    if(!this.selectedFirm){
      this.service.presentToast('Please select an office affiliation');
      return;
    } else 
    if(!this.password1){
      this.service.presentToast('Please enter a password');
      return;
    } else 
    if(!this.password2){
      this.service.presentToast('Please reenter password');
      return;
    } else 
    if(this.password1 !== this.password2){
      this.service.presentToast('Passwords do not match');
      return;
    } else {
      var user = new Parse.User();
      user.set('fullName', this.fullName);
      user.set('username', this.email);
      user.set('email', this.email);
      user.set('password', this.password1);
      user.set('realtorLicenseNum', this.license);
      user.set('picture', this.picture);
      user.set('phoneNumber', this.phone);
      user.set('firmAffiliation', Parse.Object.extend('RealEstateFirms').createWithoutData(this.selectedFirm).toPointer());
      await user.signUp().then((user)=>{
        this.service.user = user;
        this.service.presentToast('Your account has been created successfully')
        this.router.navigate(['account'])
      }).catch(err=>{
        console.log(err)
        this.service.presentToast(err.message)
      })
    }
  }

  picBtnClick(){
    var input = document.getElementById('input');
    input.click();
  }

  async picChange(event) {  
   
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
                this.cd.detectChanges(); 

            }).catch(error =>{

              console.log(error)
              this.service.presentToast(error.message); 
            })
      }
    reader.readAsDataURL(file)   
 }

}

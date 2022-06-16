import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RiaService } from '../ria.service';
import Parse from 'parse';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  email: string;
  password: any;

  constructor(
    private router: Router,
    public service: RiaService
  ) { }

  ngOnInit() {
      var user = Parse.User.current(); 
            if (!user) {
                //this.router.navigate(['home/login'])
            } else { 
                this.router.navigate(['account']) 
            }
  }

  async login(){
    if(!this.email){
      this.service.presentToast('Email is invalid');
      return;
    } else if(!this.password){
      this.service.presentToast('Verify your password')
      return;
    } else {
      await Parse.User.logIn(this.email, this.password).then((user)=>{
        this.router.navigate(['account', {replaceUrl: true}]);
        this.service.presentToast('You have been logged in successfully')
        this.email = null;
        this.password = null;
      }).catch(err =>{
        console.log(err);
        this.service.presentToast(err.message);
      });
    }
    //this.router.navigate(['account'], { replaceUrl: true })
  }

}

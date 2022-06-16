import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import Parse from 'parse';
import {RiaService} from '../ria.service';
import * as mapboxgl from 'mapbox-gl';   
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-create-request',
  templateUrl: './create-request.page.html',
  styleUrls: ['./create-request.page.scss'],
})
export class CreateRequestPage implements OnInit {

  user: any;

  homeMLS: any;
  startTime: any;
  endTime: any;
  showingDateTime: any;
  propAddress: string;
  cbsCode: number;
  comments: string;
  pay: number = 100;
  propLocMap: any;
  isMapLoaded:boolean = false;
  clearedMap: boolean;
  reqGeoLoc: any;


  geocoder: any;
  image: any;

   

  currYear: any;
  constructor(
    public service: RiaService,
    private router: Router,
    private http: HttpClient, 
    private cd: ChangeDetectorRef
  ) {
 mapboxgl.accessToken = 'pk.eyJ1IjoibHNvdHRvMjAwNSIsImEiOiJja25vbXhlMmgxNzI5Mm9wZTZtNDc4NnVoIn0.0SdeGIUJJzfEGnlJetr47g';

   }

  ngOnInit() {
    var today = new Date();
    this.currYear = today.getFullYear();
    this.user = Parse.User.current();   
    this.showingDateTime =  today.toJSON()
    this.startTime = today.toJSON()
    this.endTime = today.toJSON()
  }

  ionViewDidEnter(){
   this.loadMap();
   this.loadGeocoder();

  }

  ionViewDidLeave(){
    this.propLocMap.remove();  
    this.isMapLoaded = false;
    this.geocoder = null
  }

  clearData(){
    this.image = null;
    this.homeMLS = null;
    this.startTime = null;
    this.endTime = null;
    this.showingDateTime = null;
    this.propAddress = null;
    this.cbsCode = null;
    this.comments = null;
  }

  async verifyData(){ 
    if(!this.homeMLS){
      this.service.presentToast('MLS field required');
      return;
    } else 
    if(!this.startTime){
      this.service.presentToast('From Time invalid');
      return;
    } else 
    if(!this.endTime){
      this.service.presentToast('To Time invalid');
      return;
    } else
    if(!this.showingDateTime){
      this.service.presentToast('Date is required');
      return;
    } else 
    if(!this.propAddress){
      this.service.presentToast('Property address required');
      return;      
    } else 
    if(!this.cbsCode){
      this.service.presentToast('CBS Code required');
      return;
    } else 
    if(!this.comments){
      this.service.presentToast('Special instructions or comments required');
      return;
    } else { 
      this.createProperty(); 
  } 
}


  async createProperty(){
   if(!this.image){
      this.http.get('/assets/reqHousePic.png', { responseType: 'blob' })
        .subscribe(res => {
           const reader = new FileReader();
          reader.onloadend = () => {
          var base64data = reader.result;  
                 const name = 'photoLogo.jpeg'
                 const parseFile = new Parse.File(name,{
                   base64: base64data
                 });
                 parseFile.save().then((savedFile)=>{
                   this.image = savedFile
   const location = new Parse.GeoPoint({latitude: this.reqGeoLoc[0].latitude, longitude: this.reqGeoLoc[0].longitude})
   const Property = Parse.Object.extend('Properties');
   let property = new Property();
   
   property.set('address', this.propAddress);
   property.set('image', this.image);
   property.set('location', location);
   property.set('createdBy', Parse.Object.extend('_User').createWithoutData(this.user.id).toPointer())
   property.save().then((property)=>{
     this.createRequest(property);
   }).catch(err=>{
     console.log(err)
     this.service.presentToast(err.message);
   }); 
                 }); 
            }
                  reader.readAsDataURL(res);  
  });

   } else {

   const location = new Parse.GeoPoint({latitude: this.reqGeoLoc[0].latitude, longitude: this.reqGeoLoc[0].longitude})
   const Property = Parse.Object.extend('Properties');
   let property = new Property();
   
   property.set('address', this.propAddress);
   property.set('image', this.image);
   property.set('location', location);
   property.set('createdBy', Parse.Object.extend('_User').createWithoutData(this.user.id).toPointer())
   property.save().then((property)=>{
     this.createRequest(property);
   }).catch(err=>{
     console.log(err)
     this.service.presentToast(err.message);
   }) 
   }
  
  }

  async createRequest(property){
     
    var showDate = new Date(this.showingDateTime)
    var startTime = new Date(this.startTime);
    var endTime = new Date(this.endTime);
      
  this.startTime = new Date(
     showDate.getFullYear(),
     showDate.getMonth(),
     showDate.getDate(),
     startTime.getHours(),
     startTime.getMinutes()
  );    

  this.endTime = new Date(
     showDate.getFullYear(),
     showDate.getMonth(),
     showDate.getDate(),
     endTime.getHours(),
     endTime.getMinutes()
  );   
  this.showingDateTime = showDate;
     const Request = Parse.Object.extend('AgentRequests');
   let request = new Request();

   request.set('mls', this.homeMLS);
   request.set('cbsCode', this.cbsCode);
   request.set('showingDate', this.showingDateTime);
   request.set('compensation', this.pay);
   request.set('commentOrInstruction', this.comments);
   request.set('agent', Parse.Object.extend('_User').createWithoutData(this.user.id).toPointer());
   request.set('atProperty', Parse.Object.extend('Properties').createWithoutData(property.id).toPointer());
   request.set('startTime', this.startTime);
   request.set('endTime', this.endTime);

   await request.save().then((request)=>{
     this.service.getAssistanceRequests();
     this.service.presentToast('Your request has been created successfully');
     this.router.navigate(['assist'], {replaceUrl: true})
   })
    

  }

    initPicUpload(){
    var input = document.getElementById('input');
    input.click();
  }

  async picChange(event) {  
   console.log(event)
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
                this.image = savedFile; 
                console.log(savedFile)
                this.cd.detectChanges(); 

            }).catch(error =>{

              console.log(error)
              this.service.presentToast(error.message); 
            })
      }
    reader.readAsDataURL(file)   
 }



  loadMap(){ 
    let self = this;
    if(!this.isMapLoaded){ 
            self.propLocMap = new mapboxgl.Map({
            container: 'propLoc',
            style: 'mapbox://styles/lsotto2005/ck62emegd0jhe1iqqklab1mlx', 
            center: [-76.0232387172899, 36.86065707444252],
            zoom: 10
    });
    this.isMapLoaded = true;
    } 
     
  }

  loadGeocoder(){
    let self = this;
    self.geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken, 
    placeholder: 'Enter property address',
    marker: false,  
    countries: 'us',  
    filter: function (item) { 
            return item.context.some((i) => { 
        return (
            i.id.split('.').shift() == 'district' &&
            i.text === 'Norfolk' 
            ||
            i.id.split('.').shift() == 'district' &&
            i.text === 'Virginia Beach' 
            ||
            i.id.split('.').shift() == 'district' &&
            i.text === 'Chesapeake' 
        );
      });
    },
     // keepOpen: false,
     mapboxgl: mapboxgl
  });
 // self.geocoder.addTo('#geocoder');
  self.propLocMap.addControl(self.geocoder)
  self.geocoder.on('result', function (e) { 
  self.clearedMap = false;
  self.reqGeoLoc = [
      {
          latitude:e.result.geometry.coordinates[1],
          longitude:e.result.geometry.coordinates[0]
      }
  ];  
  self.propAddress = e.result.place_name;
  self.propLocMap.loadImage('../../../assets/homePin.png',  function (error, image){

           if (error) throw error;
              self.propLocMap.addImage('pin', image);
                     
  self.propLocMap.addSource('point', {
        'type': 'geojson',
        'data': {
        'type': 'FeatureCollection',
        'features': [
      {
        'type': 'Feature',
        'geometry': {
        'type': 'Point',
        'coordinates': [e.result.geometry.coordinates[0], e.result.geometry.coordinates[1]]
        }
      }
                    ]
        }
  });
      self.propLocMap.addLayer({
        'id': 'point',
        'type': 'symbol',
        'source': 'point',
        'layout': {
            'icon-image': 'pin',
            'icon-size': .1
          }
      })

    setTimeout(()=>{
        self.propLocMap.flyTo({
          center: [e.result.geometry.coordinates[0], e.result.geometry.coordinates[1]],
          essential: true,
          zoom: 19, 
          speed: 1,  
        })
      }, 750)
 
        });
      });

   self.geocoder.on('clear', function () { 
           self.clearGeocoder(); 
    }); 
  
  }
 

  clearGeocoder(){
  if(this.clearedMap == false){
  let self = this; 
          
            self.propLocMap.removeLayer('point');
            self.propLocMap.removeSource('point');
            self.propLocMap.removeImage('pin'); 
            self.propLocMap.zoomTo(10,{ 
              duration:3000,
              animate: true,
              essential: true,
              curve: 1,
            }) 

     this.clearedMap = true;
  }
}

}

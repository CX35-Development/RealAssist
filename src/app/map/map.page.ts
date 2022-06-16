import { Component, OnInit } from '@angular/core';
import { RiaService } from '../ria.service';
import * as mapboxgl from 'mapbox-gl';   
import { ViewJobPage } from '../view-job/view-job.page';
import { ModalController } from '@ionic/angular'
import Parse from 'parse';
import { HttpClient, HttpHeaders } from '@angular/common/http';

declare var require: any;

@Component({
  selector: 'app-map',
  templateUrl: './map.page.html',
  styleUrls: ['./map.page.scss'],
})
export class MapPage implements OnInit {

  map: any;
  mapboxGl: any; 

  user: any;

  constructor(
    private service: RiaService,
    private modal: ModalController,
    private httpClient: HttpClient
  ) {
 
 mapboxgl.accessToken = 'pk.eyJ1IjoibHNvdHRvMjAwNSIsImEiOiJja25vbXhlMmgxNzI5Mm9wZTZtNDc4NnVoIn0.0SdeGIUJJzfEGnlJetr47g';

  }

  ngOnInit() {
  this.getUser();
  }

  async getUser(){
     this.user = await this.service.getUser();

  }

  ionViewWillEnter(){
   this.loadMap(); 
  }
  ionViewDidEnter(){
     this.service.getAssistanceRequests();
    
  }

  closeMap(){
this.service.router.navigate(['assist'])
  } 
 

  
  async viewMoreDetails(i) {
  this.service.selectedJob = this.service.asssistanceRequested[i];
  const modal = await this.modal.create({
    component: ViewJobPage,
    cssClass: 'my-custom-class'
  });
  return await modal.present();
}
 
async markUserLocation(){  
    //let headshot =  this.user.get('picture').url() 
   // console.log(headshot)

    let self = this;  
            
           self.map.loadImage('../../../assets/agentPin.png', function (error, image) {
                if (error) throw error; 
                self.map.addImage('agent', image);
            });
              /*  self.map.on('click', 'pins', function (e) { 
                   
                    var coordinates = e.features[0].geometry.coordinates.slice(); 
                    var agent = e.features[0].properties.agent;
                    var index = e.features[0].properties.index;
                    var housePic = e.features[0].properties.housePic
               

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng >
                            coordinates[0] ? 360 : -360;
                    }
                  
                   var popup = new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(pop()) 
                        .addTo(self.map)
                        
                            
                    function pop() {
                        var html = '';
                          
                        html += '<ion-row class="ion-justify-content-center"><ion-col>';
                        html += '<ion-img style="width:100%; height:100px" src='+housePic+'></ion-img>'
                        html += "<h5><br>"+ agent +"</h5>";
                        html += "<p>"+ address +"</p>";
                        html += '</ion-row>';
                        html += '<ion-row class="ion-justify-content-center">';
                        html += '<ion-button id='+ index +' shape="round" size="small" color="tertiary" strong="true">See Profile</ion-button>'
                        html += '</ion-col></ion-row>';
                        return html;
                    }
                    
                    document.getElementById(index).addEventListener('click',  function(){
                           self.viewMoreDetails(index); 
                }); 
           });*/ 
      
        
             self.map.addSource('agentData', {
                      'type': 'geojson',
                      'data': {
                      'type': 'FeatureCollection',
                            'features': [ 
                                  {
                                  'type': 'Feature',
                                  'geometry': {
                                  'type': 'Point',
                                  'coordinates': [this.user.get('agentLocation').longitude, this.user.get('agentLocation').latitude] // icon position [lng, lat]
                                              }
                                  }
                                        ]
                              } 
             });

             self.map.addLayer({
                    "id": "agentLocationDot",
                    "type": "symbol",
                    "source": "agentData",
                    "layout": {
                        "icon-image": "agent",
                        "icon-size": .15, 
                        "icon-allow-overlap": true,
                    }
                });   
}

  async loadMap(){ 
    let self = this;
    if(!this.service.mapLoaded){
             
            self.map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/lsotto2005/ck62emegd0jhe1iqqklab1mlx', 
            center: [-76.15073050749463, 36.84911900067433],
            zoom: 9
    });
    }
    self.loadMarkers(); 
  }

  loadMarkers(){
     let houses = [];
     let requests = this.service.asssistanceRequested;
     let self = this;
 
    self.map.on('load', function () { 
           
   if(self.service.readyToAssist){
      self.service.initGeoTracking() 
      self.markUserLocation();  
       
     }
            
           self.map.loadImage('../../../assets/homePin.png', function (error, image) {
                if (error) throw error; 
                self.map.addImage('pin', image);

                self.map.on('click', 'pins', function (e) { 
            
                    var coordinates = e.features[0].geometry.coordinates.slice();
                    var address = e.features[0].properties.address;
                    var agent = e.features[0].properties.agent;
                    var index = e.features[0].properties.index;
                    var housePic = e.features[0].properties.housePic
               

                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                        coordinates[0] += e.lngLat.lng >
                            coordinates[0] ? 360 : -360;
                    }
                  
                   var popup = new mapboxgl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(pop()) 
                        .addTo(self.map)
                        
                            
                    function pop() {
                        var html = '';
                          
                        html += '<ion-row class="ion-justify-content-center"><ion-col>';
                        html += '<ion-img style="width:100%; height:100px" src='+housePic+'></ion-img>'
                        html += "<h5><br>"+ agent +"</h5>";
                        html += "<p>"+ address +"</p>";
                        html += '</ion-row>';
                        html += '<ion-row class="ion-justify-content-center">';
                        html += '<ion-button id='+ index +' shape="round" size="small" color="tertiary" strong="true">See Property</ion-button>'
                        html += '</ion-col></ion-row>';
                        return html;
                    }
                    
                    document.getElementById(index).addEventListener('click',  function(){
                           self.viewMoreDetails(index); 
                }); 
           });

        }); 

        let pins = [];

            for (let i = 0; i < requests.length; i++) { 

                pins.push({
                    "type": "Feature", 
                    "geometry": {
                        "type": "Point",
                        "coordinates": [requests[i].get('atProperty').get('location').longitude, 
                                        requests[i].get('atProperty').get('location').latitude
                        ]
                    },
                     "properties": {
                        agent: requests[i].get('agent').get('fullName'),
                        housePic: requests[i].get('atProperty').get('image')?.url(),
                        address: requests[i].get('atProperty').get('address'),
                        index: i
                    }
                }); 
            }
            
                self.map.addSource('pins', {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        features: pins
                    } 
                });

             self.map.addLayer({
                    "id": "pins",
                    "type": "symbol",
                    "source": "pins",
                    "layout": {
                        "icon-image": "pin",
                        "icon-size":.1, 
                    }
                });
      
      });
  }

}

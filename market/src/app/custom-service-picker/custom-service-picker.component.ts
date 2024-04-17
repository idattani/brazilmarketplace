import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-service-picker',
  templateUrl: './custom-service-picker.component.html',
  styleUrls: ['./custom-service-picker.component.css']
})
export class CustomServicePickerComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }


  services: Array<string> = []

  service_to_be_added = ""

  addService () {
    if (this.service_to_be_added) {
      this.services.push(this.service_to_be_added)
      this.service_to_be_added = ""
    }
    else {
      window.alert("Service must not be empty!")
    }
  }

  deleteService (service: any) {
    const index = this.services.indexOf(service, 0)
    
    this.services.splice(index, 1)
  }

}

import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-service-picker',
  templateUrl: './service-picker.component.html',
  styleUrls: ['./service-picker.component.css']
})

export class ServicePickerComponent implements OnInit {

  constructor(public authService: AuthService, private router: Router, private translate: TranslateService) { }

  ngOnInit(): void {
    if (this.router.url.split("/")[2] == 'supplier') {
      console.log("route found")
      let jsonUser = JSON.parse(localStorage.getItem('userData')!);
      console.log(jsonUser.categories)
      this.category_level_body = jsonUser.categories
      this.authService.servicePickerOptions = jsonUser.categories
    }
  }

  categories: any = {
    Identify: {
      "Asset Management": [
        "Software & Security Lifecycle Management",
        "IT Management Service"
      ],
      "Business Environment": [
        "Business Impact Analysis"
      ],
      "Governance and Risk Management": [
        "Security Certification",
        "Governance & Risk Compliance"
      ],
      "Risk Assessment": [
        "Risk Management and Solution Services"
      ],
      "Risk Management Strategy": [
        "Risk Management Strategy Development & Consulting"
      ],
      "Supply Chain and Risk Management": [
        "Supply Chain Risk Monitoring Solutions & Services"
      ]
    },
    Protect: {
      "Identity Management & Access Control": [
        "Access Management",
        "Authentication",
        "Authorization",
        "Identity Management"
      ],
      "Awareness and Training": [
        "Awareness Trainings",
        "Cyber Ranges"
      ],
      "Data Security": [
        "PKI / Digital Certificates",
        "Data Leak Prevention",
        "Encryption",
        "Cloud Access Security Brokers",
        "Hardware Security Modules",
        "Digital Signatures"
      ],
      "Information Protection Processes and Procedures": [
        "Static Application Security Testing",
        "Application Security"
      ],
      "Maintenance": [
        "Patch Management",
        "Vulnerability Management",
        "Penetration Testing / Red Teaming"
      ],
      "Protective Technology": [
        "Wireless Security",
        "Remote Access / VPN",
        "IoT Security",
        "PC/Mobile/End Point Security",
        "Mobile Security / Device Management",
        "Sandboxing",
        "Content Filtering and Monitoring",
        "Firewalls / NextGen Firewalls",
        "Unified Threat Management",
        "Anti Spam",
        "Anti Virus/Worm/Malware",
        "Backup / Storage Security"
      ]
    },
    Detect: {
      "Anomalies and Events": [
        "Fraud Management",
        "Intrustion Detection"
      ],
      "Security Continuous Monitoring": [
        "SIEM / Event Correlation Solutions",
        "Cyber Threat Intelligence",
        "Security Operations Center"
      ],
      "Detection Processes": [
        "Underground/Darkweb Investigation",
        "Honeypots / Cybertraps",
        "Social Media & Brand Monitoring"
      ],
    },
    Respond: {
      "Response Planning": [
        "Incident Management",
        "Crisis Management"
      ],
      "Communications": [
        "Crisis Communication"
      ],
      "Analysis": [
        "Fraud Investigation",
        "Forensics"
      ],
      "Mitigation": [
        "Cyber Security Insurance",
        "DDoS Protection",
        "Data Recovery",
        "Incident Response Services",
        "Takedown Services"
      ],
      "Improvements": [
        "Containment Support"
      ]
    },
    Recover: {
      "Recovery Planning": [
        "System Recovery",
        "Business Continuity / Recovery Planning"
      ],
      "Improvements": [
        "Post Incident Reviews & Consulting"
      ],
      "Communications": [
        "Communications Coaching & Consulting"
      ]
    }
  }

  category_level_body: any = {
    cat_0: {level1: "Identify"}
  }

  returnCatBodyAsList () {
    return Object.values(this.category_level_body)
  }


  isSelected(service_key: any, cat: any, level: any) {

    return (cat == (Object(this.category_level_body)[service_key][level]))
  }

  returnCategoryObject (service_key: any, level: any) {

    if (level == "level1") {

      return Object(this.categories)
    }
    else if (level == "level2") {

      let level1_cat = Object(this.category_level_body)[service_key]['level1']

      return Object(this.categories)[level1_cat]
    }
    else if (level == "level3") {
      let level1_cat = Object(this.category_level_body)[service_key]['level1']
      let level2_cat = Object(this.category_level_body)[service_key]['level2']

      return Object(this.categories)[level1_cat][level2_cat]
    }
  }

  isHidden (service_key: any, level: any) {
    return !(level in Object(this.category_level_body)[service_key])
  }

  stringKey (service_key: any): string {

    return service_key
  }

  changeCatBodyLevelOne (service_key: any, value: any) {
    this.category_level_body[service_key]['level1'] = value
    this.authService.servicePickerOptions = this.category_level_body
  }

  addLevel (service_key: any, level: any) {
    if (level == 'level2') {
      this.category_level_body[service_key][level] = Object.keys(this.returnCategoryObject(service_key, level))[0]
    }
    else {
      this.category_level_body[service_key][level] = this.returnCategoryObject(service_key, level)[0]
    }
    this.authService.servicePickerOptions = this.category_level_body
  }

  changeHigherLevel (service_key: any, level: any) {
    let current_service = this.category_level_body[service_key]

    if (level == "level2" && "level3" in current_service) {
      this.addLevel(service_key, level)
      this.addLevel(service_key, "level3")
    }
    else if (level in current_service) {
      this.addLevel(service_key, level)
    }
    this.authService.servicePickerOptions = this.category_level_body
  }

  incrementServiceKey (service_key: any) {
    var cat_array = service_key.split("_")
    var service_number: number = +cat_array[1] + 1
    var new_service_key = cat_array[0] + "_" + service_number

    return new_service_key
  }

  selected_services: any = []

  addService (service_key: any) {

    if (this.category_level_body[service_key] != undefined) {
      let level3_service: any = this.category_level_body[service_key]["level3"]

      if (level3_service && this.checkUniqueness()) {

        //this.selected_services.push(level3_service)

        var new_service_key = this.incrementServiceKey(service_key)

        this.category_level_body[new_service_key] = {"level1": "Identify"}
      }
      else {
        window.alert(this.translate.instant("notifications.Please select an option for all three levels and ensure level 3 is unique before adding new levels."))
      }
    }
    else {
      this.category_level_body["cat_0"] = {"level1": "Identify"}
    }
    this.authService.servicePickerOptions = this.category_level_body
  }

  checkIsOptionAvailable (cat: any) {
    return this.selected_services.includes(cat)
  }


  isHigherServiceAvailable(service_key: any) {
    let keys = Object.keys(this.category_level_body)

    return !(service_key == keys.at(-1))
  }

  deleteService (service_key: any) {
    //this.selected_services = this.selected_services.filter( (e: any) => e !== this.category_level_body[service_key]["level3"])
    delete this.category_level_body[service_key]
    this.authService.servicePickerOptions = this.category_level_body
  }

  isServiceEmpty () {
    return !(Object.keys(this.category_level_body).length === 0)
  }

  checkUniqueness () {
    let values: any = Object.values(this.category_level_body)

    const level3_values = values.map((o: any) => o.level3)
    const unique_values = new Set(level3_values)

    return (values.length == unique_values.size)
  }
  
}

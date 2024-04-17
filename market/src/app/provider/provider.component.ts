import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-provider',
  templateUrl: './provider.component.html',
  styleUrls: ['./provider.component.css']
})
export class ProviderComponent implements OnInit {

  constructor(public authService: AuthService, private router: Router, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.provider_id = this.router.url.split("/").at(-1)

    this.authService.getUser(this.provider_id).then((doc: any) => {
      if (doc.exists) {
        var user = doc.data()

        this.company_name = user.company_name
        this.contact_details = `Phone Number: ${user.phone_number}, Email: ${user.email}`
        this.location = user.address
        this.website = user.company_url
        this.description = user.long_description
        this.image_url = user.image_file
        this.categories = Object.values(user.categories)
        this.certifications = user.certifications
      }
    })
  }

  provider_id: any;
  message = ""
  subject = ""

  company_name = "company_name"
  contact_details = "contact details"
  location = {
    street_name: "streename",
    street_number: "streenum",
    building_name: "building",
    city_name: "city_name",
    country_name: "country_name",
    post_code: "post_code"
  }

  services_provided = [
    "service1",
    "service2"
  ]

  certifications = {
    cert: "download"
  }

  website = "webURL"

  image_url = ""

  description = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum"

  categories: any = [
    {level1: "Identify",
    level2: "Asset Management",
    level3: "Software & Security Lifecycle Management"}
  ]

  sendMessage () {
    let uid = JSON.parse(localStorage.getItem("user")!)["uid"]
    let sender = JSON.parse(localStorage.getItem("userData")!)["displayName"]
    this.authService.initialiseChat(uid, this.provider_id, this.message, sender, this.subject)
  }
}

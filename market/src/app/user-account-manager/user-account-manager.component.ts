import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-user-account-manager',
  templateUrl: './user-account-manager.component.html',
  styleUrls: ['./user-account-manager.component.css']
})
export class UserAccountManagerComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
    let user = JSON.parse(localStorage.getItem("userData")!)
    if (user) {
      this.fname = user.first_name
      this.lname = user.last_name
      this.cname = user.company_name
      this.location = user.address
      this.phone_number = user.phone_number
      this.email = user.email
    }
  }

  fname = "first_name"
  lname = "last_name"
  cname = "company_name"

  location = {
    street_name: "",
    building_name: "",
    street_number: "",
    city_name: "",
    country_name: "",
    post_code: ""
  }

  phone_number = "phone_num"
  email = "email"
  email_password = ""

}

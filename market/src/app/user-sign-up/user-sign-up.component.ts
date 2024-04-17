import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-user-sign-up',
  templateUrl: './user-sign-up.component.html',
  styleUrls: ['./user-sign-up.component.css']
})
export class UserSignUpComponent implements OnInit {

  constructor(public authService: AuthService, private translate: TranslateService) { }

  ngOnInit(): void {
  }

  fname = ""
  lname = ""
  cname = ""

  location = {
    street_name: "",
    building_name: "",
    street_number: "",
    city_name: "",
    country_name: "",
    post_code: ""
  }

  phone_number = ""
  email = ""

  password = ""
  password_retype = ""

  signUp () {
    if (this.authService.confirmPasswordRetype(this.password, this.password_retype)) {
      window.alert(this.translate.instant("notifications.Passwords did not match!"))
    }
    else{
      let stringArray = [this.fname, this.lname, this.cname, this.phone_number, this.email, this.password, this.password_retype]
      let checkArray = stringArray.concat(Object.values(this.location))

      if (checkArray.includes("")) {
        window.alert(this.translate.instant("notifications.Please fill out all fields"))
      }
      else{
        this.authService.signUpUser(this.email, this.password, this.fname, this.lname, this.cname, this.location, this.phone_number, false)
      }
    }
  }
}

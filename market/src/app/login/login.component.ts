import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  constructor(private router: Router, public authService: AuthService) { }

  ngOnInit(): void {
  }

  email = ""
  password = ""

  getSignupForm () {
    let url = this.router.url
    
    if (url == "/supplierlogin") {
      return "/suppliersignup"
    }
    else {
      return "/usersignup"
    }
  }

}

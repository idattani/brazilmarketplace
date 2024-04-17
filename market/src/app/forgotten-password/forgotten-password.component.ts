import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-forgotten-password',
  templateUrl: './forgotten-password.component.html',
  styleUrls: ['./forgotten-password.component.css']
})
export class ForgottenPasswordComponent implements OnInit {

  constructor(public authService: AuthService) { }

  ngOnInit(): void {
  }

  email = ""

  sendRecoveryEmail () {
    if (this.email) {
      this.authService.ForgotPassword(this.email)
    }
    else {
      window.alert("Please enter your email address")
    }
  }
}

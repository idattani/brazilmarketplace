import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-email-verification',
  templateUrl: './email-verification.component.html',
  styleUrls: ['./email-verification.component.css']
})
export class EmailVerificationComponent implements OnInit {

  constructor(private translate: TranslateService, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.router.url == "/verified-email") {
      setTimeout(() => {
        localStorage.setItem("user", "null")
        localStorage.setItem("userData", "null")
        this.router.navigate([""])
      }, 5000)
    }
  }

  getTitle() {
    if (JSON.parse(localStorage.getItem('user')!).emailVerified) {
      return this.translate.instant("verify.verified")
    }
    else {
      return this.translate.instant("verify.verify")
    }
  }

  getDescription() {
    if (JSON.parse(localStorage.getItem('user')!).emailVerified) {
      return this.translate.instant("verify.continue")
    }
    else {
      return this.translate.instant("verify.inbox")
    }
  }

}

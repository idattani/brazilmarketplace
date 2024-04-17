import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../shared/services/auth.service';

@Component({
  selector: 'app-navigation-bar',
  templateUrl: './navigation-bar.component.html',
  styleUrls: ['./navigation-bar.component.css']
})
export class NavigationBarComponent implements OnInit {

  constructor(private router: Router, public authService: AuthService, private translate: TranslateService) { }

  ngOnInit(): void {
  }

  disableLink () {
    let url = this.router.url.split("/")

    if (url[url.length - 1] == "tier1") {
      return "disable-link"
    }
    else {
      return "enable-link"
    }
  }

  getAccountPage () {
    let userData = JSON.parse(localStorage.getItem("userData")!)

    if (userData.isSupplier) {
      return `/account/supplier/${userData.uid}`
    }
    else {
      return `/account/user/${userData.uid}`
    }
  }

  highlightChat () {
    const unread_messages = JSON.parse(localStorage.getItem("userData")!).unread_messages

    return (0 < unread_messages)
  }

  getPortOffset () {
    const lang = this.translate.currentLang
    return lang == "pt"
  }

  search_term = ""
}

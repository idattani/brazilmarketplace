import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(public authService: AuthService, public router: Router) {}

  canActivate(): boolean {
    if (!JSON.parse(localStorage.getItem('user')!).emailVerified) {
      this.router.navigate(['verify-email-address'])
      this.authService.sendVerificationEmail()
      return false
    }
    else if (!localStorage.getItem('user')) {
      this.router.navigate(['userlogin'])
      return false
    }
    return true
  }
}


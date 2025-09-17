// header.component.ts
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent {
  showLogoutConfirm = false;

  constructor(private auth: AuthService, private router: Router) {}

  confirmLogout() {
    this.showLogoutConfirm = true;
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  executeLogout() {
    this.logout();
    this.cancelLogout();
  }

  cancelLogout() {
    this.showLogoutConfirm = false;
  }
}
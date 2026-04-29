import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-panel">
        <div class="logo-wrap" aria-hidden="true">
          <a routerLink="/">
            <img src="/assets/images/Picture1.png" alt="Logo" class="logo-img" />
          </a>
        </div>

        <h1 class="uni-name">Trường Đại học Mỏ Địa Chất</h1>
        <p class="system-name">Hệ thống Quản lý Đồ án Tốt nghiệp</p>

        <form (ngSubmit)="onLogin()">
          <input
            type="text"
            class="form-control-login"
            id="email"
            [(ngModel)]="email"
            name="email"
            autocomplete="username"
            placeholder="Tên đăng nhập"
            required
          />

          <input
            type="password"
            class="form-control-login"
            id="password"
            [(ngModel)]="password"
            name="password"
            autocomplete="current-password"
            placeholder="Mật khẩu"
            required
          />

          <div *ngIf="errorMessage" class="alert-error">{{ errorMessage }}</div>

          <button type="submit" class="btn-login" [disabled]="isLoading">
            <span *ngIf="isLoading">Đang đăng nhập...</span>
            <span *ngIf="!isLoading">Đăng nhập</span>
          </button>
        </form>

        <p class="copyright">Copyright 2026 © Đại học Mỏ - Địa chất</p>
      </div>
    </div>
  `,
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }
  }

  onLogin(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.email, this.password).subscribe({
      next: (response) => {
        if (response.success) {
          this.authService.saveToken(response.data.token);
          this.authService.saveUser({
            id: response.data.userId,
            email: response.data.email,
            role: response.data.role
          });
          this.authService.getCurrentUserFromApi().subscribe({
            next: (userRes) => {
              if (userRes.success) {
                this.authService.saveUser(userRes.data);
              }
              this.redirectBasedOnRole();
            },
            error: () => this.redirectBasedOnRole()
          });
        } else {
          this.errorMessage = response.message;
          this.isLoading = false;
        }
      },
      error: (error) => {
        this.errorMessage = error.error?.message || 'Tên đăng nhập hoặc mật khẩu không đúng';
        this.isLoading = false;
      }
    });
  }

  private redirectBasedOnRole(): void {
    const role = this.authService.getUserRole();
    switch (role) {
      case 'ADMIN':
        this.router.navigate(['/admin']);
        break;
      case 'LANH_DAO_BO_MON':
        this.router.navigate(['/bo-mon/ld-dashboard']);
        break;
      case 'GIANG_VIEN':
        this.router.navigate(['/giang-vien']);
        break;
      case 'SINH_VIEN':
        this.router.navigate(['/sinh-vien']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}

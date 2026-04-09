import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="d-flex">
      <!-- Sidebar -->
      <nav class="sidebar p-3" style="width: 250px; min-height: 100vh;">
        <div class="mb-4 text-center border-bottom pb-3">
          <h5 class="text-white">QUẢN LÝ ĐỒ ÁN</h5>
          <small class="text-white-50">Khoa CNTT</small>
        </div>
        
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/dashboard" routerLinkActive="active">
              <i class="bi bi-speedometer2 me-2"></i>Dashboard
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/dot-dang-ky" routerLinkActive="active">
              <i class="bi bi-calendar-event me-2"></i>Đợt đăng ký
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/de-tai" routerLinkActive="active">
              <i class="bi bi-file-earmark-text me-2"></i>Đề tài đăng ký
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/bo-mon" routerLinkActive="active">
              <i class="bi bi-building me-2"></i>Bộ môn
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/giang-vien" routerLinkActive="active">
              <i class="bi bi-person-badge me-2"></i>Giảng viên
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/sinh-vien" routerLinkActive="active">
              <i class="bi bi-mortarboard me-2"></i>Sinh viên
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/admin/thong-ke" routerLinkActive="active">
              <i class="bi bi-bar-chart me-2"></i>Thống kê
            </a>
          </li>
        </ul>

        <div class="mt-auto pt-3 border-top">
          <div class="d-flex align-items-center mb-3">
            <div class="bg-white rounded-circle p-2 me-2">
              <i class="bi bi-person text-primary"></i>
            </div>
            <div>
              <small class="text-white d-block">{{ currentUser?.hoTen || 'Admin' }}</small>
              <small class="text-white-50">Quản trị viên</small>
            </div>
          </div>
          <button class="btn btn-outline-light w-100" (click)="logout()">
            <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
          </button>
        </div>
      </nav>

      <!-- Main Content -->
      <div class="flex-grow-1 p-4" style="background-color: #f5f5f5;">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
})
export class AdminLayoutComponent {
  currentUser: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

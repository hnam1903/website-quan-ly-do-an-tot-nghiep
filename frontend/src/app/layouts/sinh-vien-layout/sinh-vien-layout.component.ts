import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sinh-vien-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Sidebar cố định bên trái -->
    <nav class="sidebar p-3">
      <!-- Logo -->
      <div class="sidebar-logo mb-4 text-center border-bottom pb-3">
        <div class="logo-icon mb-2">
          <img src="assets/images/Picture1.png" alt="Logo" class="logo-img">
        </div>
        <h5 class="logo-text">QLDATN 4.0</h5>
      </div>
      
      <ul class="nav flex-column">
        <li class="nav-item">
          <a class="nav-link" routerLink="/sinh-vien/dashboard" routerLinkActive="active">
            <i class="bi bi-speedometer2 me-2"></i>Dashboard
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/sinh-vien/de-tai" routerLinkActive="active">
            <i class="bi bi-file-earmark-plus me-2"></i>Đăng ký đề tài
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/sinh-vien/lich-bao-ve" routerLinkActive="active">
            <i class="bi bi-calendar-check me-2"></i>Lịch bảo vệ
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/sinh-vien/nop-bao-cao" routerLinkActive="active">
            <i class="bi bi-upload me-2"></i>Nộp báo cáo
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/sinh-vien/ket-qua" routerLinkActive="active">
            <i class="bi bi-graph-up me-2"></i>Kết quả
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/sinh-vien/bao-cao-tien-do" routerLinkActive="active">
            <i class="bi bi-clock-history me-2"></i>Báo cáo tiến độ
          </a>
        </li>
      </ul>
    </nav>

    <!-- Nội dung chính bên phải -->
    <div class="main-wrapper">
      <!-- Header -->
      <header class="header">
        <div class="header-logo">
          <i class="bi bi-mortarboard-fill me-2"></i>
          <span>Quản Lý Đồ Án</span>
        </div>
        <div class="header-profile dropdown">
          <button class="btn-profile" data-bs-toggle="dropdown">
            <i class="bi bi-person-circle"></i>
            <span>{{ currentUser?.hoTen }}</span>
            <i class="bi bi-chevron-down ms-1"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li>
              <button class="dropdown-item" (click)="logout()">
                <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
              </button>
            </li>
          </ul>
        </div>
      </header>

      <!-- Content -->
      <div class="content p-4">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      min-height: 100vh;
    }
    .sidebar {
      width: 250px;
      min-height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
    }
    .main-wrapper {
      margin-left: 250px;
      flex: 1;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      background: white;
      border-bottom: 1px solid #e0e0e0;
      height: 56px;
      position: sticky;
      top: 0;
      z-index: 99;
    }
    .header-logo {
      display: flex;
      align-items: center;
      font-weight: 600;
      font-size: 1.1rem;
      color: #333;
    }
    .header-profile .btn-profile {
      display: flex;
      align-items: center;
      gap: 8px;
      background: none;
      border: none;
      padding: 8px 12px;
      border-radius: 8px;
      cursor: pointer;
      color: #333;
    }
    .header-profile .btn-profile:hover {
      background: #f5f5f5;
    }
    .dropdown-menu {
      border: 1px solid #e0e0e0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      cursor: pointer;
    }
    .dropdown-item:hover {
      background: #f5f5f5;
    }
    .content {
      background-color: #f5f5f5;
      min-height: calc(100vh - 56px);
    }
  `]
})
export class SinhVienLayoutComponent {
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

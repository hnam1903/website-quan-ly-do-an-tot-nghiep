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
    <div class="d-flex">
      <nav class="sidebar p-3" style="width: 250px; min-height: 100vh;">
        <div class="mb-4 text-center border-bottom pb-3">
          <h5 class="text-white">SINH VIÊN</h5>
          <small class="text-white-50">{{ currentUser?.tenBoMon }}</small>
        </div>
        
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" routerLink="/sinh-vien/de-tai" routerLinkActive="active">
              <i class="bi bi-file-earmark-plus me-2"></i>Đăng ký đề tài
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
        </ul>

        <div class="mt-auto pt-3 border-top">
          <div class="d-flex align-items-center mb-3">
            <div class="bg-white rounded-circle p-2 me-2">
              <i class="bi bi-person text-primary"></i>
            </div>
            <div>
              <small class="text-white d-block">{{ currentUser?.hoTen }}</small>
              <small class="text-white-50">{{ currentUser?.maSinhVien }}</small>
            </div>
          </div>
          <button class="btn btn-outline-light w-100" (click)="logout()">
            <i class="bi bi-box-arrow-right me-2"></i>Đăng xuất
          </button>
        </div>
      </nav>

      <div class="flex-grow-1 p-4" style="background-color: #f5f5f5;">
        <router-outlet></router-outlet>
      </div>
    </div>
  `
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

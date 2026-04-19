import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-bo-mon-layout',
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
      
      <p class="text-black small px-3 mb-2">CHỨC NĂNG LÃNH ĐẠO</p>
      <ul class="nav flex-column">
        <li class="nav-item">
          <a class="nav-link d-flex justify-content-between align-items-center"
             (click)="quanLyDeTaiOpen = !quanLyDeTaiOpen"
             [class.active]="quanLyDeTaiActive">
            <span><i class="bi bi-file-earmark-text me-2"></i>Quản lý đề tài</span>
            <i class="bi" [ngClass]="quanLyDeTaiOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </a>
          <ul class="nav flex-column ms-3" *ngIf="quanLyDeTaiOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/duyet-de-tai" routerLinkActive="active">
                <i class="bi bi-check-circle me-2"></i>Duyệt đề tài
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/de-tai" routerLinkActive="active">
                <i class="bi bi-list-ul me-2"></i>Danh sách đề tài
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/bo-mon/sinh-vien" routerLinkActive="active">
            <i class="bi bi-people me-2"></i>Quản lý SV
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/bo-mon/giang-vien" routerLinkActive="active">
            <i class="bi bi-person-badge me-2"></i>Quản lý GV
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex justify-content-between align-items-center"
             (click)="quanLyGvhdOpen = !quanLyGvhdOpen"
             [class.active]="quanLyGvhdActive">
            <span><i class="bi bi-people me-2"></i>Quản lý GVHD</span>
            <i class="bi" [ngClass]="quanLyGvhdOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </a>
          <ul class="nav flex-column ms-3" *ngIf="quanLyGvhdOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/phan-cong" routerLinkActive="active">
                <i class="bi bi-plus-circle me-2"></i>Phân công GVHD
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/danh-sach-gvhd" routerLinkActive="active">
                <i class="bi bi-list-ul me-2"></i>Danh sách GVHD
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex justify-content-between align-items-center"
             (click)="quanLyGvpbOpen = !quanLyGvpbOpen"
             [class.active]="quanLyGvpbActive">
            <span><i class="bi bi-people me-2"></i>Quản lý GVPB</span>
            <i class="bi" [ngClass]="quanLyGvpbOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </a>
          <ul class="nav flex-column ms-3" *ngIf="quanLyGvpbOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/phan-cong-phan-bien" routerLinkActive="active">
                <i class="bi bi-plus-circle me-2"></i>Phân công GVPB
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/danh-sach-gvpb" routerLinkActive="active">
                <i class="bi bi-list-ul me-2"></i>Danh sách GVPB
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex justify-content-between align-items-center"
             (click)="quanLyHoiDongOpen = !quanLyHoiDongOpen"
             [class.active]="quanLyHoiDongActive">
            <span><i class="bi bi-collection me-2"></i>Quản lý HĐBV</span>
            <i class="bi" [ngClass]="quanLyHoiDongOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </a>
          <ul class="nav flex-column ms-3" *ngIf="quanLyHoiDongOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/hoi-dong/thanh-lap" routerLinkActive="active">
                <i class="bi bi-plus-circle me-2"></i>Thành lập HĐBV
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/hoi-dong/danh-sach" routerLinkActive="active">
                <i class="bi bi-list-ul me-2"></i>Danh sách HĐBV
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/hoi-dong/cham-diem" routerLinkActive="active">
                <i class="bi bi-pencil-square me-2"></i>Chấm điểm bảo vệ
              </a>
            </li>
          </ul>
        </li>
      </ul>

      <div class="border-top my-3"></div>
      <p class="text-black small px-3 mb-2">CHỨC NĂNG GIẢNG VIÊN</p>
      <ul class="nav flex-column">
        <li class="nav-item">
          <a class="nav-link d-flex justify-content-between align-items-center"
             (click)="huongDanOpen = !huongDanOpen"
             [class.active]="huongDanActive">
            <span><i class="bi bi-person-check me-2"></i>Hướng dẫn</span>
            <i class="bi" [ngClass]="huongDanOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </a>
          <ul class="nav flex-column ms-3" *ngIf="huongDanOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/gv-huong-dan/duyet" routerLinkActive="active">
                <i class="bi bi-check-circle me-2"></i>Duyệt hướng dẫn
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/gv-huong-dan/danh-sach" routerLinkActive="active">
                <i class="bi bi-list-ul me-2"></i>Danh sách hướng dẫn
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/gv-huong-dan/cham-diem" routerLinkActive="active">
                <i class="bi bi-pencil-square me-2"></i>Chấm điểm
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex justify-content-between align-items-center"
             (click)="phanBienOpen = !phanBienOpen"
             [class.active]="phanBienActive">
            <span><i class="bi bi-clipboard-check me-2"></i>Phản biện</span>
            <i class="bi" [ngClass]="phanBienOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </a>
          <ul class="nav flex-column ms-3" *ngIf="phanBienOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/gv-phan-bien/danh-sach" routerLinkActive="active">
                <i class="bi bi-list-ul me-2"></i>Danh sách SV phản biện
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/gv-phan-bien/cham-diem" routerLinkActive="active">
                <i class="bi bi-pencil-square me-2"></i>Chấm điểm phản biện
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex justify-content-between align-items-center"
             (click)="hoiDongOpen = !hoiDongOpen"
             [class.active]="hoiDongActive">
            <span><i class="bi bi-collection me-2"></i>Hội đồng bảo vệ</span>
            <i class="bi" [ngClass]="hoiDongOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </a>
          <ul class="nav flex-column ms-3" *ngIf="hoiDongOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/gv-hoi-dong/danh-sach" routerLinkActive="active">
                <i class="bi bi-list-ul me-2"></i>Danh sách bảo vệ
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/bo-mon/bao-cao" routerLinkActive="active">
            <i class="bi bi-file-earmark-text me-2"></i>Báo cáo SV
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link d-flex justify-content-between align-items-center"
             (click)="baoCaoTienDoOpen = !baoCaoTienDoOpen"
             [class.active]="baoCaoTienDoActive">
            <span><i class="bi bi-clock-history me-2"></i>Báo cáo tiến độ</span>
            <i class="bi" [ngClass]="baoCaoTienDoOpen ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
          </a>
          <ul class="nav flex-column ms-3" *ngIf="baoCaoTienDoOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/bao-cao-tien-do/tao-dot" routerLinkActive="active">
                <i class="bi bi-plus-circle me-2"></i>Tạo đợt báo cáo
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/bo-mon/bao-cao-tien-do/danh-sach" routerLinkActive="active">
                <i class="bi bi-list-ul me-2"></i>Danh sách báo cáo
              </a>
            </li>
          </ul>
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
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
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
export class BoMonLayoutComponent implements OnInit {
  currentUser: any;
  huongDanOpen = false;
  huongDanActive = false;
  phanBienOpen = false;
  phanBienActive = false;
  hoiDongOpen = false;
  hoiDongActive = false;
  quanLyGvhdOpen = false;
  quanLyGvhdActive = false;
  quanLyGvpbOpen = false;
  quanLyGvpbActive = false;
  quanLyHoiDongOpen = false;
  quanLyHoiDongActive = false;
  quanLyDeTaiOpen = false;
  quanLyDeTaiActive = false;
  baoCaoTienDoOpen = false;
  baoCaoTienDoActive = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.checkRoutes();
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => this.checkRoutes());
  }

  checkRoutes(): void {
    const url = this.router.url;
    this.quanLyDeTaiActive = url.includes('/duyet-de-tai') || url.includes('/de-tai');
    if (this.quanLyDeTaiActive) this.quanLyDeTaiOpen = true;
    this.huongDanActive = url.includes('/gv-huong-dan/');
    if (this.huongDanActive) this.huongDanOpen = true;
    this.phanBienActive = url.includes('/gv-phan-bien/');
    if (this.phanBienActive) this.phanBienOpen = true;
    this.hoiDongActive = url.includes('/gv-hoi-dong/');
    if (this.hoiDongActive) this.hoiDongOpen = true;
    this.quanLyGvhdActive = url.includes('/danh-sach-gvhd') || url === '/bo-mon/phan-cong' || url === '/bo-mon/phan-cong/';
    if (this.quanLyGvhdActive) this.quanLyGvhdOpen = true;
    this.quanLyGvpbActive = url.includes('/danh-sach-gvpb');
    if (this.quanLyGvpbActive) this.quanLyGvpbOpen = true;
    this.quanLyHoiDongActive = url.includes('/hoi-dong/');
    if (this.quanLyHoiDongActive) this.quanLyHoiDongOpen = true;
    this.baoCaoTienDoActive = url.includes('/bao-cao-tien-do/');
    if (this.baoCaoTienDoActive) this.baoCaoTienDoOpen = true;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

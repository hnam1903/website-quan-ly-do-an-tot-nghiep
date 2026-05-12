import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-giang-vien-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar-overlay" [class.open]="sidebarOpen" (click)="closeSidebar()"></div>

    <nav class="sidebar p-3" [class.open]="sidebarOpen">
      <div class="sidebar-logo mb-4 text-center border-bottom pb-3">
        <div class="logo-icon mb-2">
          <img src="assets/images/Picture1.png" alt="Logo" class="logo-img">
        </div>
        <h5 class="logo-text">QLDATN 4.0</h5>
      </div>

      <ul class="nav flex-column">
        <li class="nav-item">
          <a class="nav-link" routerLink="/" target="_blank" (click)="closeSidebar()">
            <span class="material-symbols-outlined">home</span>Trang chủ
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/giang-vien/dashboard" routerLinkActive="active" (click)="closeSidebar()">
            <span class="material-symbols-outlined">dashboard</span>Dashboard
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="huongDanActive" (click)="toggleNav('huongDanOpen')">
            <span class="material-symbols-outlined">supervisor_account</span>Hướng dẫn
            <span class="material-symbols-outlined ms-auto chevron" [class.chevron-open]="huongDanOpen">chevron_right</span>
          </a>
          <ul class="nav flex-column sub-menu" *ngIf="huongDanOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/giang-vien/huong-dan/duyet" routerLinkActive="active" (click)="closeSidebar()">
                <span class="material-symbols-outlined">fact_check</span>Duyệt hướng dẫn
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/giang-vien/huong-dan/danh-sach" routerLinkActive="active" (click)="closeSidebar()">
                <span class="material-symbols-outlined">list</span>Danh sách hướng dẫn
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/giang-vien/huong-dan/cham-diem" routerLinkActive="active" (click)="closeSidebar()">
                <span class="material-symbols-outlined">edit</span>Chấm điểm
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="phanBienActive" (click)="toggleNav('phanBienOpen')">
            <span class="material-symbols-outlined">rule</span>Phản biện
            <span class="material-symbols-outlined ms-auto chevron" [class.chevron-open]="phanBienOpen">chevron_right</span>
          </a>
          <ul class="nav flex-column sub-menu" *ngIf="phanBienOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/giang-vien/phan-bien/danh-sach" routerLinkActive="active" (click)="closeSidebar()">
                <span class="material-symbols-outlined">list</span>Danh sách SV phản biện
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/giang-vien/phan-bien/cham-diem" routerLinkActive="active" (click)="closeSidebar()">
                <span class="material-symbols-outlined">edit</span>Chấm điểm phản biện
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="hoiDongActive" (click)="toggleNav('hoiDongOpen')">
            <span class="material-symbols-outlined">group_work</span>Hội đồng bảo vệ
            <span class="material-symbols-outlined ms-auto chevron" [class.chevron-open]="hoiDongOpen">chevron_right</span>
          </a>
          <ul class="nav flex-column sub-menu" *ngIf="hoiDongOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/giang-vien/hoi-dong/danh-sach" routerLinkActive="active" (click)="closeSidebar()">
                <span class="material-symbols-outlined">list</span>Danh sách bảo vệ
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/giang-vien/bao-cao" routerLinkActive="active" (click)="closeSidebar()">
            <span class="material-symbols-outlined">description</span>Báo cáo SV
          </a>
        </li>
        <li class="nav-item">
          <a class="nav-link" [class.active]="baoCaoTienDoActive" (click)="toggleNav('baoCaoTienDoOpen')">
            <span class="material-symbols-outlined">schedule</span>Báo cáo tiến độ
            <span class="material-symbols-outlined ms-auto chevron" [class.chevron-open]="baoCaoTienDoOpen">chevron_right</span>
          </a>
          <ul class="nav flex-column sub-menu" *ngIf="baoCaoTienDoOpen">
            <li class="nav-item">
              <a class="nav-link" routerLink="/giang-vien/bao-cao-tien-do/tao-dot" routerLinkActive="active" (click)="closeSidebar()">
                <span class="material-symbols-outlined">add_circle</span>Tạo đợt báo cáo
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/giang-vien/bao-cao-tien-do/danh-sach" routerLinkActive="active" (click)="closeSidebar()">
                <span class="material-symbols-outlined">list</span>Danh sách báo cáo
              </a>
            </li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link" routerLink="/giang-vien/theo-doi-tien-trinh" routerLinkActive="active" (click)="closeSidebar()">
            <span class="material-symbols-outlined">timeline</span>Theo dõi tiến trình
          </a>
        </li>
      </ul>
    </nav>

    <div class="main-wrapper">
      <header class="header">
        <div class="header-left">
          <button class="hamburger" (click)="toggleSidebar()">
            <i class="bi bi-list"></i>
          </button>
          <div class="header-logo">
            <i class="bi bi-mortarboard-fill"></i>
            <span>Quản Lý Đồ Án</span>
          </div>
        </div>
        <div class="header-right">
          <div class="header-profile dropdown">
            <button class="btn-profile" data-bs-toggle="dropdown">
              <i class="bi bi-person-circle"></i>
              <span>{{ currentUser?.hoTen }}</span>
              <i class="bi bi-chevron-down ms-1"></i>
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <button class="dropdown-item text-danger" (click)="logout()">
                  <i class="bi bi-box-arrow-right"></i>Đăng xuất
                </button>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div class="content">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styles: [`
    :host { display: flex; min-height: 100vh; }
    .sidebar {
      width: var(--sidebar-width);
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      z-index: 100;
      overflow-y: auto;
      overflow-x: hidden;
      display: flex;
      flex-direction: column;
      
      /* Custom Scrollbar */
      scrollbar-width: thin;
      scrollbar-color: #94a3b8 transparent;
    }
    .sidebar::-webkit-scrollbar {
      width: 6px;
    }
    .sidebar::-webkit-scrollbar-track {
      background: transparent;
    }
    .sidebar::-webkit-scrollbar-thumb {
      background: #94a3b8;
      border-radius: 3px;
    }
    .sidebar::-webkit-scrollbar-thumb:hover {
      background: #64748b;
    }
    .main-wrapper {
      margin-left: var(--sidebar-width);
      flex: 1;
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 24px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      height: var(--header-height);
      position: sticky;
      top: 0;
      z-index: 99;
      box-shadow: var(--shadow-xs);
    }
    .header-left { display: flex; align-items: center; gap: 12px; }
    .hamburger {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 8px;
      border-radius: var(--radius);
      color: var(--medium);
      font-size: 1.25rem;
      transition: all var(--transition);
    }
    .hamburger:hover { background: var(--secondary-light); color: var(--primary); }
    .header-logo {
      display: flex;
      align-items: center;
      font-weight: 700;
      font-size: 1rem;
      color: var(--dark);
      gap: 8px;
    }
    .header-logo i { color: var(--primary); font-size: 1.25rem; }
    .header-right { display: flex; align-items: center; gap: 12px; }
    .header-profile .btn-profile {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--secondary-light);
      border: none;
      padding: 8px 14px;
      border-radius: var(--radius);
      cursor: pointer;
      color: var(--dark);
      font-family: var(--font-family);
      font-size: var(--font-size-sm);
      font-weight: 500;
      transition: all var(--transition);
    }
    .header-profile .btn-profile:hover { background: var(--primary-light); color: var(--primary); }
    .dropdown-menu {
      border: 1px solid var(--border-light);
      border-radius: var(--radius-lg);
      box-shadow: var(--shadow-lg);
      padding: 8px;
      min-width: 180px;
    }
    .dropdown-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 14px;
      border-radius: var(--radius);
      font-weight: 500;
      font-size: var(--font-size-sm);
      color: var(--dark);
      cursor: pointer;
      transition: all var(--transition-fast);
      background: none;
      border: none;
      width: 100%;
      text-align: left;
    }
    .dropdown-item:hover { background: var(--primary-light); color: var(--primary); }
    .dropdown-item.text-danger:hover { background: var(--danger-light); color: var(--danger); }
    .content {
      background-color: var(--light);
      min-height: calc(100vh - var(--header-height));
      padding: var(--space-5);
    }
    .sub-menu { padding-left: 36px; }
    .sub-menu .nav-link { padding: 8px 12px; font-size: var(--font-size-sm); }
    .sidebar-overlay {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.5);
      z-index: 99;
      backdrop-filter: blur(4px);
    }
    @media (max-width: 768px) {
      .hamburger { display: flex; }
      .sidebar { left: calc(-1 * var(--sidebar-width)); transition: left var(--transition-slow); z-index: 1000; }
      .sidebar.open { left: 0; }
      .sidebar-overlay.open { display: block; }
      .main-wrapper { margin-left: 0 !important; }
    }
  `]
})
export class GiangVienLayoutComponent implements OnInit {
  currentUser: any;
  huongDanOpen = false;
  huongDanActive = false;
  phanBienOpen = false;
  phanBienActive = false;
  hoiDongOpen = false;
  hoiDongActive = false;
  baoCaoTienDoOpen = false;
  baoCaoTienDoActive = false;
  sidebarOpen = false;

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
    this.huongDanActive = url.includes('/huong-dan/');
    if (this.huongDanActive) this.huongDanOpen = true;
    this.phanBienActive = url.includes('/phan-bien/');
    if (this.phanBienActive) this.phanBienOpen = true;
    this.hoiDongActive = url.includes('/hoi-dong/');
    if (this.hoiDongActive) this.hoiDongOpen = true;
    this.baoCaoTienDoActive = url.includes('/bao-cao-tien-do/');
    if (this.baoCaoTienDoActive) this.baoCaoTienDoOpen = true;
  }

  toggleNav(key: string): void {
    (this as any)[key] = !(this as any)[key];
  }

  toggleSidebar(): void { this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(): void { this.sidebarOpen = false; }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

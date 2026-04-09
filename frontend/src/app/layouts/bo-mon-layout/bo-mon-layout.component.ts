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
    <div class="d-flex">
      <nav class="sidebar p-3" style="width: 250px; min-height: 100vh;">
        <div class="mb-4 text-center border-bottom pb-3">
          <h5 class="text-white">LÃNH ĐẠO BỘ MÔN</h5>
          <small class="text-white-50">{{ currentUser?.tenBoMon }}</small>
        </div>
        
        <ul class="nav flex-column">
          <li class="nav-item">
            <a class="nav-link" routerLink="/bo-mon/duyet-de-tai" routerLinkActive="active">
              <i class="bi bi-check-circle me-2"></i>Duyệt đề tài
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/bo-mon/de-tai" routerLinkActive="active">
              <i class="bi bi-file-earmark-text me-2"></i>Quản lý đề tài
            </a>
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
            <a class="nav-link" routerLink="/bo-mon/phan-cong" routerLinkActive="active">
              <i class="bi bi-people me-2"></i>Phân công GVHD
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/bo-mon/phan-cong-phan-bien" routerLinkActive="active">
              <i class="bi bi-clipboard-check me-2"></i>Phân công GVPB
            </a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/bo-mon/hoi-dong" routerLinkActive="active">
              <i class="bi bi-collection me-2"></i>Hội đồng bảo vệ
            </a>
          </li>
        </ul>

        <div class="border-top my-3"></div>
        <p class="text-white-50 small px-3 mb-2">CHỨC NĂNG GIẢNG VIÊN</p>
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
              <li class="nav-item">
                <a class="nav-link" routerLink="/bo-mon/gv-hoi-dong/cham-diem" routerLinkActive="active">
                  <i class="bi bi-pencil-square me-2"></i>Chấm điểm
                </a>
              </li>
            </ul>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="/bo-mon/bao-cao" routerLinkActive="active">
              <i class="bi bi-file-earmark-text me-2"></i>Báo cáo SV
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
              <small class="text-white-50">Lãnh đạo Bộ môn</small>
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
export class BoMonLayoutComponent implements OnInit {
  currentUser: any;
  huongDanOpen = false;
  huongDanActive = false;
  phanBienOpen = false;
  phanBienActive = false;
  hoiDongOpen = false;
  hoiDongActive = false;

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
    this.huongDanActive = url.includes('/gv-huong-dan/');
    if (this.huongDanActive) this.huongDanOpen = true;
    this.phanBienActive = url.includes('/gv-phan-bien/');
    if (this.phanBienActive) this.phanBienOpen = true;
    this.hoiDongActive = url.includes('/gv-hoi-dong/');
    if (this.hoiDongActive) this.hoiDongOpen = true;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

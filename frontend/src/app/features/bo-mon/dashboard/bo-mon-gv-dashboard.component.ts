import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiResponse, PhanCongHuongDanResponse, DeTaiResponse, DotBaoCaoTienDoResponse, UserResponse, SinhVienHuongDanResponse } from '../../../core/models/models';

@Component({
  selector: 'app-bo-mon-gv-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h2 class="mb-1">
                <span class="material-symbols-outlined me-2">dashboard</span>
                Dashboard Giảng viên
              </h2>
              <p class="text-muted mb-0 small" *ngIf="userInfo">
                {{ userInfo.hoTen }} | Bộ môn: {{ userInfo.tenBoMon }}
              </p>
            </div>
            <button class="btn btn-outline-primary" (click)="refresh()" [disabled]="loading">
              <span class="material-symbols-outlined" [class.spin]="loading">sync</span> Làm mới
            </button>
          </div>
        </div>
      </div>

      <!-- Loading Spinner -->
      <div *ngIf="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>

      <!-- Content -->
      <div *ngIf="!loading">
        <!-- Row 1: Thống kê tổng quan -->
        <div class="row mb-4">
          <!-- SV chờ duyệt hướng dẫn -->
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card h-100 shadow-sm border-warning">
              <div class="card-body text-center">
                <span class="material-symbols-outlined text-warning mb-2" style="font-size: 2.5rem;">hourglass_empty</span>
                <h3 class="mb-1">{{ soSinhVienChoDuyet }}</h3>
                <p class="text-muted mb-0">Sinh viên chờ duyệt</p>
                <span *ngIf="soSinhVienChoDuyet > 0" class="badge bg-danger rounded-pill mt-2">{{ soSinhVienChoDuyet }}</span>
                <a *ngIf="soSinhVienChoDuyet > 0" routerLink="/bo-mon/gv-huong-dan/duyet" class="btn btn-sm btn-outline-warning mt-2">
                  Xem ngay <span class="material-symbols-outlined ms-1" style="font-size: 16px;">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>

          <!-- SV đang hướng dẫn -->
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card h-100 shadow-sm border-primary">
              <div class="card-body text-center">
                <span class="material-symbols-outlined text-primary mb-2" style="font-size: 2.5rem;">group</span>
                <h3 class="mb-1">{{ soSinhVienHuongDan }}</h3>
                <p class="text-muted mb-0">Sinh viên đang hướng dẫn</p>
                <a routerLink="/bo-mon/gv-huong-dan/danh-sach" class="btn btn-sm btn-outline-primary mt-2">
                  Xem danh sách <span class="material-symbols-outlined ms-1" style="font-size: 16px;">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>

          <!-- SV phản biện -->
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card h-100 shadow-sm border-success">
              <div class="card-body text-center">
                <span class="material-symbols-outlined text-success mb-2" style="font-size: 2.5rem;">task_alt</span>
                <h3 class="mb-1">{{ soSinhVienPhanBien }}</h3>
                <p class="text-muted mb-0">Đề tài phản biện</p>
                <span *ngIf="soDeTaiChuaChamDiemPB > 0" class="badge bg-warning text-dark rounded-pill mt-2">{{ soDeTaiChuaChamDiemPB }} chưa chấm</span>
                <a routerLink="/bo-mon/gv-phan-bien/danh-sach" class="btn btn-sm btn-outline-success mt-2">
                  Xem danh sách <span class="material-symbols-outlined ms-1" style="font-size: 16px;">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>

          <!-- Hội đồng bảo vệ -->
          <div class="col-lg-3 col-md-6 mb-4">
            <div class="card h-100 shadow-sm border-danger">
              <div class="card-body text-center">
                <span class="material-symbols-outlined text-danger mb-2" style="font-size: 2.5rem;">groups</span>
                <h3 class="mb-1">{{ soHoiDong }}</h3>
                <p class="text-muted mb-0">Hội đồng bảo vệ</p>
                <a routerLink="/bo-mon/gv-hoi-dong/danh-sach" class="btn btn-sm btn-outline-danger mt-2">
                  Lịch bảo vệ <span class="material-symbols-outlined ms-1" style="font-size: 16px;">arrow_forward</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 2: Báo cáo tiến độ -->
        <div class="row mb-4">
          <div class="col-12">
            <div class="card shadow-sm">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h5 class="card-title mb-0">
                    <span class="material-symbols-outlined me-2">calendar_month</span>Báo cáo tiến độ
                  </h5>
                  <div>
                    <a routerLink="/bo-mon/bao-cao-tien-do/tao-dot" class="btn btn-sm btn-outline-primary me-2">
                      <span class="material-symbols-outlined me-1">add_circle</span>Tạo đợt
                    </a>
                    <a routerLink="/bo-mon/bao-cao-tien-do/danh-sach" class="btn btn-sm btn-primary">
                      <span class="material-symbols-outlined me-1">checklist</span>Xem tất cả
                    </a>
                  </div>
                </div>

                <!-- Đợt báo cáo hiện tại -->
                <div *ngIf="dotBaoCaoHienTai; else chuaCoDotBaoCao" class="alert alert-success d-flex align-items-center mb-0" role="alert">
                  <span class="material-symbols-outlined me-2 fs-5">check_circle</span>
                  <div class="flex-grow-1">
                    <strong>Đợt hiện tại:</strong> {{ dotBaoCaoHienTai.tenDot }} 
                    <span class="mx-2">|</span>
                    <span class="material-symbols-outlined me-1" style="font-size: 16px;">event</span>{{ dotBaoCaoHienTai.ngayBatDau | date:'dd/MM' }} - {{ dotBaoCaoHienTai.ngayKetThuc | date:'dd/MM/yyyy' }}
                    <span class="mx-2">|</span>
                    <span class="material-symbols-outlined me-1" style="font-size: 16px;">groups</span>{{ dotBaoCaoHienTai.soLuongSinhVienNop || 0 }} SV nộp
                  </div>
                  <span class="badge" [class]="getDotTrangThaiClass(dotBaoCaoHienTai.trangThai)">
                    {{ getDotTrangThaiText(dotBaoCaoHienTai.trangThai) }}
                  </span>
                </div>
                <ng-template #chuaCoDotBaoCao>
                  <div class="text-center py-3 text-muted">
                    <span class="material-symbols-outlined me-2">event_busy</span>
                    Chưa có đợt báo cáo tiến độ nào
                  </div>
                </ng-template>
              </div>
            </div>
          </div>
        </div>

        <!-- Row 3: Điểm cần chấm -->
        <div class="row mb-4">
          <!-- Điểm HD -->
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="card-title mb-0">
                    <span class="material-symbols-outlined text-warning me-2">star</span>Điểm hướng dẫn
                  </h6>
                  <a routerLink="/bo-mon/gv-huong-dan/cham-diem" class="btn btn-sm btn-outline-warning">
                    Xem chi tiết <span class="material-symbols-outlined ms-1" style="font-size: 16px;">arrow_forward</span>
                  </a>
                </div>
                <div class="text-center py-3">
                  <span class="material-symbols-outlined text-success" style="font-size: 2rem;">check_circle</span>
                  <p class="text-success mt-2 mb-0">Đã chấm hết điểm hướng dẫn</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Điểm PB -->
          <div class="col-lg-6 mb-4">
            <div class="card shadow-sm h-100">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="card-title mb-0">
                    <span class="material-symbols-outlined text-success me-2">check_circle</span>Điểm phản biện
                  </h6>
                  <a routerLink="/bo-mon/gv-phan-bien/cham-diem" class="btn btn-sm btn-outline-success">
                    Xem chi tiết <span class="material-symbols-outlined ms-1" style="font-size: 16px;">arrow_forward</span>
                  </a>
                </div>
                <div class="text-center py-3">
                  <span class="material-symbols-outlined text-success" style="font-size: 2rem;">check_circle</span>
                  <p class="text-success mt-2 mb-0">Đã chấm hết điểm phản biện</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class BoMonGvDashboardComponent implements OnInit {

  userInfo: UserResponse | null = null;
  danhSachChoDuyet: PhanCongHuongDanResponse[] = [];
  danhSachHuongDan: SinhVienHuongDanResponse[] = [];
  danhSachPhanBien: DeTaiResponse[] = [];
  danhSachDotBaoCao: DotBaoCaoTienDoResponse[] = [];
  danhSachHoiDong: any[] = [];

  loading = true;
  error: string | null = null;

  constructor(
    private gvService: GiangVienService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getCurrentUser();
    this.loadAllData();
  }

  private loadAllData(): void {
    this.loading = true;
    this.error = null;

    this.gvService.getDeTaiChoDuyet().subscribe({
      next: (res: ApiResponse<PhanCongHuongDanResponse[]>) => {
        this.danhSachChoDuyet = res.data || [];
      },
      error: () => {
        this.danhSachChoDuyet = [];
      }
    });

    this.gvService.getSinhVienHuongDan().subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.danhSachHuongDan = res.data || [];
      },
      error: () => {
        this.danhSachHuongDan = [];
      }
    });

    this.gvService.getDeTaiPhanBien().subscribe({
      next: (res: ApiResponse<DeTaiResponse[]>) => {
        this.danhSachPhanBien = res.data || [];
      },
      error: () => {
        this.danhSachPhanBien = [];
      }
    });

    this.gvService.getDotBaoCaoTienDo().subscribe({
      next: (res: ApiResponse<DotBaoCaoTienDoResponse[]>) => {
        this.danhSachDotBaoCao = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.danhSachDotBaoCao = [];
        this.loading = false;
      }
    });

    this.gvService.getHoiDongBaoVe().subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.danhSachHoiDong = res.data || [];
      },
      error: () => {
        this.danhSachHoiDong = [];
      }
    });
  }

  get soSinhVienChoDuyet(): number {
    return this.danhSachChoDuyet.length;
  }

  get soSinhVienHuongDan(): number {
    return this.danhSachHuongDan.length;
  }

  get soSinhVienPhanBien(): number {
    return this.danhSachPhanBien.length;
  }

  get soHoiDong(): number {
    return this.danhSachHoiDong.length;
  }

  get soDeTaiChuaChamDiemHD(): number {
    return this.danhSachHuongDan.filter(sv => !sv.daChamDiem).length;
  }

  get soDeTaiChuaChamDiemPB(): number {
    return this.danhSachPhanBien.filter(dt => !dt.daChamDiemPB).length;
  }

  get dotBaoCaoHienTai(): DotBaoCaoTienDoResponse | null {
    return this.danhSachDotBaoCao.find(dot => dot.trangThai === 'MO') || null;
  }

  getDotTrangThaiClass(trangThai: string): string {
    const classMap: { [key: string]: string } = {
      'MO': 'bg-success',
      'DONG': 'bg-secondary',
      'DA_KET_THUC': 'bg-danger'
    };
    return classMap[trangThai] || 'bg-secondary';
  }

  getDotTrangThaiText(trangThai: string): string {
    const textMap: { [key: string]: string } = {
      'MO': 'Mở',
      'DONG': 'Đóng',
      'DA_KET_THUC': 'Đã kết thúc'
    };
    return textMap[trangThai] || trangThai;
  }

  refresh(): void {
    this.loadAllData();
  }
}

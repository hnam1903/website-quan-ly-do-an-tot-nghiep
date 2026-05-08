import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeTaiResponse, GiangVienResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-phan-cong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-primary-subtle">
          <span class="material-symbols-outlined text-primary">person_add</span>
        </div>
        <div>
          <h2>Phân công Giảng viên hướng dẫn</h2>
          <p class="mb-0">Gán giảng viên hướng dẫn cho sinh viên</p>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" [class.active]="activeTab === 'co-gvhd'" (click)="switchTab('co-gvhd')">
          <span class="material-symbols-outlined me-1 text-success">check_circle</span>
          Đã có GVHD ({{ svDaDuyet.length }})
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" [class.active]="activeTab === 'chua-co-gvhd'" (click)="switchTab('chua-co-gvhd')">
          <span class="material-symbols-outlined me-1 text-warning">pending</span>
          Chưa có GVHD ({{ svChuaCoGvhd.length }})
        </a>
      </li>
    </ul>

    <!-- Tab 1: Đã có GVHD -->
    <div *ngIf="activeTab === 'co-gvhd'" class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <span class="material-symbols-outlined me-2 text-success">check_circle</span>
          Đề tài GV đã đồng ý - Chờ xác nhận
        </h5>
        <small class="text-muted">Hiển thị tên GVHD dự kiến, lãnh đạo bộ môn xác nhận hoặc chọn GV khác</small>
      </div>
      <div class="card-body p-0">
        <div *ngIf="svDaDuyet.length === 0" class="alert alert-info m-4">
          <span class="material-symbols-outlined me-2">info</span>Không có đề tài nào cần xác nhận.
        </div>

        <div class="table-responsive" *ngIf="svDaDuyet.length > 0">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th style="width: 160px">GVHD dự kiến</th>
                <th style="width: 200px">Xác nhận GVHD</th>
                <th style="width: 120px" class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of svDaDuyet; let i = index" class="align-middle">
                <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong><br>
                  <small class="text-secondary"><code>{{ dt.maSinhVien }}</code></small>
                </td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 250px" [title]="dt.tenDeTai">{{ dt.tenDeTai }}</span>
                </td>
                <td>
                  <span class="badge bg-success" *ngIf="dt.hoTenGiangVienDuKien">
                    <span class="material-symbols-outlined me-1" style="font-size: 14px">person</span>
                    {{ dt.hoTenGiangVienDuKien }}
                  </span>
                  <span class="badge bg-secondary" *ngIf="!dt.hoTenGiangVienDuKien">Chưa có</span>
                </td>
                <td>
                  <select class="form-select form-select-sm" [(ngModel)]="selectedGvMap[dt.id]">
                    <option [value]="null">Chọn GVHD</option>
                    <option *ngFor="let gv of giangVienList" [value]="gv.id">
                      {{ gv.hoTen }} ({{ gv.hocVi }})
                    </option>
                  </select>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-success" (click)="phanCongHD(dt.id)">
                    <span class="material-symbols-outlined me-1">check</span> Xác nhận
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Tab 2: Chưa có GVHD -->
    <div *ngIf="activeTab === 'chua-co-gvhd'" class="card">
      <div class="card-header">
        <h5 class="mb-0">
          <span class="material-symbols-outlined me-2 text-warning">pending</span>
          Đề tài chưa có GVHD - Cần phân công
        </h5>
        <small class="text-muted">GVHD từ chối hoặc không có GVHD dự kiến</small>
      </div>
      <div class="card-body p-0">
        <div *ngIf="svChuaCoGvhd.length === 0" class="alert alert-info m-4">
          <span class="material-symbols-outlined me-2">info</span>Không có đề tài nào cần phân công GVHD.
        </div>

        <div class="table-responsive" *ngIf="svChuaCoGvhd.length > 0">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th style="width: 140px">Trạng thái</th>
                <th style="width: 200px">Chọn GVHD</th>
                <th style="width: 120px" class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of svChuaCoGvhd; let i = index" class="align-middle">
                <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong><br>
                  <small class="text-secondary"><code>{{ dt.maSinhVien }}</code></small>
                </td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 250px" [title]="dt.tenDeTai">{{ dt.tenDeTai }}</span>
                </td>
                <td>
                  <span [class]="getStatusClass(dt.trangThai)" class="badge">
                    {{ getStatusText(dt.trangThai) }}
                  </span>
                </td>
                <td>
                  <select class="form-select form-select-sm" [(ngModel)]="selectedGvMap[dt.id]">
                    <option [value]="null">Chọn GVHD</option>
                    <option *ngFor="let gv of giangVienList" [value]="gv.id">
                      {{ gv.hoTen }} ({{ gv.hocVi }})
                    </option>
                  </select>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-primary" (click)="phanCongHD(dt.id)">
                    <span class="material-symbols-outlined me-1">add</span> Phân công
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PhanCongComponent implements OnInit {
  activeTab: string = 'co-gvhd';
  svDaDuyet: DeTaiResponse[] = [];
  svChuaCoGvhd: DeTaiResponse[] = [];
  giangVienList: GiangVienResponse[] = [];
  selectedGvMap: any = {};

  constructor(
    private boMonService: BoMonService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  loadData(): void {
    const currentUser = this.authService.getCurrentUser();
    const boMonId = currentUser?.boMonId;

    // Tab 1: CHO_BO_MON_PHAN_CONG - GV đã đồng ý, chờ BoMon xác nhận
    this.boMonService.getDeTai('CHO_BO_MON_PHAN_CONG', undefined, boMonId).subscribe({
      next: (res) => {
        if (res.success) {
          this.svDaDuyet = res.data;
          // Đặt dropdown mặc định = GVHD dự kiến
          this.svDaDuyet.forEach(dt => {
            if (dt.giangVienDuKienId) {
              this.selectedGvMap[dt.id] = dt.giangVienDuKienId;
            }
          });
        }
      }
    });

    // Tab 2: CHO_GV_PHAN_CONG + GV_TU_CHOI - Chưa có GVHD
    this.svChuaCoGvhd = [];
    this.boMonService.getDeTai('CHO_GV_PHAN_CONG', undefined, boMonId).subscribe({
      next: (res) => {
        if (res.success) {
          this.svChuaCoGvhd = res.data;
        }
      }
    });

    this.boMonService.getDeTai('GV_TU_CHOI', undefined, boMonId).subscribe({
      next: (res) => {
        if (res.success) {
          // Lọc bỏ những đề tài đã có GVHD trong PhanCongHuongDan (trường hợp hiếm)
          const gvTuChoi = res.data.filter(dt => !dt.giangVienHuongDanId);
          this.svChuaCoGvhd = [...this.svChuaCoGvhd, ...gvTuChoi];
        }
      }
    });

    // Lấy danh sách giảng viên
    this.boMonService.getGiangVien(boMonId).subscribe({
      next: (res) => {
        if (res.success) this.giangVienList = res.data;
      }
    });
  }

  phanCongHD(deTaiId: number): void {
    const gvId = this.selectedGvMap[deTaiId];
    if (!gvId) {
      this.toastr.warning('Vui lòng chọn giảng viên');
      return;
    }
    this.boMonService.phanCongHuongDan(deTaiId, gvId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Phân công thành công!');
          this.loadData();
        }
      }
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      'CHO_GV_PHAN_CONG': 'badge bg-warning text-dark',
      'GV_TU_CHOI': 'badge bg-danger'
    };
    return map[status] || 'badge bg-secondary';
  }

  getStatusText(status: string): string {
    const map: any = {
      'CHO_GV_PHAN_CONG': 'Chờ phân công',
      'GV_TU_CHOI': 'GV từ chối'
    };
    return map[status] || status;
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DeTaiResponse, DotDangKyResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-de-tai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h2>Quản lý đề tài</h2>
        
      </div>
      <div class="d-flex gap-2">
        <select class="form-select" style="width: 220px;" [(ngModel)]="selectedDotId" (change)="loadDeTai()">
          <option [ngValue]="null">Tất cả đợt</option>
          <option *ngFor="let dot of dotList" [ngValue]="dot.id">{{ dot.tenDot }}</option>
        </select>
      </div>
    </div>

    <!-- Tabs -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link" [class.active]="activeTab === 'cho-gui'" (click)="switchTab('cho-gui')">
          <i class="bi bi-send me-1"></i>Chờ gửi Bộ môn
          <span class="badge bg-primary ms-1">{{ deTaiList.length }}</span>
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" [class.active]="activeTab === 'bi-tu-choi'" (click)="switchTab('bi-tu-choi')">
          <i class="bi bi-x-circle me-1"></i>Bị Bộ môn từ chối
          <span class="badge bg-danger ms-1">{{ biTuChoiList.length }}</span>
        </a>
      </li>
    </ul>

    <!-- Tab 1: Chờ gửi Bộ môn -->
    <div *ngIf="activeTab === 'cho-gui'">
      

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Danh sách đăng ký chờ gửi Bộ môn</span>
          <button *ngIf="selectedDeTais.length > 0"
                  class="btn btn-primary btn-sm"
                  (click)="guiLenBoMon()">
            <i class="bi bi-send me-1"></i>Gửi {{ selectedDeTais.length }} đăng ký lên Bộ môn
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th width="40">
                    <input type="checkbox" (change)="toggleSelectAll($event)" [checked]="isAllSelected()">
                  </th>
                  <th>STT</th>
                  <th>Sinh viên</th>
                  <th>Tên đề tài</th>
                  <th>Bộ môn</th>
                  <th class="text-center">Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="isLoading">
                  <td colspan="6" class="text-center py-4">
                    <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
                  </td>
                </tr>
                <tr *ngFor="let dt of deTaiList; let i = index">
                  <td>
                    <input type="checkbox"
                           [checked]="selectedDeTais.includes(dt.id)"
                           (change)="toggleSelect(dt.id)">
                  </td>
                  <td>{{ i + 1 }}</td>
                  <td>
                    <strong>{{ dt.hoTenSinhVien }}</strong><br>
                    <small class="text-muted">{{ dt.maSinhVien }} - {{ dt.lopSinhVien }}</small>
                  </td>
                  <td>{{ dt.tenDeTai }}</td>
                  <td>{{ dt.tenBoMon }}</td>
                  <td class="text-center">
                    <button class="btn btn-outline-primary btn-sm" (click)="chiTietDeTai = dt" data-bs-toggle="modal" data-bs-target="#chiTietModal">
                      <i class="bi bi-eye"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="!isLoading && deTaiList.length === 0">
                  <td colspan="6" class="text-center text-muted py-4">
                    Không có đề tài đăng ký nào chờ gửi Bộ môn.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Tab 2: Bị từ chối -->
    <div *ngIf="activeTab === 'bi-tu-choi'">
      

      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>Danh sách bị từ chối ({{ biTuChoiList.length }} đề tài)</span>
          <button *ngIf="selectedBiTuChois.length > 0"
                  class="btn btn-danger btn-sm"
                  (click)="xoaNhieuBiTuChoi()">
            <i class="bi bi-trash me-1"></i>Xóa {{ selectedBiTuChois.length }} đề tài
          </button>
        </div>
        <div class="card-body">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th width="40">
                    <input type="checkbox" (change)="toggleSelectBiTuChoiAll($event)" [checked]="isAllBiTuChoiSelected()">
                  </th>
                  <th>STT</th>
                  <th>Sinh viên</th>
                  <th>Tên đề tài</th>
                  <th>Bộ môn</th>
                  <th>Lý do từ chối</th>
                  <th class="text-center">Xóa</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="isLoadingBiTuChoi">
                  <td colspan="7" class="text-center py-4">
                    <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
                  </td>
                </tr>
                <tr *ngFor="let dt of biTuChoiList; let i = index">
                  <td>
                    <input type="checkbox"
                           [checked]="selectedBiTuChois.includes(dt.id)"
                           (change)="toggleSelectBiTuChoi(dt.id)">
                  </td>
                  <td>{{ i + 1 }}</td>
                  <td>
                    <strong>{{ dt.hoTenSinhVien }}</strong><br>
                    <small class="text-muted">{{ dt.maSinhVien }} - {{ dt.lopSinhVien }}</small>
                  </td>
                  <td>{{ dt.tenDeTai }}</td>
                  <td>{{ dt.tenBoMon }}</td>
                  <td>
                    <span class="text-danger">{{ dt.ghiChu || 'Không có lý do' }}</span>
                  </td>
                  <td class="text-center">
                    <button class="btn btn-outline-danger btn-sm" (click)="xoaMotBiTuChoi(dt.id)">
                      <i class="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
                <tr *ngIf="!isLoadingBiTuChoi && biTuChoiList.length === 0">
                  <td colspan="7" class="text-center text-muted py-4">
                    Không có đề tài nào bị từ chối.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="chiTietModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="chiTietDeTai">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Chi tiết đề tài đăng ký</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-bold">Sinh viên</label>
                <p class="mb-1">{{ chiTietDeTai.hoTenSinhVien }}</p>
                <small class="text-muted">{{ chiTietDeTai.maSinhVien }} - {{ chiTietDeTai.lopSinhVien }}</small>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Bộ môn</label>
                <p>{{ chiTietDeTai.tenBoMon }}</p>
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Tên đề tài</label>
                <p>{{ chiTietDeTai.tenDeTai }}</p>
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Nội dung dự kiến</label>
                <p class="text-muted">{{ chiTietDeTai.noiDungDuKien || 'Chưa có' }}</p>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Công nghệ sử dụng</label>
                <p class="text-muted">{{ chiTietDeTai.congNgheSuDung || 'Chưa có' }}</p>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">GV hướng dẫn dự kiến</label>
                <p class="text-muted">{{ chiTietDeTai.hoTenGiangVienDuKien || 'Chưa có' }}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DeTaiComponent implements OnInit {
  deTaiList: DeTaiResponse[] = [];
  biTuChoiList: DeTaiResponse[] = [];
  dotList: DotDangKyResponse[] = [];
  selectedDotId: number | null = null;
  selectedDeTais: number[] = [];
  selectedBiTuChois: number[] = [];
  chiTietDeTai: DeTaiResponse | null = null;
  isLoading = false;
  isLoadingBiTuChoi = false;
  activeTab: 'cho-gui' | 'bi-tu-choi' = 'cho-gui';

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDotList();
    this.loadDeTai();
    this.loadBiTuChoi();
  }

  loadDotList(): void {
    this.adminService.getAllDotDangKy().subscribe({
      next: (res) => {
        if (res.success) {
          this.dotList = res.data;
        }
      }
    });
  }

  switchTab(tab: 'cho-gui' | 'bi-tu-choi'): void {
    this.activeTab = tab;
  }

  loadDeTai(): void {
    this.isLoading = true;
    const dotId = this.selectedDotId ?? undefined;
    this.adminService.getDeTaiDangKy(dotId, 'CHO_DUYET').subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.deTaiList = res.data;
        } else {
          this.deTaiList = [];
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Không thể tải danh sách đề tài đăng ký');
        this.deTaiList = [];
      }
    });
  }

  loadBiTuChoi(): void {
    this.isLoadingBiTuChoi = true;
    const dotId = this.selectedDotId ?? undefined;
    this.adminService.getDeTaiBiTuChoi(dotId).subscribe({
      next: (res) => {
        this.isLoadingBiTuChoi = false;
        if (res.success && res.data) {
          this.biTuChoiList = res.data;
        } else {
          this.biTuChoiList = [];
        }
      },
      error: () => {
        this.isLoadingBiTuChoi = false;
        this.toastr.error('Không thể tải danh sách bị từ chối');
        this.biTuChoiList = [];
      }
    });
  }

  toggleSelect(id: number): void {
    const idx = this.selectedDeTais.indexOf(id);
    if (idx > -1) {
      this.selectedDeTais.splice(idx, 1);
    } else {
      this.selectedDeTais.push(id);
    }
  }

  toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedDeTais = this.deTaiList.map(dt => dt.id);
    } else {
      this.selectedDeTais = [];
    }
  }

  isAllSelected(): boolean {
    return this.deTaiList.length > 0 && this.deTaiList.every(dt => this.selectedDeTais.includes(dt.id));
  }

  guiLenBoMon(): void {
    if (this.selectedDeTais.length === 0) return;
    this.adminService.guiNhieuLenBoMon(this.selectedDeTais).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Đã gửi ' + this.selectedDeTais.length + ' đăng ký lên Bộ môn!');
          this.selectedDeTais = [];
          this.loadDeTai();
        }
      },
      error: (err) => {
        const message = err.error?.message || 'Không thể gửi đề tài lên Bộ môn';
        this.toastr.error(message);
      }
    });
  }

  // Bị từ chối
  toggleSelectBiTuChoi(id: number): void {
    const idx = this.selectedBiTuChois.indexOf(id);
    if (idx > -1) {
      this.selectedBiTuChois.splice(idx, 1);
    } else {
      this.selectedBiTuChois.push(id);
    }
  }

  toggleSelectBiTuChoiAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedBiTuChois = this.biTuChoiList.map(dt => dt.id);
    } else {
      this.selectedBiTuChois = [];
    }
  }

  isAllBiTuChoiSelected(): boolean {
    return this.biTuChoiList.length > 0 && this.biTuChoiList.every(dt => this.selectedBiTuChois.includes(dt.id));
  }

  xoaMotBiTuChoi(id: number): void {
    if (!confirm('Xóa đề tài này để sinh viên đăng ký lại?')) return;
    this.adminService.xoaDeTaiBiTuChoi(id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Đã xóa đề tài bị từ chối!');
          this.loadBiTuChoi();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Không thể xóa đề tài');
      }
    });
  }

  xoaNhieuBiTuChoi(): void {
    if (!confirm('Xóa ' + this.selectedBiTuChois.length + ' đề tài để sinh viên đăng ký lại?')) return;
    this.adminService.xoaNhieuDeTaiBiTuChoi(this.selectedBiTuChois).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Đã xóa ' + this.selectedBiTuChois.length + ' đề tài bị từ chối!');
          this.selectedBiTuChois = [];
          this.loadBiTuChoi();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Không thể xóa đề tài');
      }
    });
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DeTaiResponse, BoMonResponse } from '../../../core/models/models';
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
        <select class="form-select" style="width: 220px;" [(ngModel)]="selectedBoMonId" (change)="loadDeTai()">
          <option [ngValue]="null">Tất cả bộ môn</option>
          <option *ngFor="let bm of boMonList" [ngValue]="bm.id">{{ bm.tenBoMon }}</option>
        </select>
      </div>
    </div>

    <!-- Tab: Chờ gửi Bộ môn -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>
          <i class="bi bi-send me-1"></i>Danh sách đăng ký chờ gửi Bộ môn
          <span class="badge bg-primary ms-2">{{ deTaiList.length }}</span>
        </span>
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
  boMonList: BoMonResponse[] = [];
  selectedBoMonId: number | null = null;
  selectedDeTais: number[] = [];
  chiTietDeTai: DeTaiResponse | null = null;
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBoMonList();
    this.loadDeTai();
  }

  loadBoMonList(): void {
    this.adminService.getAllBoMon().subscribe({
      next: (res) => {
        if (res.success) {
          this.boMonList = res.data;
        }
      }
    });
  }

  loadDeTai(): void {
    this.isLoading = true;
    const boMonId = this.selectedBoMonId ?? undefined;
    this.adminService.getDeTaiDangKy(undefined, 'CHO_DUYET', boMonId).subscribe({
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
}
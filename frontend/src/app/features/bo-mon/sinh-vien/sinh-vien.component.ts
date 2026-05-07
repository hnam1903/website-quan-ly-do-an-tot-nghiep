import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { SinhVienResponse, BoMonResponse } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sinh-vien-bo-mon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-success-subtle">
          <span class="material-symbols-outlined text-success">group</span>
        </div>
        <div>
          <h2>Quản lý Sinh viên</h2>
          <p class="mb-0">Xem danh sách sinh viên theo bộ môn</p>
        </div>
      </div>
      <span class="badge bg-success">{{ filteredSinhVienList.length }} sinh viên</span>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="row g-3 mb-4">
          <div class="col-md-4" *ngIf="isAdmin">
            <select class="form-select" [(ngModel)]="selectedBoMonId" (change)="loadSinhVien()">
              <option [ngValue]="null">-- Tất cả bộ môn --</option>
              <option *ngFor="let bm of boMonList" [ngValue]="bm.id">{{ bm.tenBoMon }}</option>
            </select>
          </div>
          <div class="col-md-4">
            <input type="text" class="form-control" placeholder="Tìm kiếm theo tên, mã SV..."
                   [(ngModel)]="searchText" (input)="filterSinhVien()">
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th style="width: 120px">Mã SV</th>
                <th>Họ tên</th>
                <th style="width: 100px">Lớp</th>
                <th style="width: 160px">Bộ môn</th>
                <th>Email</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sv of filteredSinhVienList; let i = index" class="align-middle">
                <td class="text-center">
                  <span class="stt-badge">{{ i + 1 }}</span>
                </td>
                <td><code>{{ sv.maSinhVien }}</code></td>
                <td><strong>{{ sv.hoTen }}</strong></td>
                <td>{{ sv.lop || '-' }}</td>
                <td>{{ sv.tenBoMon || '-' }}</td>
                <td class="text-muted">{{ sv.email }}</td>
              </tr>
              <tr *ngIf="filteredSinhVienList.length === 0">
                <td colspan="6" class="text-center py-5">
                  <div class="empty-state">
                    <span class="material-symbols-outlined fs-2 d-block mb-3" style="color: #ccc;">group</span>
                    <p class="mb-1 fw-semibold">Không có sinh viên nào</p>
                    <small class="text-muted">Thử thay đổi bộ lọc</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SinhVienBoMonComponent implements OnInit {
  sinhVienList: SinhVienResponse[] = [];
  filteredSinhVienList: SinhVienResponse[] = [];
  boMonList: BoMonResponse[] = [];
  searchText = '';
  selectedBoMonId: number | null = null;
  isAdmin = false;

  constructor(
    private boMonService: BoMonService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadBoMon();
    this.loadSinhVien();
  }

  loadBoMon(): void {
    this.boMonService.getBoMonList().subscribe({
      next: (res) => {
        if (res.success) {
          this.boMonList = res.data;
        }
      }
    });
  }

  loadSinhVien(): void {
    this.boMonService.getSinhVien(this.selectedBoMonId ?? undefined).subscribe({
      next: (res) => {
        if (res.success) {
          this.sinhVienList = res.data;
          this.filterSinhVien();
        }
      },
      error: (err) => {
        this.toastr.error('Không thể tải danh sách sinh viên');
      }
    });
  }

  filterSinhVien(): void {
    if (!this.searchText) {
      this.filteredSinhVienList = this.sinhVienList;
    } else {
      const lower = this.searchText.toLowerCase();
      this.filteredSinhVienList = this.sinhVienList.filter(sv =>
        sv.hoTen?.toLowerCase().includes(lower) ||
        sv.maSinhVien?.toLowerCase().includes(lower) ||
        sv.lop?.toLowerCase().includes(lower) ||
        sv.tenBoMon?.toLowerCase().includes(lower)
      );
    }
  }

  getStatusClass(status: string): string {
    const map: any = {
      'CHO_DUYET': 'bg-secondary',
      'DA_GUI_BO_MON': 'bg-info',
      'CHO_GV_DUYET': 'bg-warning',
      'DANG_THUC_HIEN': 'bg-primary',
      'DA_NOP_BAO_CAO': 'bg-info',
      'DAT_GVHD': 'bg-success',
      'DAT_PHAN_BIEN': 'bg-success',
      'HOAN_THANH': 'bg-success',
      'KHONG_DAT_BAO_VE': 'bg-danger'
    };
    return map[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const map: any = {
      'CHO_DUYET': 'Chờ duyệt',
      'DA_GUI_BO_MON': 'Đã gửi BM',
      'CHO_GV_DUYET': 'Chờ GV duyệt',
      'DANG_THUC_HIEN': 'Đang thực hiện',
      'DA_NOP_BAO_CAO': 'Đã nộp BC',
      'DAT_GVHD': 'Đạt HD',
      'DAT_PHAN_BIEN': 'Đạt PB',
      'HOAN_THANH': 'Hoàn thành',
      'KHONG_DAT_BAO_VE': 'Không đạt bảo vệ'
    };
    return map[status] || status;
  }
}

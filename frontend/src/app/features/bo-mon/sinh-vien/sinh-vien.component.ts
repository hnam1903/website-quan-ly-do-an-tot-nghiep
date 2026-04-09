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
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h2>Quản lý Sinh viên</h2>
        <p class="text-muted mb-0">Danh sách sinh viên {{ isAdmin ? 'toàn trường' : 'thuộc bộ môn' }}</p>
      </div>
      <div class="d-flex align-items-center">
        <span class="badge bg-primary me-3">{{ filteredSinhVienList.length }} sinh viên</span>
        <button class="btn btn-sm btn-outline-primary" (click)="loadSinhVien()">
          <i class="bi bi-arrow-clockwise"></i> Làm mới
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="row mb-3">
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
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>STT</th>
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Lớp</th>
                <th>Bộ môn</th>
                <th>Email</th>
                <th>Đề tài</th>
                <th>Trạng thái đề tài</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sv of filteredSinhVienList; let i = index">
                <td>{{ i + 1 }}</td>
                <td><strong>{{ sv.maSinhVien }}</strong></td>
                <td>{{ sv.hoTen }}</td>
                <td>{{ sv.lop || '-' }}</td>
                <td>{{ sv.tenBoMon || '-' }}</td>
                <td>{{ sv.email }}</td>
                <td>
                  <span *ngIf="sv.deTaiId" class="text-primary">{{ sv.deTaiTen || 'Có đề tài' }}</span>
                  <span *ngIf="!sv.deTaiId" class="text-muted">Chưa đăng ký</span>
                </td>
                <td>
                  <span *ngIf="sv.deTaiTrangThai" [class]="getStatusClass(sv.deTaiTrangThai)" class="badge">
                    {{ getStatusText(sv.deTaiTrangThai) }}
                  </span>
                  <span *ngIf="!sv.deTaiTrangThai" class="text-muted">-</span>
                </td>
              </tr>
              <tr *ngIf="filteredSinhVienList.length === 0">
                <td colspan="8" class="text-center text-muted py-4">
                  <i class="bi bi-people fs-1 d-block mb-2"></i>
                  Không có sinh viên nào
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
      'KHONG_DAT': 'bg-danger'
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
      'KHONG_DAT': 'Không đạt'
    };
    return map[status] || status;
  }
}

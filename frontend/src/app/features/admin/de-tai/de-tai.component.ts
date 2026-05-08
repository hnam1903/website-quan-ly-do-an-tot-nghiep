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
        <p class="text-muted mb-0 small">Xem danh sách đề tài đã đăng ký (SV đăng ký xong sẽ hiển thị tại Bộ môn tương ứng)</p>
      </div>
      <div class="d-flex gap-2">
        <select class="form-select" style="width: 220px;" [(ngModel)]="selectedBoMonId" (change)="loadDeTai()">
          <option [ngValue]="null">Tất cả bộ môn</option>
          <option *ngFor="let bm of boMonList" [ngValue]="bm.id">{{ bm.tenBoMon }}</option>
        </select>
        <select class="form-select" style="width: 180px;" [(ngModel)]="selectedTrangThai" (change)="loadDeTai()">
          <option value="">Tất cả trạng thái</option>
          <option value="CHO_BO_MON_DUYET">Chờ Bộ môn duyệt</option>
          <option value="CHO_GV_DUYET">Chờ GVHD duyệt</option>
          <option value="DANG_THUC_HIEN">Đang thực hiện</option>
          <option value="CHO_PHAN_BIEN">Chờ phản biện</option>
          <option value="HOAN_THANH">Hoàn thành</option>
        </select>
        <button class="btn btn-outline-primary" (click)="loadDeTai()">
          <span class="material-symbols-outlined">refresh</span>
        </button>
      </div>
    </div>

    <!-- Danh sách đề tài -->
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>
          <span class="material-symbols-outlined me-1">list_alt</span>Danh sách đề tài
          <span class="badge bg-primary ms-2">{{ deTaiList.length }}</span>
        </span>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th>Bộ môn</th>
                <th>Trạng thái</th>
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
                <td>{{ i + 1 }}</td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong><br>
                  <small class="text-muted">{{ dt.maSinhVien }} - {{ dt.lopSinhVien }}</small>
                </td>
                <td>{{ dt.tenDeTai }}</td>
                <td>{{ dt.tenBoMon }}</td>
                <td>
                  <span [class]="getStatusClass(dt.trangThai)" class="badge">
                    {{ getStatusText(dt.trangThai) }}
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-outline-primary btn-sm" (click)="chiTietDeTai = dt" data-bs-toggle="modal" data-bs-target="#chiTietModal">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>
              <tr *ngIf="!isLoading && deTaiList.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  Không có đề tài nào.
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
            <h5 class="modal-title">Chi tiết đề tài</h5>
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
              <div class="col-12">
                <label class="form-label fw-bold">Trạng thái</label>
                <p>
                  <span [class]="getStatusClass(chiTietDeTai.trangThai)" class="badge fs-6">
                    {{ getStatusText(chiTietDeTai.trangThai) }}
                  </span>
                </p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table th {
      background-color: #f8f9fa;
      font-weight: 600;
    }
    .badge {
      padding: 0.35em 0.65em;
      font-size: 0.85em;
    }
  `]
})
export class DeTaiComponent implements OnInit {
  deTaiList: DeTaiResponse[] = [];
  boMonList: BoMonResponse[] = [];
  selectedBoMonId: number | null = null;
  selectedTrangThai: string = '';
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
    const trangThai = this.selectedTrangThai || undefined;
    this.adminService.getDeTaiDangKy(undefined, trangThai, boMonId).subscribe({
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
        this.toastr.error('Không thể tải danh sách đề tài');
        this.deTaiList = [];
      }
    });
  }

  getStatusClass(trangThai: string): string {
    const map: { [key: string]: string } = {
      'CHO_BO_MON_DUYET': 'bg-info',
      'CHO_GV_DUYET': 'bg-warning text-dark',
      'GV_TU_CHOI': 'bg-warning text-dark',
      'CHO_GV_PHAN_CONG': 'bg-warning text-dark',
      'CHO_BO_MON_PHAN_CONG': 'bg-warning text-dark',
      'DANG_THUC_HIEN': 'bg-primary',
      'DA_NOP_BAO_CAO': 'bg-info',
      'DAT_GVHD': 'bg-success',
      'KHONG_DAT_GVHD': 'bg-danger',
      'CHO_PHAN_BIEN': 'bg-info',
      'DAT_PHAN_BIEN': 'bg-success',
      'KHONG_DAT_PHAN_BIEN': 'bg-danger',
      'DANG_BAO_VE': 'bg-primary',
      'HOAN_THANH': 'bg-success',
      'KHONG_DAT_BAO_VE': 'bg-danger',
      'BI_TU_CHOI': 'bg-danger'
    };
    return map[trangThai] || 'bg-secondary';
  }

  getStatusText(trangThai: string): string {
    const map: { [key: string]: string } = {
      'CHO_BO_MON_DUYET': 'Chờ Bộ môn duyệt',
      'CHO_GV_DUYET': 'Chờ GVHD duyệt',
      'GV_TU_CHOI': 'GVHD từ chối',
      'CHO_GV_PHAN_CONG': 'Chờ phân công GVHD',
      'CHO_BO_MON_PHAN_CONG': 'Chờ BM xác nhận',
      'DANG_THUC_HIEN': 'Đang thực hiện',
      'DA_NOP_BAO_CAO': 'Đã nộp báo cáo',
      'DAT_GVHD': 'Đạt GVHD',
      'KHONG_DAT_GVHD': 'Không đạt GVHD',
      'CHO_PHAN_BIEN': 'Chờ phản biện',
      'DAT_PHAN_BIEN': 'Đạt phản biện',
      'KHONG_DAT_PHAN_BIEN': 'Không đạt PB',
      'DANG_BAO_VE': 'Đang bảo vệ',
      'HOAN_THANH': 'Hoàn thành',
      'KHONG_DAT_BAO_VE': 'Không đạt BV',
      'BI_TU_CHOI': 'Bị từ chối'
    };
    return map[trangThai] || trangThai;
  }
}

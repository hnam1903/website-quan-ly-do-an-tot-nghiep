import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { DotDangKyResponse, DanhSachSinhVienDotDangKyResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-danh-sach-dot-dang-ky',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-info-subtle">
          <span class="material-symbols-outlined">event</span>
        </div>
        <div>
          <h2>Danh sách đợt đăng ký</h2>
          <p class="mb-0">Quản lý và theo dõi sinh viên đăng ký theo từng đợt</p>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="container-fluid">
      <!-- Batch List Section -->
      <div class="card mb-4">
        <div class="card-header d-flex justify-content-between align-items-center">
          <span>
            <span class="material-symbols-outlined me-1">list</span>
            Danh sách các đợt đăng ký
            <span class="badge bg-primary ms-2">{{ dotList.length }} đợt</span>
          </span>
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="text-center" style="width: 60px">STT</th>
                  <th>Tên đợt</th>
                  <th style="width: 120px">Năm học</th>
                  <th style="width: 100px">Học kỳ</th>
                  <th style="width: 130px">Ngày bắt đầu</th>
                  <th style="width: 130px">Ngày kết thúc</th>
                  <th style="width: 120px">Trạng thái</th>
                  <th style="width: 100px">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                @if (dotList.length === 0) {
                  <tr>
                    <td colspan="8" class="text-center py-5">
                      <div class="empty-state">
                        <span class="material-symbols-outlined fs-1 d-block mb-3">event_busy</span>
                        <p class="mb-1 fw-semibold">Chưa có đợt đăng ký nào</p>
                        <small class="text-muted">Vui lòng tạo đợt đăng ký mới</small>
                      </div>
                    </td>
                  </tr>
                } @else {
                  @for (dot of dotList; track dot.id; let i = $index) {
                    <tr [class.table-active]="selectedDot?.id === dot.id" (click)="selectDot(dot)" style="cursor: pointer;">
                      <td class="text-center">
                        <span class="stt-badge">{{ i + 1 }}</span>
                      </td>
                      <td>
                        <strong class="text-dark">{{ dot.tenDot }}</strong>
                      </td>
                      <td>{{ dot.namHoc }}</td>
                      <td>{{ getHocKyText(dot.hocKy) }}</td>
                      <td>{{ dot.ngayBatDau | date:'dd/MM/yyyy' }}</td>
                      <td>{{ dot.ngayKetThuc | date:'dd/MM/yyyy' }}</td>
                      <td>
                        <span [class]="getStatusClass(dot.trangThai)" class="badge">
                          <span class="material-symbols-outlined" style="font-size: 14px;">{{ dot.trangThai === 'DANG_MO' ? 'check_circle' : 'schedule' }}</span>
                          {{ dot.trangThai === 'DANG_MO' ? 'Đang mở' : 'Đã kết thúc' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn btn-sm btn-outline-primary btn-icon" (click)="selectDot(dot); $event.stopPropagation()" title="Xem danh sách sinh viên">
                          <span class="material-symbols-outlined">visibility</span>
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Student Lists Section -->
      @if (selectedDot && svData) {
        <div class="card animate-fade-in">
          <div class="card-header d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
              <span class="material-symbols-outlined text-primary">group</span>
              <span>Danh sách sinh viên - <strong>{{ selectedDot.tenDot }}</strong></span>
            </div>
            <button class="btn btn-sm btn-outline-secondary btn-icon" (click)="clearSelection()" title="Đóng">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
          <div class="card-body">
            <!-- Summary Cards -->
            <div class="summary-cards mb-4">
              <div class="summary-card total-card">
                <div class="card-icon">
                  <span class="material-symbols-outlined">groups</span>
                </div>
                <div class="card-content">
                  <span class="card-label">Tổng số sinh viên</span>
                  <span class="card-value">{{ svData.tongSoSinhVien }}</span>
                </div>
              </div>

              <div class="summary-card registered-card">
                <div class="card-icon">
                  <span class="material-symbols-outlined">check_circle</span>
                </div>
                <div class="card-content">
                  <span class="card-label">Đã đăng ký</span>
                  <span class="card-value">{{ svData.soLuongDaDangKy }}</span>
                  <span class="card-percent">{{ getPercentRegistered() }}%</span>
                </div>
              </div>

              <div class="summary-card unregistered-card">
                <div class="card-icon">
                  <span class="material-symbols-outlined">schedule</span>
                </div>
                <div class="card-content">
                  <span class="card-label">Chưa đăng ký</span>
                  <span class="card-value">{{ svData.soLuongChuaDangKy }}</span>
                  <span class="card-percent">{{ getPercentUnregistered() }}%</span>
                </div>
              </div>
            </div>

            <!-- Student Tables -->
            <div class="row g-4">
              <!-- Registered Students -->
              <div class="col-md-6">
                <div class="table-card registered">
                  <div class="table-card-header">
                    <h4>
                      <span class="material-symbols-outlined text-success me-2">task_alt</span>
                      Sinh viên đã đăng ký
                    </h4>
                    <span class="count-badge">{{ svData.sinhVienDaDangKy.length }}</span>
                  </div>
                  <div class="table-card-body">
                    @if (svData.sinhVienDaDangKy.length === 0) {
                      <div class="empty-table">
                        <span class="material-symbols-outlined">inbox</span>
                        <p>Chưa có sinh viên đăng ký</p>
                      </div>
                    } @else {
                      <table class="table table-hover">
                        <thead>
                          <tr>
                            <th class="text-center" style="width: 50px">#</th>
                            <th>Mã SV</th>
                            <th>Họ tên</th>
                            <th>Lớp</th>
                            <th>Bộ môn</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (sv of svData.sinhVienDaDangKy; track sv.id; let i = $index) {
                            <tr>
                              <td class="text-center">{{ i + 1 }}</td>
                              <td><code>{{ sv.maSinhVien }}</code></td>
                              <td>{{ sv.hoTen }}</td>
                              <td>{{ sv.lop || '-' }}</td>
                              <td>{{ sv.tenBoMon || 'Chưa phân' }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }
                  </div>
                </div>
              </div>

              <!-- Unregistered Students -->
              <div class="col-md-6">
                <div class="table-card unregistered">
                  <div class="table-card-header">
                    <h4>
                      <span class="material-symbols-outlined text-warning me-2">warning</span>
                      Sinh viên chưa đăng ký
                    </h4>
                    <span class="count-badge">{{ svData.sinhVienChuaDangKy.length }}</span>
                  </div>
                  <div class="table-card-body">
                    @if (svData.sinhVienChuaDangKy.length === 0) {
                      <div class="empty-table success">
                        <span class="material-symbols-outlined">done_all</span>
                        <p>Tất cả sinh viên đã đăng ký!</p>
                      </div>
                    } @else {
                      <table class="table table-hover">
                        <thead>
                          <tr>
                            <th class="text-center" style="width: 50px">#</th>
                            <th>Mã SV</th>
                            <th>Họ tên</th>
                            <th>Lớp</th>
                            <th>Bộ môn</th>
                          </tr>
                        </thead>
                        <tbody>
                          @for (sv of svData.sinhVienChuaDangKy; track sv.id; let i = $index) {
                            <tr>
                              <td class="text-center">{{ i + 1 }}</td>
                              <td><code>{{ sv.maSinhVien }}</code></td>
                              <td>{{ sv.hoTen }}</td>
                              <td>{{ sv.lop || '-' }}</td>
                              <td>{{ sv.tenBoMon || 'Chưa phân' }}</td>
                            </tr>
                          }
                        </tbody>
                      </table>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Loading Overlay -->
      @if (loading) {
        <div class="loading-overlay">
          <div class="spinner"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class DanhSachDotDangKyComponent implements OnInit {
  dotList: DotDangKyResponse[] = [];
  selectedDot: DotDangKyResponse | null = null;
  svData: DanhSachSinhVienDotDangKyResponse | null = null;
  loading = false;

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadDotList();
  }

  loadDotList(): void {
    this.adminService.getAllDotDangKy().subscribe({
      next: (res) => {
        if (res.success) {
          this.dotList = res.data;
        }
      },
      error: (err) => {
        this.toastr.error('Lỗi khi tải danh sách đợt đăng ký');
      }
    });
  }

  selectDot(dot: DotDangKyResponse): void {
    this.loading = true;
    this.selectedDot = dot;

    this.adminService.getDanhSachSinhVienByDotDangKy(dot.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.svData = res.data;
          this.toastr.success(`Đã tải ${res.data.soLuongDaDangKy + res.data.soLuongChuaDangKy} sinh viên`);
        }
        this.loading = false;
      },
      error: (err) => {
        this.toastr.error('Lỗi khi tải danh sách sinh viên');
        this.loading = false;
      }
    });
  }

  clearSelection(): void {
    this.selectedDot = null;
    this.svData = null;
  }

  getStatusClass(status: string): string {
    return status === 'DANG_MO' ? 'bg-success' : 'bg-secondary';
  }

  getHocKyText(hocKy: number): string {
    switch (hocKy) {
      case 1: return 'Học kỳ 1';
      case 2: return 'Học kỳ 2';
      case 3: return 'Học kỳ hè';
      default: return 'Học kỳ ' + hocKy;
    }
  }

  getOpenCount(): number {
    return this.dotList.filter(d => d.trangThai === 'DANG_MO').length;
  }

  getClosedCount(): number {
    return this.dotList.filter(d => d.trangThai !== 'DANG_MO').length;
  }

  getPercentRegistered(): number {
    if (!this.svData || this.svData.tongSoSinhVien === 0) return 0;
    return Math.round((this.svData.soLuongDaDangKy / this.svData.tongSoSinhVien) * 100);
  }

  getPercentUnregistered(): number {
    if (!this.svData || this.svData.tongSoSinhVien === 0) return 0;
    return Math.round((this.svData.soLuongChuaDangKy / this.svData.tongSoSinhVien) * 100);
  }
}

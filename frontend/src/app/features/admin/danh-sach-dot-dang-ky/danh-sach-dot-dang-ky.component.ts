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
    <div class="dsdd-header">
      <div class="header-content">
        <h2 class="header-title">
          <i class="bi bi-calendar3"></i>
          Quản lý đợt đăng ký
        </h2>
        <p class="header-subtitle">Quản lý và theo dõi sinh viên đăng ký theo từng đợt</p>
      </div>
      <div class="header-stats" *ngIf="dotList.length > 0">
        <div class="stat-item">
          <span class="stat-label">Tổng đợt</span>
          <span class="stat-value">{{ dotList.length }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Đang mở</span>
          <span class="stat-value text-success">{{ getOpenCount() }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Đã kết thúc</span>
          <span class="stat-value text-muted">{{ getClosedCount() }}</span>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="dsdd-container">
      <!-- Batch List Section -->
      <section class="section batch-section">
        <div class="section-header">
          <h3>
            <i class="bi bi-list-ul"></i>
            Danh sách các đợt đăng ký
          </h3>
          <span class="badge bg-primary">{{ dotList.length }} đợt</span>
        </div>

        <div class="card batch-card">
          <div class="table-wrapper">
            <table class="table batch-table">
              <thead>
                <tr>
                  <th class="col-stt">STT</th>
                  <th class="col-name">Tên đợt</th>
                  <th class="col-year">Năm học</th>
                  <th class="col-semester">Học kỳ</th>
                  <th class="col-date">Ngày bắt đầu</th>
                  <th class="col-date">Ngày kết thúc</th>
                  <th class="col-status">Trạng thái</th>
                  <th class="col-action">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                @if (dotList.length === 0) {
                  <tr>
                    <td colspan="8" class="empty-state">
                      <div class="empty-content">
                        <i class="bi bi-calendar-x empty-icon"></i>
                        <p>Chưa có đợt đăng ký nào</p>
                        <small class="text-muted">Vui lòng tạo đợt đăng ký mới</small>
                      </div>
                    </td>
                  </tr>
                } @else {
@for (dot of dotList; track dot.id; let i = $index) {
  <tr
    [class.selected]="selectedDot?.id === dot.id"
    (click)="selectDot(dot)"
    [attr.aria-current]="selectedDot?.id === dot.id ? 'page' : null"
  >
    <td class="text-center">
      <span class="stt-badge">{{ i + 1 }}</span>
    </td>
                      <td>
                        <div class="dot-name">
                          <strong>{{ dot.tenDot }}</strong>
                        </div>
                      </td>
                      <td>
                        <span class="year-tag">{{ dot.namHoc }}</span>
                      </td>
                      <td>
                        <span class="semester-tag">{{ getHocKyText(dot.hocKy) }}</span>
                      </td>
                      <td>
                        <span class="date-text">{{ dot.ngayBatDau | date:'dd/MM/yyyy' }}</span>
                      </td>
                      <td>
                        <span class="date-text">{{ dot.ngayKetThuc | date:'dd/MM/yyyy' }}</span>
                      </td>
                      <td>
                        <span [class]="getStatusClass(dot.trangThai)" class="status-badge">
                          <i class="bi" [class]="dot.trangThai === 'DANG_MO' ? 'bi-circle-fill' : 'bi-circle'"></i>
                          {{ dot.trangThai === 'DANG_MO' ? 'Đang mở' : 'Đã kết thúc' }}
                        </span>
                      </td>
                      <td>
                        <button class="btn-action btn-view" (click)="selectDot(dot); $event.stopPropagation()" title="Xem danh sách sinh viên">
                          <i class="bi bi-eye"></i>
                          <span>Xem</span>
                        </button>
                      </td>
                    </tr>
                  }
                }
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <!-- Student Lists Section -->
      @if (selectedDot && svData) {
        <section class="section student-section animate-fade-in">
          <!-- Section Header -->
          <div class="student-section-header">
            <div class="selected-info">
              <h3>
                <i class="bi bi-people-fill"></i>
                Danh sách sinh viên
              </h3>
              <div class="selected-batch">
                <span class="batch-label">Đợt:</span>
                <span class="batch-name">{{ selectedDot.tenDot }}</span>
                <span class="batch-meta">
                  {{ selectedDot.namHoc }} · {{ getHocKyText(selectedDot.hocKy) }}
                </span>
              </div>
            </div>
            <button class="btn-close-section" (click)="clearSelection()" title="Đóng">
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Summary Cards -->
          <div class="summary-cards">
            <div class="summary-card total-card">
              <div class="card-icon">
                <i class="bi bi-people"></i>
              </div>
              <div class="card-content">
                <span class="card-label">Tổng số sinh viên</span>
                <span class="card-value">{{ svData.tongSoSinhVien }}</span>
              </div>
            </div>

            <div class="summary-card registered-card">
              <div class="card-icon">
                <i class="bi bi-check-circle"></i>
              </div>
              <div class="card-content">
                <span class="card-label">Đã đăng ký</span>
                <span class="card-value">{{ svData.soLuongDaDangKy }}</span>
                <span class="card-percent">{{ getPercentRegistered() }}%</span>
              </div>
            </div>

            <div class="summary-card unregistered-card">
              <div class="card-icon">
                <i class="bi bi-clock-history"></i>
              </div>
              <div class="card-content">
                <span class="card-label">Chưa đăng ký</span>
                <span class="card-value">{{ svData.soLuongChuaDangKy }}</span>
                <span class="card-percent">{{ getPercentUnregistered() }}%</span>
              </div>
            </div>
          </div>

          <!-- Student Tables -->
          <div class="tables-grid">
            <!-- Registered Students -->
            <div class="table-card registered">
              <div class="table-card-header">
                <div class="header-left">
                  <i class="bi bi-check-circle-fill"></i>
                  <h4>Sinh viên đã đăng ký</h4>
                </div>
                <span class="count-badge">{{ svData.sinhVienDaDangKy.length }}</span>
              </div>
              <div class="table-card-body">
                @if (svData.sinhVienDaDangKy.length === 0) {
                  <div class="empty-table">
                    <i class="bi bi-inbox"></i>
                    <p>Chưa có sinh viên đăng ký</p>
                  </div>
                } @else {
                  <table class="table student-table">
                    <thead>
                      <tr>
                        <th class="col-number">#</th>
                        <th>Mã sinh viên</th>
                        <th>Họ tên</th>
                        <th>Lớp</th>
                        <th>Bộ môn</th>
                      </tr>
                    </thead>
                    <tbody>
@for (sv of svData.sinhVienDaDangKy; track sv.id; let i = $index) {
  <tr>
    <td class="text-center">
      <span class="row-number">{{ i + 1 }}</span>
    </td>
                          <td>
                            <span class="student-id">{{ sv.maSinhVien }}</span>
                          </td>
                          <td>
                            <span class="student-name">{{ sv.hoTen }}</span>
                          </td>
                          <td>
                            <span class="student-class">{{ sv.lop || '-' }}</span>
                          </td>
                          <td>
                            <span class="department-tag">{{ sv.tenBoMon || 'Chưa phân bộ' }}</span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            </div>

            <!-- Unregistered Students -->
            <div class="table-card unregistered">
              <div class="table-card-header">
                <div class="header-left">
                  <i class="bi bi-exclamation-circle-fill"></i>
                  <h4>Sinh viên chưa đăng ký</h4>
                </div>
                <span class="count-badge">{{ svData.sinhVienChuaDangKy.length }}</span>
              </div>
              <div class="table-card-body">
                @if (svData.sinhVienChuaDangKy.length === 0) {
                  <div class="empty-table success">
                    <i class="bi bi-check-all"></i>
                    <p>Tất cả sinh viên đã đăng ký!</p>
                  </div>
                } @else {
                  <table class="table student-table">
                    <thead>
                      <tr>
                        <th class="col-number">#</th>
                        <th>Mã sinh viên</th>
                        <th>Họ tên</th>
                        <th>Lớp</th>
                        <th>Bộ môn</th>
                      </tr>
                    </thead>
                    <tbody>
@for (sv of svData.sinhVienChuaDangKy; track sv.id; let i = $index) {
  <tr>
    <td class="text-center">
      <span class="row-number">{{ i + 1 }}</span>
    </td>
                          <td>
                            <span class="student-id">{{ sv.maSinhVien }}</span>
                          </td>
                          <td>
                            <span class="student-name">{{ sv.hoTen }}</span>
                          </td>
                          <td>
                            <span class="student-class">{{ sv.lop || '-' }}</span>
                          </td>
                          <td>
                            <span class="department-tag">{{ sv.tenBoMon || 'Chưa phân bộ' }}</span>
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                }
              </div>
            </div>
          </div>
        </section>
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
    /* 所有样式已移至全局 styles.scss，使用 .dsdd- 前缀 */
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SinhVienService } from '../../../core/services/sinh-vien.service';
import { DeTaiResponse, DotDangKyResponse, GiangVienResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-de-tai-sv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 class="mb-1">
            <span class="material-symbols-outlined me-2">note_add</span>
            Đăng ký đề tài
          </h2>
          <p class="text-muted mb-0 small">Đăng ký đề tài đồ án tốt nghiệp</p>
        </div>
      </div>

    <!-- Form đăng ký (chưa có đề tài) -->
    <div *ngIf="!deTaiCuaToi" class="row">
      <!-- Thông tin đợt đăng ký -->
      <div class="col-lg-4 mb-4" *ngIf="dotList.length > 0">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">
              <span class="material-symbols-outlined me-2">event</span>Đợt đăng ký
            </h5>
          </div>
          <div class="card-body">
            <div *ngFor="let dot of dotList" class="mb-3 pb-3 border-bottom">
              <h6 class="text-primary mb-2">{{ dot.tenDot }}</h6>
              <p class="mb-1 small">
                <span class="material-symbols-outlined me-1" style="font-size: 16px;">school</span>
                {{ dot.namHoc }} - Học kỳ {{ dot.hocKy }}
              </p>
              <p class="mb-0 small" [class.text-danger]="isQuaHan(dot.ngayKetThuc)">
                <span class="material-symbols-outlined me-1" style="font-size: 16px;">schedule</span>
                Hạn: {{ dot.ngayKetThuc | date:'dd/MM/yyyy' }}
                <span *ngIf="isQuaHan(dot.ngayKetThuc)" class="badge bg-danger ms-2">Đã hết hạn</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Form đăng ký -->
      <div class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header">
            <h5 class="mb-0">
              <span class="material-symbols-outlined me-2">edit</span>Thông tin đề tài
            </h5>
          </div>
          <div class="card-body">
            <form (ngSubmit)="dangKy()" *ngIf="!daDangKy">
              <div class="row g-3">
                <div class="col-md-12">
                  <label class="form-label fw-medium">Đợt đăng ký <span class="text-danger">*</span></label>
                  <select class="form-select" [(ngModel)]="formData.dotDangKyId" name="dotDangKyId" required>
                    <option [value]="null">Chọn đợt đăng ký</option>
                    <option *ngFor="let dot of dotList" [value]="dot.id">{{ dot.tenDot }}</option>
                  </select>
                </div>
              </div>

              <hr class="my-4">

              <h6 class="text-muted mb-3">
                <span class="material-symbols-outlined me-2">description</span>Thông tin đề tài
              </h6>

              <div class="mb-3">
                <label class="form-label fw-medium">Tên đề tài <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="formData.tenDeTai" name="tenDeTai"
                       required placeholder="Nhập tên đề tài của bạn"
                       (input)="onTenDeTaiChange()"
                       [class.is-invalid]="tenDeTaiError || tenDeTaiTrungError">
                <div class="invalid-feedback d-block" *ngIf="tenDeTaiError">
                  {{ tenDeTaiError }}
                </div>
                <div class="invalid-feedback d-block" *ngIf="tenDeTaiTrungError">
                  {{ tenDeTaiTrungError }}
                </div>
                <small class="text-muted">
                  <span class="material-symbols-outlined" style="font-size: 14px;">info</span>
                  Tên đề tài phải bắt đầu bằng:
                  <strong>Xây dựng</strong>, <strong>Nghiên cứu</strong>, <strong>Phát triển</strong>,
                  <strong>Thiết kế</strong>, <strong>Ứng dụng</strong>
                </small>
              </div>

              <div class="row g-3 mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-medium">Giảng viên hướng dẫn dự kiến</label>
                  <select class="form-select" [(ngModel)]="formData.giangVienDuKienId" name="giangVienDuKienId">
                    <option [value]="null">-- Chọn giảng viên --</option>
                    <option *ngFor="let gv of giangVienList" [value]="gv.id">
                      {{ gv.hoTen }} {{ gv.hocVi ? '- ' + gv.hocVi : '' }} {{ gv.tenBoMon ? '- ' + gv.tenBoMon : '' }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-medium">Công nghệ sử dụng</label>
                  <input type="text" class="form-control" [(ngModel)]="formData.congNgheSuDung" name="congNgheSuDung" placeholder="VD: Java, Python, React...">
                </div>
              </div>

              <div class="mb-4">
                <label class="form-label fw-medium">Nội dung dự kiến</label>
                <textarea class="form-control" [(ngModel)]="formData.noiDungDuKien" name="noiDungDuKien" rows="3" placeholder="Mô tả ngắn gọn nội dung đề tài"></textarea>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary" [disabled]="!!tenDeTaiError">
                  <span class="material-symbols-outlined me-1">check</span>Đăng ký
                </button>
                <button type="button" class="btn btn-outline-secondary" (click)="resetForm()">
                  <span class="material-symbols-outlined me-1">refresh</span>Nhập lại
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Đã có đề tài -->
    <div *ngIf="deTaiCuaToi" class="row">
      <div class="col-12">
        <div class="card shadow-sm">
          <!-- Header với trạng thái -->
          <div class="card-header text-white" [ngClass]="{
            'bg-danger': laTrangThaiThatBai(deTaiCuaToi.trangThai),
            'bg-warning text-dark': deTaiCuaToi.trangThai === 'GV_TU_CHOI',
            'bg-success': !laTrangThaiThatBai(deTaiCuaToi.trangThai) && deTaiCuaToi.trangThai !== 'GV_TU_CHOI'
          }">
            <div class="d-flex justify-content-between align-items-center">
              <h5 class="mb-0">
                <span class="material-symbols-outlined me-2" [ngClass]="{
                  'text-danger': laTrangThaiThatBai(deTaiCuaToi.trangThai),
                  'text-dark': deTaiCuaToi.trangThai === 'GV_TU_CHOI',
                  'text-white': !laTrangThaiThatBai(deTaiCuaToi.trangThai) && deTaiCuaToi.trangThai !== 'GV_TU_CHOI'
                }">{{ getStatusIcon(deTaiCuaToi.trangThai) }}</span>
                {{ getStatusTitle(deTaiCuaToi.trangThai) }}
              </h5>
              <span [class]="getStatusClass(deTaiCuaToi.trangThai)" class="badge fs-6">
                {{ getStatusText(deTaiCuaToi.trangThai) }}
              </span>
            </div>
          </div>

          <div class="card-body">
            <div class="row g-4">
              <!-- Thông tin đề tài -->
              <div class="col-lg-8">
                <div class="mb-4">
                  <label class="text-muted small text-uppercase">
                    <span class="material-symbols-outlined me-1" style="font-size: 16px;">title</span>
                    Tên đề tài
                  </label>
                  <h4 class="mb-0 text-primary">{{ deTaiCuaToi.tenDeTai }}</h4>
                </div>

                <div class="row g-3">
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded">
                      <label class="text-muted small text-uppercase d-block mb-1">
                        <span class="material-symbols-outlined me-1" style="font-size: 14px;">description</span>
                        Nội dung
                      </label>
                      <p class="mb-0 fw-medium">{{ deTaiCuaToi.noiDungDuKien || 'Chưa cập nhật' }}</p>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="p-3 bg-light rounded">
                      <label class="text-muted small text-uppercase d-block mb-1">
                        <span class="material-symbols-outlined me-1" style="font-size: 14px;">code</span>
                        Công nghệ
                      </label>
                      <p class="mb-0 fw-medium">{{ deTaiCuaToi.congNgheSuDung || 'Chưa cập nhật' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Thông tin GV -->
              <div class="col-lg-4">
                <div class="p-3 border rounded">
                  <label class="text-muted small text-uppercase d-block mb-2">
                    <span class="material-symbols-outlined me-1" style="font-size: 14px;">person</span>
                    Giảng viên hướng dẫn
                  </label>
                  <p class="mb-0 fw-medium fs-5">{{ deTaiCuaToi.hoTenGiangVienDuKien || 'Chưa phân công' }}</p>
                </div>

                <div *ngIf="deTaiCuaToi.ghiChu && (laTrangThaiThatBai(deTaiCuaToi.trangThai) || deTaiCuaToi.trangThai === 'GV_TU_CHOI')" class="alert alert-danger mt-3 mb-0">
                  <span class="material-symbols-outlined me-2">warning</span>
                  <strong>Lý do:</strong> {{ deTaiCuaToi.ghiChu }}
                </div>
              </div>
            </div>

            <!-- Nút đăng ký lại -->
            <div *ngIf="laTrangThaiThatBai(deTaiCuaToi.trangThai)" class="mt-4 pt-3 border-top">
              <button class="btn btn-danger" (click)="hienThiFormDangKyLai()">
                <span class="material-symbols-outlined me-2">restart_alt</span>Đăng ký lại đề tài khác
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal đăng ký lại -->
    <div class="modal fade" id="dangKyLaiModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <span class="material-symbols-outlined me-2">restart_alt</span>Đăng ký lại đề tài
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="dangKyLai()">
              <div class="mb-3">
                <label class="form-label fw-medium">Đợt đăng ký <span class="text-danger">*</span></label>
                <select class="form-select" [(ngModel)]="formData.dotDangKyId" name="dotDangKyId" required>
                  <option [value]="null">Chọn đợt đăng ký</option>
                  <option *ngFor="let dot of dotList" [value]="dot.id">{{ dot.tenDot }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-medium">Tên đề tài <span class="text-danger">*</span></label>
                <input type="text" class="form-control" [(ngModel)]="formData.tenDeTai" name="tenDeTai"
                       required placeholder="Nhập tên đề tài mới"
                       (input)="onTenDeTaiChange()"
                       [class.is-invalid]="tenDeTaiError || tenDeTaiTrungError">
                <div class="invalid-feedback d-block" *ngIf="tenDeTaiError">
                  {{ tenDeTaiError }}
                </div>
                <div class="invalid-feedback d-block" *ngIf="tenDeTaiTrungError">
                  {{ tenDeTaiTrungError }}
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label fw-medium">Giảng viên hướng dẫn dự kiến</label>
                <select class="form-select" [(ngModel)]="formData.giangVienDuKienId" name="giangVienDuKienId">
                  <option [value]="null">-- Chọn giảng viên --</option>
                  <option *ngFor="let gv of giangVienList" [value]="gv.id">
                    {{ gv.hoTen }} {{ gv.hocVi ? '- ' + gv.hocVi : '' }} {{ gv.tenBoMon ? '- ' + gv.tenBoMon : '' }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-medium">Công nghệ sử dụng</label>
                <input type="text" class="form-control" [(ngModel)]="formData.congNgheSuDung" name="congNgheSuDung" placeholder="VD: Java, Python...">
              </div>
              <div class="mb-3">
                <label class="form-label fw-medium">Nội dung dự kiến</label>
                <textarea class="form-control" [(ngModel)]="formData.noiDungDuKien" name="noiDungDuKien" rows="3" placeholder="Mô tả nội dung đề tài"></textarea>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary" [disabled]="!!tenDeTaiError">Đăng ký lại</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </div>
  `,
  styles: [`
    .card {
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .card:hover {
      box-shadow: 0 4px 12px rgba(0,0,0,0.1) !important;
    }
    .form-control:focus, .form-select:focus {
      border-color: #0d6efd;
      box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.15);
    }
    .form-label {
      color: #495057;
    }
    .bg-light {
      background-color: #f8f9fa !important;
    }
  `]
})
export class DeTaiSvComponent implements OnInit {
  dotList: DotDangKyResponse[] = [];
  giangVienList: GiangVienResponse[] = [];
  deTaiCuaToi: DeTaiResponse | null = null;
  daDangKy = false;
  formData: any = {};
  tenDeTaiError: string | null = null;
  tenDeTaiTrungError: string | null = null;

  // Danh sách tiền tố hợp lệ
  tienToHopLe = ['Xây dựng', 'Nghiên cứu', 'Phát triển', 'Thiết kế', 'Ứng dụng'];

  constructor(
    private svService: SinhVienService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.svService.getDotDangKyDangMo().subscribe({
      next: (res) => {
        if (res.success) {
          this.dotList = res.data;
        }
      },
      error: (err) => console.error('Lỗi load đợt đăng ký:', err)
    });

    this.svService.getGiangVienList().subscribe({
      next: (res) => {
        if (res.success) {
          this.giangVienList = res.data;
        }
      },
      error: (err) => console.error('Lỗi load giảng viên:', err)
    });

    this.svService.getDeTaiCuaToi().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.deTaiCuaToi = res.data;
          this.daDangKy = true;
        }
      },
      error: (err) => console.error('Lỗi load đề tài:', err)
    });
  }

  hienThiFormDangKyLai(): void {
    this.formData = {};
    const modal = new (window as any).bootstrap.Modal(document.getElementById('dangKyLaiModal'));
    modal.show();
  }

  dangKyLai(): void {
    if (!this.formData.tenDeTai || !this.formData.dotDangKyId) {
      this.toastr.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Hybrid approach:
    // - BI_TU_CHOI: cập nhật đề tài cũ (dangKyLaiDeTai)
    // - KHONG_DAT_*: tạo đề tài mới (dangKyDeTai)
    if (this.deTaiCuaToi!.trangThai === 'BI_TU_CHOI') {
      this.svService.dangKyLaiDeTai(this.deTaiCuaToi!.id, this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Đăng ký lại thành công!');
            this.tenDeTaiTrungError = null;
            const modalEl = document.getElementById('dangKyLaiModal');
            if (modalEl) {
              const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
            }
            this.loadData();
          }
        },
        error: (err) => {
          const msg = err.error?.message || 'Đăng ký lại thất bại';
          if (msg.includes('đã tồn tại')) {
            this.tenDeTaiTrungError = msg;
          } else {
            this.toastr.error(msg);
          }
        }
      });
    } else {
      // KHONG_DAT_GVHD, KHONG_DAT_PHAN_BIEN, KHONG_DAT_BAO_VE: tạo đề tài mới
      this.svService.dangKyDeTai(this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Đăng ký đề tài mới thành công!');
            this.tenDeTaiTrungError = null;
            const modalEl = document.getElementById('dangKyLaiModal');
            if (modalEl) {
              const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
            }
            this.loadData();
          }
        },
        error: (err) => {
          const msg = err.error?.message || 'Đăng ký đề tài thất bại';
          if (msg.includes('đã tồn tại')) {
            this.tenDeTaiTrungError = msg;
          } else {
            this.toastr.error(msg);
          }
        }
      });
    }
  }

  dangKy(): void {
    if (!this.formData.tenDeTai || !this.formData.dotDangKyId) {
      this.toastr.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    this.svService.dangKyDeTai(this.formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Đăng ký thành công!');
          this.tenDeTaiTrungError = null;
          this.loadData();
        }
      },
      error: (err) => {
        const msg = err.error?.message || 'Đăng ký thất bại';
        if (msg.includes('đã tồn tại')) {
          this.tenDeTaiTrungError = msg;
        } else {
          this.toastr.error(msg);
        }
      }
    });
  }

  laTrangThaiThatBai(trangThai: string): boolean {
    const trangThaiThatBai = [
      'BI_TU_CHOI',
      'KHONG_DAT_GVHD',
      'KHONG_DAT_PHAN_BIEN',
      'KHONG_DAT_BAO_VE'
    ];
    return trangThaiThatBai.includes(trangThai);
  }

  getStatusClass(status: string): string {
    const map: any = {
      'BI_TU_CHOI': 'bg-danger',
      'CHO_BO_MON_DUYET': 'bg-warning',
      'CHO_GV_DUYET': 'bg-warning',
      'GV_TU_CHOI': 'bg-warning',
      'CHO_GV_PHAN_CONG': 'bg-warning',
      'CHO_BO_MON_PHAN_CONG': 'bg-warning',
      'DANG_THUC_HIEN': 'bg-info',
      'DA_NOP_BAO_CAO': 'bg-info',
      'DAT_GVHD': 'bg-success',
      'KHONG_DAT_GVHD': 'bg-danger',
      'DAT_PHAN_BIEN': 'bg-success',
      'KHONG_DAT_PHAN_BIEN': 'bg-danger',
      'DANG_BAO_VE': 'bg-primary',
      'HOAN_THANH': 'bg-primary'
    };
    return map[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const map: any = {
      'BI_TU_CHOI': 'Bị từ chối',
      'CHO_BO_MON_DUYET': 'Chờ BM duyệt',
      'CHO_GV_DUYET': 'Chờ GV duyệt',
      'GV_TU_CHOI': 'GV từ chối',
      'CHO_GV_PHAN_CONG': 'Chờ phân công GVHD',
      'CHO_BO_MON_PHAN_CONG': 'Chờ BM xác nhận',
      'DANG_THUC_HIEN': 'Đang thực hiện',
      'DA_NOP_BAO_CAO': 'Đã nộp báo cáo',
      'DAT_GVHD': 'Đạt HD',
      'KHONG_DAT_GVHD': 'Không đạt HD',
      'DAT_PHAN_BIEN': 'Đạt PB',
      'KHONG_DAT_PHAN_BIEN': 'Không đạt PB',
      'DANG_BAO_VE': 'Đang bảo vệ',
      'HOAN_THANH': 'Hoàn thành'
    };
    return map[status] || status;
  }

  getStatusIcon(status: string): string {
    if (this.laTrangThaiThatBai(status)) {
      return 'cancel';
    } else if (status === 'GV_TU_CHOI') {
      return 'hourglass_empty';
    }
    return 'check_circle';
  }

  getStatusTitle(status: string): string {
    if (this.laTrangThaiThatBai(status)) {
      return 'Đề tài bị từ chối';
    } else if (status === 'GV_TU_CHOI') {
      return 'Đề tài đang chờ GVHD khác duyệt';
    }
    return 'Đề tài của bạn';
  }

  isQuaHan(ngayKetThuc: string): boolean {
    return new Date(ngayKetThuc) < new Date();
  }

  // Validate tên đề tài
  onTenDeTaiChange(): void {
    const tenDeTai = this.formData.tenDeTai?.trim();
    if (!tenDeTai) {
      this.tenDeTaiError = null;
      return;
    }

    const lowerTenDeTai = tenDeTai.toLowerCase();
    const hopLe = this.tienToHopLe.some(tienTo =>
      lowerTenDeTai.startsWith(tienTo.toLowerCase())
    );

    if (!hopLe) {
      this.tenDeTaiError = 'Tên đề tài phải bắt đầu bằng: ' + this.tienToHopLe.join(', ');
    } else {
      this.tenDeTaiError = null;
    }
  }

  // Reset form
  resetForm(): void {
    this.formData = {};
    this.tenDeTaiError = null;
  }
}

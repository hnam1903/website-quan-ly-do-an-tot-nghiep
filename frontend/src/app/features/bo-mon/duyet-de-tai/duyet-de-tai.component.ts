import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { DeTaiResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-duyet-de-tai',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-warning-subtle">
          <span class="material-symbols-outlined">fact_check</span>
        </div>
        <div>
          <h2>Duyệt đề tài</h2>
          <p class="mb-0">Xem xét và phê duyệt đề tài từ sinh viên</p>
        </div>
      </div>
      <span class="badge bg-warning text-dark">
        <span class="material-symbols-outlined me-1">hourglass_empty</span>{{ deTaiList.length }} đề tài chờ duyệt
      </span>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th style="width: 160px">GV dự kiến</th>
                <th style="width: 100px" class="text-center">Chi tiết</th>
                <th style="width: 180px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of deTaiList; let i = index" class="align-middle">
                <td class="text-center">
                  <span class="stt-badge">{{ i + 1 }}</span>
                </td>
                <td>
                  <strong class="text-dark">{{ dt.hoTenSinhVien }}</strong>
                  <br>
                  <small class="text-secondary">{{ dt.maSinhVien }} - {{ dt.lopSinhVien }}</small>
                </td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 280px">
                    <strong>{{ dt.tenDeTai }}</strong>
                  </span>
                  <br>
                  <small class="text-muted" *ngIf="dt.noiDungDuKien">{{ dt.noiDungDuKien | slice:0:80 }}...</small>
                </td>
                <td>
                  <span *ngIf="dt.hoTenGiangVienDuKien; else noGv">
                    <span class="material-symbols-outlined me-1">person</span>{{ dt.hoTenGiangVienDuKien }}
                  </span>
                  <ng-template #noGv><span class="text-muted fst-italic">Chưa có</span></ng-template>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary btn-icon" (click)="xemChiTiet(dt)" title="Xem chi tiết">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-success btn-icon" (click)="duyetDeTai(dt)" title="Duyệt đề tài">
                      <span class="material-symbols-outlined">check_circle</span>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-icon" (click)="openTuChoiModal(dt)" title="Từ chối">
                      <span class="material-symbols-outlined">cancel</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="deTaiList.length === 0">
                <td colspan="6" class="text-center py-5">
                  <div class="empty-state">
                    <span class="material-symbols-outlined text-success fs-1 d-block mb-3">task_alt</span>
                    <p class="mb-1 fw-semibold">Không có đề tài nào cần duyệt</p>
                    <small class="text-muted">Tất cả đề tài đã được xử lý</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Từ chối -->
    <div class="modal-overlay" *ngIf="showTuChoiModal" (click)="showTuChoiModal = false">
      <div class="modal-dialog modal-dialog-centered" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title"><span class="material-symbols-outlined me-2">cancel</span>Từ chối đề tài</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showTuChoiModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning mb-3">
              <strong>{{ selectedDeTai?.tenDeTai }}</strong><br>
              <small>SV: {{ selectedDeTai?.hoTenSinhVien }}</small>
            </div>
            <p class="text-muted mb-3">Sinh viên sẽ phải <strong>đăng ký lại đề tài khác</strong>.</p>
            <div class="mb-3">
              <label class="form-label">Lý do từ chối (không bắt buộc):</label>
              <textarea class="form-control" rows="3" [(ngModel)]="lyDoTuChoi" placeholder="Nhập lý do từ chối..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showTuChoiModal = false">
              <span class="material-symbols-outlined me-1">close</span>Hủy
            </button>
            <button type="button" class="btn btn-danger" (click)="confirmTuChoi()">
              <span class="material-symbols-outlined me-1">cancel</span>Xác nhận từ chối
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xem Chi tiết -->
    <div class="modal-overlay" *ngIf="showChiTietModal" (click)="showChiTietModal = false">
      <div class="modal-dialog modal-dialog-centered modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title"><span class="material-symbols-outlined me-2">info</span>Chi tiết đề tài</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showChiTietModal = false"></button>
          </div>
          <div class="modal-body" *ngIf="selectedDeTai">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Mã sinh viên</label>
                  <p class="info-value"><code>{{ selectedDeTai.maSinhVien }}</code></p>
                </div>
                <div class="info-group">
                  <label class="info-label">Họ tên</label>
                  <p class="info-value">{{ selectedDeTai.hoTenSinhVien }}</p>
                </div>
                <div class="info-group">
                  <label class="info-label">Lớp</label>
                  <p class="info-value">{{ selectedDeTai.lopSinhVien }}</p>
                </div>
                <div class="info-group">
                  <label class="info-label">GV Dự kiến</label>
                  <p class="info-value">{{ selectedDeTai.hoTenGiangVienDuKien || 'Chưa có' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Công nghệ sử dụng</label>
                  <p class="info-value">{{ selectedDeTai.congNgheSuDung || 'Chưa có' }}</p>
                </div>
              </div>
              <div class="col-12">
                <hr>
                <div class="info-group">
                  <label class="info-label">Tên đề tài</label>
                  <p class="info-title">{{ selectedDeTai.tenDeTai }}</p>
                </div>
                <div class="info-group mb-0">
                  <label class="info-label">Nội dung dự kiến</label>
                  <p class="info-value">{{ selectedDeTai.noiDungDuKien || 'Chưa có nội dung' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showChiTietModal = false">
              <span class="material-symbols-outlined me-1">close</span>Đóng
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận Duyệt -->
    <div class="modal-overlay" *ngIf="showDuyetModal" (click)="showDuyetModal = false">
      <div class="modal-dialog modal-dialog-centered" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title"><span class="material-symbols-outlined me-2">check_circle</span>Xác nhận duyệt đề tài</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showDuyetModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-success mb-3">
              <strong>{{ selectedDeTai?.tenDeTai }}</strong><br>
              <small>SV: {{ selectedDeTai?.hoTenSinhVien }}</small>
            </div>
            <p>Đề tài sẽ được đưa vào <strong>danh sách đề tài đang thực hiện</strong>.</p>
            <p class="text-muted small mb-0">Bộ môn sẽ tiến hành phân công giảng viên hướng dẫn.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showDuyetModal = false">
              <span class="material-symbols-outlined me-1">close</span>Hủy
            </button>
            <button type="button" class="btn btn-success" (click)="confirmDuyet()">
              <span class="material-symbols-outlined me-1">check_circle</span>Xác nhận duyệt
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DuyetDeTaiComponent implements OnInit {
  deTaiList: DeTaiResponse[] = [];
  selectedDeTai: DeTaiResponse | null = null;
  showTuChoiModal = false;
  showDuyetModal = false;
  showChiTietModal = false;
  lyDoTuChoi = '';

  constructor(
    private boMonService: BoMonService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDeTai();
  }

  loadDeTai(): void {
    this.boMonService.getDeTai('DA_GUI_BO_MON').subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiList = res.data;
        }
      },
      error: (err) => {
        this.toastr.error('Không thể tải danh sách');
      }
    });
  }

  duyetDeTai(dt: DeTaiResponse): void {
    this.selectedDeTai = dt;
    this.showDuyetModal = true;
  }

  confirmDuyet(): void {
    if (!this.selectedDeTai) return;

    this.boMonService.duyetDeTai(this.selectedDeTai.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Đã duyệt đề tài! Chuyển vào danh sách đang thực hiện.');
          this.showDuyetModal = false;
          this.selectedDeTai = null;
          this.loadDeTai();
        }
      }
    });
  }

  openTuChoiModal(dt: DeTaiResponse): void {
    this.selectedDeTai = dt;
    this.lyDoTuChoi = '';
    this.showTuChoiModal = true;
  }

  confirmTuChoi(): void {
    if (!this.selectedDeTai) return;

    this.boMonService.tuChoiDeTai(this.selectedDeTai.id, this.lyDoTuChoi).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.warning('Đã từ chối! Sinh viên sẽ đăng ký lại với Admin.');
          this.showTuChoiModal = false;
          this.selectedDeTai = null;
          this.lyDoTuChoi = '';
          this.loadDeTai();
        } else {
          this.toastr.error(res.message || 'Không thể từ chối đề tài');
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Không thể từ chối đề tài');
      }
    });
  }

  xemChiTiet(dt: DeTaiResponse): void {
    this.selectedDeTai = dt;
    this.showChiTietModal = true;
  }
}

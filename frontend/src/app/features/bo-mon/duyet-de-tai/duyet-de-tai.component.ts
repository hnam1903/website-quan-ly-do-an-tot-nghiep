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
      <h2>Duyệt đề tài từ Admin</h2>
      <p class="text-muted mb-0">Xem xét và duyệt/từ chối đề tài sinh viên đã được Admin gửi lên</p>
    </div>

  
    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center bg-warning text-dark">
        <span><i class="bi bi-inbox me-2"></i>Đề tài chờ duyệt ({{ deTaiList.length }})</span>
        <button class="btn btn-sm btn-primary" (click)="loadDeTai()">
          <i class="bi bi-arrow-clockwise"></i> Làm mới
        </button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th width="50">STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th>Công nghệ</th>
                <th>GV dự kiến</th>
                <th width="200">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of deTaiList; let i = index">
                <td>{{ i + 1 }}</td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong><br>
                  <small class="text-muted">{{ dt.maSinhVien }} - {{ dt.lopSinhVien }}</small>
                </td>
                <td>
                  <strong>{{ dt.tenDeTai }}</strong><br>
                  <small class="text-muted" *ngIf="dt.noiDungDuKien">{{ dt.noiDungDuKien | slice:0:100 }}...</small>
                </td>
                <td>{{ dt.congNgheSuDung || '-' }}</td>
                <td>{{ dt.hoTenGiangVienDuKien || '-' }}</td>
                <td>
                  <button class="btn btn-sm btn-success me-1" (click)="duyetDeTai(dt)">
                    <i class="bi bi-check-circle"></i> Duyệt
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="openTuChoiModal(dt)">
                    <i class="bi bi-x-circle"></i> Từ chối
                  </button>
                </td>
              </tr>
              <tr *ngIf="deTaiList.length === 0">
                <td colspan="6" class="text-center text-muted py-5">
                  <i class="bi bi-check-circle fs-1 d-block text-success mb-2"></i>
                  Không có đề tài nào cần duyệt
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Từ chối -->
    <div class="modal fade show d-block" *ngIf="showTuChoiModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title"><i class="bi bi-x-circle me-2"></i>Từ chối đề tài</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showTuChoiModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-warning">
              <strong>{{ selectedDeTai?.tenDeTai }}</strong><br>
              <small>SV: {{ selectedDeTai?.hoTenSinhVien }}</small>
            </div>
            <p>Sinh viên sẽ phải <strong>đăng ký lại đề tài khác</strong>.</p>
            <div class="mb-3">
              <label class="form-label">Lý do từ chối (không bắt buộc):</label>
              <textarea class="form-control" rows="3" [(ngModel)]="lyDoTuChoi"
                        placeholder="Nhập lý do từ chối..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showTuChoiModal = false">
              <i class="bi bi-x-lg me-1"></i>Hủy
            </button>
            <button type="button" class="btn btn-danger" (click)="confirmTuChoi()">
              <i class="bi bi-x-circle me-1"></i>Xác nhận từ chối
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Xác nhận Duyệt -->
    <div class="modal fade show d-block" *ngIf="showDuyetModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title"><i class="bi bi-check-circle me-2"></i>Xác nhận duyệt đề tài</h5>
            <button type="button" class="btn-close btn-close-white" (click)="showDuyetModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-success">
              <strong>{{ selectedDeTai?.tenDeTai }}</strong><br>
              <small>SV: {{ selectedDeTai?.hoTenSinhVien }}</small>
            </div>
            <p>Đề tài sẽ được đưa vào <strong>danh sách đề tài đang thực hiện</strong>.</p>
            <p class="text-muted small mb-0">Bộ môn sẽ tiến hành phân công giảng viên hướng dẫn.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showDuyetModal = false">
              <i class="bi bi-x-lg me-1"></i>Hủy
            </button>
            <button type="button" class="btn btn-success" (click)="confirmDuyet()">
              <i class="bi bi-check-circle me-1"></i>Xác nhận duyệt
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
        }
      }
    });
  }
}

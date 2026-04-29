import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DotDangKyResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-dot-dang-ky',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-info-subtle">
          <span class="material-symbols-outlined">event</span>
        </div>
        <div>
          <h2>Quản lý đợt đăng ký</h2>
          <p class="mb-0">Thiết lập và quản lý các đợt đăng ký đề tài</p>
        </div>
      </div>
      <button class="btn btn-primary" (click)="showModal = true">
        <span class="material-symbols-outlined me-2">add_circle</span>Tạo đợt mới
      </button>
    </div>

    <div class="card">
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
                <th style="width: 80px" class="text-center">SL ĐK</th>
                <th style="width: 200px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dot of dotList; let i = index" class="align-middle">
                <td class="text-center">
                  <span class="stt-badge">{{ i + 1 }}</span>
                </td>
                <td>
                  <strong class="text-dark">{{ dot.tenDot }}</strong>
                </td>
                <td>{{ dot.namHoc }}</td>
                <td>{{ dot.hocKy === 1 ? 'HK1' : dot.hocKy === 2 ? 'HK2' : 'HKH' }}</td>
                <td>{{ dot.ngayBatDau | date:'dd/MM/yyyy' }}</td>
                <td>{{ dot.ngayKetThuc | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span [class]="getStatusClass(dot.trangThai)" class="badge">
                    <span class="material-symbols-outlined" style="font-size: 14px;">{{ dot.trangThai === 'DANG_MO' ? 'check_circle' : 'schedule' }}</span>
                    {{ dot.trangThai === 'DANG_MO' ? 'Đang mở' : 'Đã kết thúc' }}
                  </span>
                </td>
                <td class="text-center">
                  <span class="count-badge">{{ dot.soLuongDangKy || 0 }}</span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button *ngIf="dot.trangThai === 'DANG_MO'"
                            class="btn btn-sm btn-outline-warning btn-icon"
                            (click)="dongDot(dot)" title="Đóng đợt">
                      <span class="material-symbols-outlined">lock</span>
                    </button>
                    <button *ngIf="dot.trangThai === 'KET_THUC'"
                            class="btn btn-sm btn-outline-success btn-icon"
                            (click)="moLaiDot(dot)" title="Mở lại">
                      <span class="material-symbols-outlined">lock_open</span>
                    </button>
                    <button class="btn btn-sm btn-outline-primary btn-icon" (click)="editDot(dot)" title="Sửa">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-icon" (click)="deleteDot(dot.id)" title="Xóa">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="dotList.length === 0">
                <td colspan="9" class="text-center py-5">
                  <div class="empty-state">
                    <span class="material-symbols-outlined fs-1 d-block mb-3">event_busy</span>
                    <p class="mb-1 fw-semibold">Chưa có đợt đăng ký nào</p>
                    <small class="text-muted">Nhấn "Tạo đợt mới" để bắt đầu</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-dialog modal-dialog-centered" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <span class="material-symbols-outlined me-2">{{ isEditing ? 'edit' : 'event' }}</span>
              {{ isEditing ? 'Cập nhật' : 'Tạo' }} đợt đăng ký
            </h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <label class="form-label">Tên đợt <span class="text-danger">*</span></label>
              <input type="text" class="form-control" [(ngModel)]="formData.tenDot" placeholder="VD: Đợt đăng ký HK1 2024-2025">
            </div>
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label">Năm học</label>
                <input type="text" class="form-control" [(ngModel)]="formData.namHoc" placeholder="VD: 2024-2025">
              </div>
              <div class="col-md-6">
                <label class="form-label">Học kỳ</label>
                <select class="form-select" [(ngModel)]="formData.hocKy">
                  <option [value]="1">Học kỳ 1</option>
                  <option [value]="2">Học kỳ 2</option>
                  <option [value]="3">Học kỳ hè</option>
                </select>
              </div>
            </div>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Ngày bắt đầu <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [(ngModel)]="formData.ngayBatDau" required>
              </div>
              <div class="col-md-6">
                <label class="form-label">Ngày kết thúc <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [(ngModel)]="formData.ngayKetThuc" required>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="button" class="btn btn-primary" (click)="saveDot()">
              <span class="material-symbols-outlined me-1">check</span>{{ isEditing ? 'Cập nhật' : 'Tạo mới' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DotDangKyComponent implements OnInit {
  dotList: DotDangKyResponse[] = [];
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  formData: any = {
    hocKy: 1
  };

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
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
      }
    });
  }

  getStatusClass(status: string): string {
    return status === 'DANG_MO' ? 'bg-success' : 'bg-secondary';
  }

  editDot(dot: DotDangKyResponse): void {
    this.isEditing = true;
    this.editingId = dot.id;
    this.formData = {
      tenDot: dot.tenDot,
      namHoc: dot.namHoc,
      hocKy: dot.hocKy,
      ngayBatDau: dot.ngayBatDau.split('T')[0],
      ngayKetThuc: dot.ngayKetThuc.split('T')[0]
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = null;
    this.formData = { hocKy: 1 };
  }

  saveDot(): void {
    if (this.isEditing && this.editingId) {
      this.adminService.updateDotDangKy(this.editingId, this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Cập nhật thành công!');
            this.loadDotList();
            this.closeModal();
          }
        }
      });
    } else {
      this.adminService.createDotDangKy(this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Tạo đợt đăng ký thành công!');
            this.loadDotList();
            this.closeModal();
          }
        }
      });
    }
  }

  deleteDot(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa đợt đăng ký này?')) {
      this.adminService.deleteDotDangKy(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Xóa thành công!');
            this.loadDotList();
          }
        }
      });
    }
  }

  dongDot(dot: DotDangKyResponse): void {
    if (confirm('Bạn có chắc muốn đóng đợt "' + dot.tenDot + '" không?')) {
      this.adminService.dongDotDangKy(dot.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Đã đóng đợt đăng ký!');
            this.loadDotList();
          }
        }
      });
    }
  }

  moLaiDot(dot: DotDangKyResponse): void {
    if (confirm('Bạn có chắc muốn mở lại đợt "' + dot.tenDot + '" không?')) {
      this.adminService.moLaiDotDangKy(dot.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Đã mở lại đợt đăng ký!');
            this.loadDotList();
          }
        }
      });
    }
  }
}

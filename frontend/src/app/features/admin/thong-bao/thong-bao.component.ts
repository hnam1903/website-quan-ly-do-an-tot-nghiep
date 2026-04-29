import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { ThongBaoResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-thong-bao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-primary-subtle">
          <span class="material-symbols-outlined">campaign</span>
        </div>
        <div>
          <h2>Quản lý Thông báo</h2>
          <p class="mb-0">Tạo và quản lý thông báo cho sinh viên</p>
        </div>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        <span class="material-symbols-outlined me-2">add_circle</span>Thêm Thông báo
      </button>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th>Tiêu đề</th>
                <th>Nội dung</th>
                <th style="width: 160px">Ngày đăng</th>
                <th style="width: 100px">Trạng thái</th>
                <th style="width: 140px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let tb of thongBaoList; let i = index" class="align-middle">
                <td class="text-center">
                  <span class="stt-badge">{{ i + 1 }}</span>
                </td>
                <td>
                  <strong class="text-primary">{{ tb.tieuDe }}</strong>
                </td>
                <td>
                  <span class="text-secondary" [title]="tb.noiDung">
                    {{ tb.noiDung.length > 80 ? (tb.noiDung | slice:0:80) + '...' : tb.noiDung }}
                  </span>
                </td>
                <td>{{ tb.ngayDang | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <span class="badge" [ngClass]="tb.trangThai ? 'badge-success' : 'badge-secondary'">
                    <span class="material-symbols-outlined" style="font-size: 14px;">{{ tb.trangThai ? 'check_circle' : 'visibility_off' }}</span>
                    {{ tb.trangThai ? 'Hiển thị' : 'Ẩn' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary btn-icon" (click)="editThongBao(tb)" title="Sửa">
                      <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="btn btn-sm btn-icon"
                      [ngClass]="tb.trangThai ? 'btn-outline-secondary' : 'btn-outline-success'"
                      (click)="toggleTrangThai(tb)"
                      [title]="tb.trangThai ? 'Ẩn thông báo' : 'Hiển thị thông báo'">
                      <span class="material-symbols-outlined">{{ tb.trangThai ? 'visibility_off' : 'visibility' }}</span>
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-icon" (click)="deleteThongBao(tb.id)" title="Xóa">
                      <span class="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="thongBaoList.length === 0">
                <td colspan="6" class="text-center py-5">
                  <div class="empty-state">
                    <span class="material-symbols-outlined fs-1 d-block mb-3">notifications_off</span>
                    <p class="mb-1 fw-semibold">Chưa có thông báo nào</p>
                    <small class="text-muted">Nhấn "Thêm Thông báo" để tạo thông báo mới</small>
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
              <span class="material-symbols-outlined me-2">{{ isEditing ? 'edit' : 'add_circle' }}</span>
              {{ isEditing ? 'Cập nhật' : 'Thêm' }} Thông báo
            </h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <label class="form-label">Tiêu đề <span class="text-danger">*</span></label>
              <input type="text" class="form-control" [(ngModel)]="formData.tieuDe" placeholder="Nhập tiêu đề thông báo">
            </div>
            <div class="mb-4">
              <label class="form-label">Nội dung <span class="text-danger">*</span></label>
              <textarea class="form-control" rows="4" [(ngModel)]="formData.noiDung" placeholder="Nhập nội dung thông báo"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Trạng thái hiển thị</label>
              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" id="trangThaiSwitch" [(ngModel)]="formData.trangThai">
                <label class="form-check-label" for="trangThaiSwitch">
                  {{ formData.trangThai ? 'Hiển thị' : 'Ẩn' }}
                </label>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="button" class="btn btn-primary" (click)="saveThongBao()" [disabled]="!formData.tieuDe || !formData.noiDung">
              <span class="material-symbols-outlined me-1">check</span>Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ThongBaoComponent implements OnInit {
  thongBaoList: ThongBaoResponse[] = [];
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  formData: any = {
    tieuDe: '',
    noiDung: '',
    trangThai: true
  };

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadThongBao();
  }

  loadThongBao(): void {
    this.adminService.getAllThongBao().subscribe({
      next: (res) => {
        if (res.success) {
          this.thongBaoList = res.data;
        }
      },
      error: (err) => {
        console.error('Lỗi load thông báo:', err);
        this.toastr.error('Không thể tải danh sách thông báo');
      }
    });
  }

  openModal(): void {
    this.isEditing = false;
    this.editingId = null;
    this.formData = {
      tieuDe: '',
      noiDung: '',
      trangThai: true
    };
    this.showModal = true;
  }

  editThongBao(tb: ThongBaoResponse): void {
    this.isEditing = true;
    this.editingId = tb.id;
    this.formData = {
      tieuDe: tb.tieuDe,
      noiDung: tb.noiDung,
      trangThai: tb.trangThai
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = null;
  }

  saveThongBao(): void {
    if (!this.formData.tieuDe || !this.formData.noiDung) {
      this.toastr.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (this.isEditing && this.editingId) {
      this.adminService.updateThongBao(this.editingId, this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Cập nhật thành công!');
            this.loadThongBao();
            this.closeModal();
          }
        },
        error: (err) => {
          this.toastr.error('Cập nhật thất bại');
        }
      });
    } else {
      this.adminService.createThongBao(this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Thêm thành công!');
            this.loadThongBao();
            this.closeModal();
          }
        },
        error: (err) => {
          this.toastr.error('Thêm thất bại');
        }
      });
    }
  }

  toggleTrangThai(tb: ThongBaoResponse): void {
    this.adminService.toggleTrangThaiThongBao(tb.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Cập nhật trạng thái thành công!');
          this.loadThongBao();
        }
      },
      error: (err) => {
        this.toastr.error('Cập nhật trạng thái thất bại');
      }
    });
  }

  deleteThongBao(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa thông báo này?')) {
      this.adminService.deleteThongBao(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Xóa thành công!');
            this.loadThongBao();
          }
        },
        error: (err) => {
          this.toastr.error('Xóa thất bại');
        }
      });
    }
  }
}

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
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h2>Quản lý đợt đăng ký</h2>
        <p class="text-muted mb-0">Tạo và quản lý các đợt đăng ký đồ án</p>
      </div>
      <button class="btn btn-primary" (click)="showModal = true">
        <i class="bi bi-plus-circle me-2"></i>Tạo đợt mới
      </button>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Tên đợt</th>
                <th>Năm học</th>
                <th>Học kỳ</th>
                <th>Ngày bắt đầu</th>
                <th>Ngày kết thúc</th>
                <th>Trạng thái</th>
                <th>SL ĐK</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dot of dotList; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ dot.tenDot }}</td>
                <td>{{ dot.namHoc }}</td>
                <td>{{ dot.hocKy }}</td>
                <td>{{ dot.ngayBatDau | date:'dd/MM/yyyy' }}</td>
                <td>{{ dot.ngayKetThuc | date:'dd/MM/yyyy' }}</td>
                <td>
                  <span [class]="getStatusClass(dot.trangThai)" class="badge">
                    {{ dot.trangThai === 'CHUONG_TRINH' ? 'Đang mở' : 'Đã kết thúc' }}
                  </span>
                </td>
                <td>{{ dot.soLuongDangKy || 0 }}</td>
                <td>
                  <button class="btn btn-sm btn-outline-primary me-1" (click)="editDot(dot)">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger" (click)="deleteDot(dot.id)">
                    <i class="bi bi-trash"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal show d-block" *ngIf="showModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập nhật' : 'Tạo' }} đợt đăng ký</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Tên đợt</label>
              <input type="text" class="form-control" [(ngModel)]="formData.tenDot" placeholder="VD: Đợt đăng ký HK1 2024-2025">
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Năm học</label>
                <input type="text" class="form-control" [(ngModel)]="formData.namHoc" placeholder="VD: 2024-2025">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Học kỳ</label>
                <select class="form-select" [(ngModel)]="formData.hocKy">
                  <option [value]="1">Học kỳ 1</option>
                  <option [value]="2">Học kỳ 2</option>
                  <option [value]="3">Học kỳ hè</option>
                </select>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Ngày bắt đầu</label>
              <input type="date" class="form-control" [(ngModel)]="formData.ngayBatDau">
              <small class="text-muted">Đợt đăng ký sẽ tự động kết thúc sau 7 ngày</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="button" class="btn btn-primary" (click)="saveDot()">
              {{ isEditing ? 'Cập nhật' : 'Tạo mới' }}
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
    return status === 'CHUONG_TRINH' ? 'bg-success' : 'bg-secondary';
  }

  editDot(dot: DotDangKyResponse): void {
    this.isEditing = true;
    this.editingId = dot.id;
    this.formData = {
      tenDot: dot.tenDot,
      namHoc: dot.namHoc,
      hocKy: dot.hocKy,
      ngayBatDau: dot.ngayBatDau.split('T')[0]
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
}

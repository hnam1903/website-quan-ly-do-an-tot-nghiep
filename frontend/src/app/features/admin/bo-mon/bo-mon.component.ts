import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { BoMonResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bo-mon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h2>Quản lý Bộ môn</h2>
        <p class="text-muted mb-0">Thông tin các bộ môn trong khoa</p>
      </div>
      <button class="btn btn-primary" (click)="openModal()">
        <i class="bi bi-plus-circle me-2"></i>Thêm Bộ môn
      </button>
    </div>

    <div class="row">
      <div class="col-md-4 mb-4" *ngFor="let bm of boMonList">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">{{ bm.tenBoMon }}</h5>
            <small>{{ bm.maBoMon }}</small>
          </div>
          <div class="card-body">
            <p><strong>Bộ môn:</strong> {{ bm.tenBoMon }}</p>
            <p><strong>Giảng viên:</strong> {{ bm.soLuongGiangVien || 0 }}</p>
            <p><strong>Sinh viên:</strong> {{ bm.soLuongSinhVien || 0 }}</p>
          </div>
          <div class="card-footer">
            <button class="btn btn-sm btn-outline-primary me-1" (click)="editBoMon(bm)">
              <i class="bi bi-pencil"></i> Sửa
            </button>
            <button class="btn btn-sm btn-outline-danger" (click)="deleteBoMon(bm.id)">
              <i class="bi bi-trash"></i> Xóa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal show d-block" *ngIf="showModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập nhật' : 'Thêm' }} Bộ môn</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Tên bộ môn</label>
              <input type="text" class="form-control" [(ngModel)]="formData.tenBoMon">
            </div>
            <div class="mb-3">
              <label class="form-label">Mã bộ môn</label>
              <input type="text" class="form-control" [(ngModel)]="formData.maBoMon">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="button" class="btn btn-primary" (click)="saveBoMon()">Lưu</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BoMonComponent implements OnInit {
  boMonList: BoMonResponse[] = [];
  showModal = false;
  isEditing = false;
  editingId: number | null = null;
  formData: any = {};

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBoMon();
  }

  loadBoMon(): void {
    this.adminService.getAllBoMon().subscribe({
      next: (res) => {
        if (res.success) {
          this.boMonList = res.data;
        }
      },
      error: (err) => {
        console.error('Lỗi load bộ môn:', err);
        this.toastr.error('Không thể tải danh sách bộ môn');
      }
    });
  }

  openModal(): void {
    this.isEditing = false;
    this.formData = {};
    this.showModal = true;
  }

  editBoMon(bm: BoMonResponse): void {
    this.isEditing = true;
    this.editingId = bm.id;
    this.formData = { tenBoMon: bm.tenBoMon, maBoMon: bm.maBoMon };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = null;
  }

  saveBoMon(): void {
    if (this.isEditing && this.editingId) {
      this.adminService.updateBoMon(this.editingId, this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Cập nhật thành công!');
            this.loadBoMon();
            this.closeModal();
          }
        }
      });
    } else {
      this.adminService.createBoMon(this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Thêm thành công!');
            this.loadBoMon();
            this.closeModal();
          }
        }
      });
    }
  }

  deleteBoMon(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa?')) {
      this.adminService.deleteBoMon(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Xóa thành công!');
            this.loadBoMon();
          }
        }
      });
    }
  }
}

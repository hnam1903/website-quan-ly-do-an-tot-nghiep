import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../../core/services/admin.service';
import { GiangVienResponse, BoMonResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-giang-vien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h2>Quản lý Giảng viên</h2>
       
      </div>
      <div class="d-flex align-items-center">
        <select class="form-select me-3" [(ngModel)]="selectedBoMonId" (change)="loadGiangVien()" style="width: 200px;">
          <option [ngValue]="undefined">-- Tất cả bộ môn --</option>
          <option *ngFor="let bm of boMonList" [ngValue]="bm.id">{{ bm.tenBoMon }}</option>
        </select>
        <button class="btn btn-success me-2" (click)="showImportModal = true">
          <i class="bi bi-upload me-2"></i>Import Excel
        </button>
        <button class="btn btn-primary" (click)="openModal()">
          <i class="bi bi-plus-circle me-2"></i>Thêm Giảng viên
        </button>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Học vị</th>
                <th>Email</th>
                <th>Bộ môn</th>
                <th>Lãnh đạo</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let gv of giangVienList; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ gv.hoTen }}</td>
                <td>{{ gv.hocVi || '-' }}</td>
                <td>{{ gv.email }}</td>
                <td>{{ gv.tenBoMon }}</td>
                <td>
                  <span [class]="gv.laLanhDao ? 'bg-success' : 'bg-secondary'" class="badge">
                    {{ gv.laLanhDao ? 'Lãnh đạo BM' : 'GV' }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-primary me-1" (click)="editGiangVien(gv)">
                    <i class="bi bi-pencil me-1"></i>Sửa
                  </button>
                  <button class="btn btn-sm btn-warning me-1" (click)="toggleLanhDao(gv)">
                    <i class="bi bi-person-check me-1"></i>{{ gv.laLanhDao ? 'Hủy LĐ' : 'Đặt LĐ' }}
                  </button>
                  <button class="btn btn-sm btn-danger" (click)="deleteGiangVien(gv.id)">
                    <i class="bi bi-trash me-1"></i>Xóa
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Thêm/Sửa -->
    <div class="modal show d-block" *ngIf="showModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Cập nhật' : 'Thêm' }} Giảng viên</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Họ tên</label>
              <input type="text" class="form-control" [(ngModel)]="formData.hoTen">
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" [(ngModel)]="formData.email">
            </div>
            <div class="mb-3">
              <label class="form-label">Mật khẩu {{ isEditing ? '(để trống nếu không đổi)' : '' }}</label>
              <input type="password" class="form-control" [(ngModel)]="formData.password">
            </div>
            <div class="mb-3">
              <label class="form-label">Học vị</label>
              <select class="form-select" [(ngModel)]="formData.hocVi">
                <option value="">Chọn học vị</option>
                <option value="ThS">Thạc sĩ</option>
                <option value="TS">Tiến sĩ</option>
                <option value="PGS">Phó giáo sư</option>
                <option value="GS">Giáo sư</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Bộ môn</label>
              <select class="form-select" [(ngModel)]="formData.boMonId">
                <option [value]="null">Chọn bộ môn</option>
                <option *ngFor="let bm of boMonList" [value]="bm.id">{{ bm.tenBoMon }}</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="button" class="btn btn-primary" (click)="saveGiangVien()">Lưu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Import -->
    <div class="modal show d-block" *ngIf="showImportModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Import Giảng viên từ Excel</h5>
            <button type="button" class="btn-close" (click)="showImportModal = false; importFile = null;"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Chọn file Excel (.xlsx)</label>
              <input type="file" class="form-control" (change)="onFileSelected($event)" accept=".xlsx,.xls">
            </div>
            <div *ngIf="importResult" class="mt-3">
              <div class="alert" [class.alert-success]="importResult.successCount > 0" [class.alert-danger]="importResult.errorCount > 0">
                <strong>Thành công:</strong> {{ importResult.successCount }} | <strong>Lỗi:</strong> {{ importResult.errorCount }}
              </div>
              <ul *ngIf="importResult.errors?.length > 0" class="list-group mt-2" style="max-height: 150px; overflow-y: auto;">
                <li class="list-group-item list-group-item-danger py-1" *ngFor="let err of importResult.errors">
                  {{ err }}
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="showImportModal = false; importFile = null;">Đóng</button>
            <button type="button" class="btn btn-success" (click)="importGiangVien()" [disabled]="!importFile || importing">
              <i class="bi bi-upload me-2"></i>{{ importing ? 'Đang import...' : 'Import' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class GiangVienComponent implements OnInit {
  giangVienList: GiangVienResponse[] = [];
  boMonList: BoMonResponse[] = [];
  selectedBoMonId?: number;
  showModal = false;
  showImportModal = false;
  isEditing = false;
  editingId: number | null = null;
  formData: any = {};
  importFile: File | null = null;
  importing = false;
  importResult: any = null;

  constructor(
    private adminService: AdminService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadGiangVien();
    this.loadBoMon();
  }

  loadGiangVien(): void {
    this.adminService.getAllGiangVien(this.selectedBoMonId).subscribe({
      next: (res) => {
        if (res.success) {
          this.giangVienList = res.data;
        }
      }
    });
  }

  loadBoMon(): void {
    this.adminService.getAllBoMon().subscribe({
      next: (res) => {
        if (res.success) {
          this.boMonList = res.data;
        }
      }
    });
  }

  openModal(): void {
    this.isEditing = false;
    this.formData = {};
    this.showModal = true;
  }

  editGiangVien(gv: GiangVienResponse): void {
    this.isEditing = true;
    this.editingId = gv.id;
    this.formData = { hoTen: gv.hoTen, hocVi: gv.hocVi, boMonId: gv.boMonId, email: gv.email };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
    this.editingId = null;
  }

  saveGiangVien(): void {
    if (this.isEditing && this.editingId) {
      this.adminService.updateGiangVien(this.editingId, this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Cập nhật thành công!');
            this.loadGiangVien();
            this.closeModal();
          }
        }
      });
    } else {
      this.adminService.createGiangVien(this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Thêm thành công!');
            this.loadGiangVien();
            this.closeModal();
          }
        }
      });
    }
  }

  toggleLanhDao(gv: GiangVienResponse): void {
    this.adminService.setLanhDaoBoMon(gv.id, !gv.laLanhDao).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Cập nhật thành công!');
          this.loadGiangVien();
        }
      }
    });
  }

  deleteGiangVien(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa?')) {
      this.adminService.deleteGiangVien(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Xóa thành công!');
            this.loadGiangVien();
          }
        }
      });
    }
  }

  onFileSelected(event: any): void {
    this.importFile = event.target.files[0];
    this.importResult = null;
  }

  importGiangVien(): void {
    if (!this.importFile) return;
    this.importing = true;
    this.importResult = null;
    const formData = new FormData();
    formData.append('file', this.importFile);
    this.http.post<any>('http://localhost:8080/api/admin/import/giang-vien', formData).subscribe({
      next: (res) => {
        this.importing = false;
        if (res.success) {
          this.importResult = res.data;
          this.toastr.success('Import thành công ' + res.data.successCount + ' giảng viên');
          this.loadGiangVien();
        } else {
          this.toastr.error(res.message);
        }
      },
      error: (err) => {
        this.importing = false;
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
      }
    });
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AdminService } from '../../../core/services/admin.service';
import { SinhVienResponse, BoMonResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-sinh-vien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h2>Quản lý Sinh viên</h2>
      </div>
      <div class="d-flex align-items-center">
        <select class="form-select me-3" [(ngModel)]="selectedBoMonId" (change)="onFilterChange()" style="width: 200px;">
          <option [ngValue]="undefined">-- Tất cả bộ môn --</option>
          <option *ngFor="let bm of boMonList" [ngValue]="bm.id">{{ bm.tenBoMon }}</option>
        </select>
        <input type="text" class="form-control me-3" placeholder="Tìm kiếm..." 
               [(ngModel)]="searchKeyword" (input)="onSearch()" style="width: 200px;">
        <button class="btn btn-success me-2" (click)="showImportModal = true">
          <span class="material-symbols-outlined me-2">upload</span>Import Excel
        </button>
        <button class="btn btn-primary" (click)="openModal()">
          <span class="material-symbols-outlined me-2">add_circle</span>Thêm Sinh viên
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
                <th>Mã SV</th>
                <th>Họ tên</th>
                <th>Lớp</th>
                <th>Email</th>
                <th>Bộ môn</th>
                <th>Tài khoản</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sv of sinhVienList; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ sv.maSinhVien }}</td>
                <td>{{ sv.hoTen }}</td>
                <td>{{ sv.lop || '-' }}</td>
                <td>{{ sv.email }}</td>
                <td>{{ sv.tenBoMon }}</td>
                <td>
                  <span [class]="sv.trangThaiTaiKhoan ? 'bg-success' : 'bg-danger'" class="badge">
                    {{ sv.trangThaiTaiKhoan ? 'Hoạt động' : 'Bị khóa' }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" (click)="editSinhVien(sv)">
                      <span class="material-symbols-outlined me-1">edit</span>Sửa
                    </button>
                    <button class="btn btn-sm" [class.btn-outline-success]="!sv.trangThaiTaiKhoan" [class.btn-outline-danger]="sv.trangThaiTaiKhoan"
                            (click)="toggleTaiKhoan(sv)">
                      <span class="material-symbols-outlined me-1">{{ sv.trangThaiTaiKhoan ? 'lock' : 'lock_open' }}</span>
                      {{ sv.trangThaiTaiKhoan ? 'Khóa' : 'Mở' }}
                    </button>
                    <button class="btn btn-sm btn-outline-danger" (click)="deleteSinhVien(sv.id)">
                      <span class="material-symbols-outlined me-1">delete</span>Xóa
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="sinhVienList.length === 0 && !isLoading">
                <td colspan="8" class="text-center py-4 text-muted">
                  Không có dữ liệu
                </td>
              </tr>
              <tr *ngIf="isLoading">
                <td colspan="8" class="text-center py-4">
                  <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
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
            <h5 class="modal-title">{{ isEditing ? 'Cập nhật' : 'Thêm' }} Sinh viên</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Mã sinh viên</label>
              <input type="text" class="form-control" [(ngModel)]="formData.maSinhVien">
            </div>
            <div class="mb-3">
              <label class="form-label">Họ tên</label>
              <input type="text" class="form-control" [(ngModel)]="formData.hoTen">
            </div>
            <div class="mb-3">
              <label class="form-label">Lớp</label>
              <input type="text" class="form-control" [(ngModel)]="formData.lop">
            </div>
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input type="email" class="form-control" [(ngModel)]="formData.email">
            </div>
            <div class="mb-3" *ngIf="!isEditing">
              <label class="form-label">Mật khẩu</label>
              <input type="password" class="form-control" [(ngModel)]="formData.password">
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
            <button type="button" class="btn btn-primary" (click)="saveSinhVien()">Lưu</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Import -->
    <div class="modal show d-block" *ngIf="showImportModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Import Sinh viên từ Excel</h5>
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
            <button type="button" class="btn btn-success" (click)="importSinhVien()" [disabled]="!importFile || importing">
              <span class="material-symbols-outlined me-2">upload</span>{{ importing ? 'Đang import...' : 'Import' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class SinhVienComponent implements OnInit {
  boMonList: BoMonResponse[] = [];
  selectedBoMonId?: number;
  searchKeyword = '';
  showModal = false;
  showImportModal = false;
  isEditing = false;
  formData: any = {};
  importFile: File | null = null;
  importing = false;
  importResult: any = null;

  sinhVienList: SinhVienResponse[] = [];
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBoMon();
    this.loadSinhVien();
  }

  loadSinhVien(): void {
    this.isLoading = true;
    this.adminService.getAllSinhVien(this.selectedBoMonId).subscribe({
      next: (res) => {
        if (res.success) {
          this.sinhVienList = res.data;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Không thể tải dữ liệu');
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

  onFilterChange(): void {
    this.loadSinhVien();
  }

  onSearch(): void {
    this.loadSinhVien();
  }

  openModal(): void {
    this.isEditing = false;
    this.formData = {};
    this.showModal = true;
  }

  editSinhVien(sv: SinhVienResponse): void {
    this.isEditing = true;
    this.formData = { 
      id: sv.id,
      hoTen: sv.hoTen, 
      maSinhVien: sv.maSinhVien, 
      lop: sv.lop, 
      boMonId: sv.boMonId, 
      email: sv.email 
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.isEditing = false;
  }

  saveSinhVien(): void {
    if (this.isEditing) {
      this.adminService.updateSinhVien(this.formData.id, this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Cập nhật thành công!');
            this.loadSinhVien();
            this.closeModal();
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
        }
      });
    } else {
      this.adminService.createSinhVien(this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Thêm thành công!');
            this.loadSinhVien();
            this.closeModal();
          }
        }
      });
    }
  }

  toggleTaiKhoan(sv: SinhVienResponse): void {
    if (sv.trangThaiTaiKhoan) {
      if (confirm(`Bạn có chắc chắn muốn khóa tài khoản của "${sv.hoTen}"?`)) {
        this.adminService.khoaTaiKhoan(sv.taiKhoanId!).subscribe({
          next: (res) => {
            if (res.success) {
              this.toastr.success('Đã khóa tài khoản!');
              this.loadSinhVien();
            }
          }
        });
      }
    } else {
      this.adminService.moTaiKhoan(sv.taiKhoanId!).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Đã mở tài khoản!');
            this.loadSinhVien();
          }
        }
      });
    }
  }

  deleteSinhVien(id: number): void {
    if (confirm('Bạn có chắc chắn muốn xóa?')) {
      this.adminService.deleteSinhVien(id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Xóa thành công!');
            this.loadSinhVien();
          }
        }
      });
    }
  }

  onFileSelected(event: any): void {
    this.importFile = event.target.files[0];
    this.importResult = null;
  }

  importSinhVien(): void {
    if (!this.importFile) return;
    this.importing = true;
    this.importResult = null;
    const formData = new FormData();
    formData.append('file', this.importFile);
    this.http.post<any>('http://localhost:8080/api/admin/import/sinh-vien', formData).subscribe({
      next: (res) => {
        this.importing = false;
        this.importResult = res.data;
        if (res.success) {
          if (res.data.errorCount > 0) {
            this.toastr.warning('Import có lỗi: ' + res.data.errorCount + ' dòng không hợp lệ');
          } else {
            this.toastr.success('Import thành công ' + res.data.successCount + ' sinh viên');
            this.loadSinhVien();
          }
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

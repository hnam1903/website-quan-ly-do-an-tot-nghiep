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
    <div class="page-header">
      <h2>Đăng ký đề tài</h2>
     
    </div>

    <div *ngIf="!deTaiCuaToi" class="card">
      <div class="card-body">
        <div *ngIf="!daDangKy">
          <h5>Đợt đăng ký đang mở</h5>
          <div *ngFor="let dot of dotList" class="alert alert-info mb-3">
            <strong>{{ dot.tenDot }}</strong><br>
            <small>{{ dot.namHoc }} - Học kỳ {{ dot.hocKy }}</small><br>
            <small>Hạn: {{ dot.ngayKetThuc | date:'dd/MM/yyyy' }}</small>
          </div>

          <form (ngSubmit)="dangKy()">
            <div class="mb-3">
              <label class="form-label">Đợt đăng ký</label>
              <select class="form-select" [(ngModel)]="formData.dotDangKyId" name="dotDangKyId" required>
                <option [value]="null">Chọn đợt đăng ký</option>
                <option *ngFor="let dot of dotList" [value]="dot.id">{{ dot.tenDot }}</option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Tên đề tài *</label>
              <input type="text" class="form-control" [(ngModel)]="formData.tenDeTai" name="tenDeTai" required>
            </div>
            <div class="mb-3">
              <label class="form-label">Giảng viên hướng dẫn dự kiến</label>
              <select class="form-select" [(ngModel)]="formData.giangVienDuKienId" name="giangVienDuKienId">
                <option [value]="null">-- Chọn giảng viên --</option>
                <option *ngFor="let gv of giangVienList" [value]="gv.id">
                  {{ gv.hoTen }} {{ gv.hocVi ? '- ' + gv.hocVi : '' }} {{ gv.tenBoMon ? '- ' + gv.tenBoMon : '' }}
                </option>
              </select>
            </div>
            <div class="mb-3">
              <label class="form-label">Nội dung dự kiến</label>
              <textarea class="form-control" [(ngModel)]="formData.noiDungDuKien" name="noiDungDuKien" rows="3"></textarea>
            </div>
            <div class="mb-3">
              <label class="form-label">Công nghệ sử dụng</label>
              <input type="text" class="form-control" [(ngModel)]="formData.congNgheSuDung" name="congNgheSuDung">
            </div>
            <button type="submit" class="btn btn-primary">Đăng ký</button>
          </form>
        </div>
      </div>
    </div>

    <div *ngIf="deTaiCuaToi" class="card">
      <div class="card-header" [ngClass]="{
        'bg-danger text-white': laTrangThaiThatBai(deTaiCuaToi.trangThai),
        'bg-warning text-dark': deTaiCuaToi.trangThai === 'CHO_GV_DUYET_LAI',
        'bg-success text-white': !laTrangThaiThatBai(deTaiCuaToi.trangThai) && deTaiCuaToi.trangThai !== 'CHO_GV_DUYET_LAI'
      }">
        <h5 class="mb-0" *ngIf="laTrangThaiThatBai(deTaiCuaToi.trangThai)">Đề tài bị từ chối</h5>
        <h5 class="mb-0" *ngIf="deTaiCuaToi.trangThai === 'CHO_GV_DUYET_LAI'">Đề tài đang chờ GVHD khác duyệt</h5>
        <h5 class="mb-0" *ngIf="!laTrangThaiThatBai(deTaiCuaToi.trangThai) && deTaiCuaToi.trangThai !== 'CHO_GV_DUYET_LAI'">Đề tài của bạn</h5>
      </div>
      <div class="card-body">
        <p><strong>Tên đề tài:</strong> {{ deTaiCuaToi.tenDeTai }}</p>
        <p><strong>Nội dung:</strong> {{ deTaiCuaToi.noiDungDuKien || '-' }}</p>
        <p><strong>Công nghệ:</strong> {{ deTaiCuaToi.congNgheSuDung || '-' }}</p>
        <p><strong>GV dự kiến:</strong> {{ deTaiCuaToi.hoTenGiangVienDuKien || '-' }}</p>
        <p><strong>Trạng thái:</strong>
          <span [class]="getStatusClass(deTaiCuaToi.trangThai)" class="badge">
            {{ getStatusText(deTaiCuaToi.trangThai) }}
          </span>
        </p>

        <!-- Hiển thị lý do từ chối -->
        <div *ngIf="deTaiCuaToi.ghiChu && (laTrangThaiThatBai(deTaiCuaToi.trangThai) || deTaiCuaToi.trangThai === 'CHO_GV_DUYET_LAI')" class="alert alert-danger mt-3">
          <i class="bi bi-exclamation-triangle"></i> <strong>Lý do từ chối:</strong> {{ deTaiCuaToi.ghiChu }}
        </div>

        <!-- Nút đăng ký lại khi bị từ chối hoặc trượt -->
        <div *ngIf="laTrangThaiThatBai(deTaiCuaToi.trangThai)" class="mt-3">
          <button class="btn btn-danger" (click)="hienThiFormDangKyLai()">
            <i class="bi bi-arrow-repeat"></i> Đăng ký lại đề tài khác
          </button>
        </div>
      </div>
    </div>

    <!-- Modal đăng ký lại -->
    <div class="modal fade" id="dangKyLaiModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Đăng ký lại đề tài</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <form (ngSubmit)="dangKyLai()">
              <div class="mb-3">
                <label class="form-label">Đợt đăng ký</label>
                <select class="form-select" [(ngModel)]="formData.dotDangKyId" name="dotDangKyId" required>
                  <option [value]="null">Chọn đợt đăng ký</option>
                  <option *ngFor="let dot of dotList" [value]="dot.id">{{ dot.tenDot }}</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Tên đề tài *</label>
                <input type="text" class="form-control" [(ngModel)]="formData.tenDeTai" name="tenDeTai" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Giảng viên hướng dẫn dự kiến</label>
                <select class="form-select" [(ngModel)]="formData.giangVienDuKienId" name="giangVienDuKienId">
                  <option [value]="null">-- Chọn giảng viên --</option>
                  <option *ngFor="let gv of giangVienList" [value]="gv.id">
                    {{ gv.hoTen }} {{ gv.hocVi ? '- ' + gv.hocVi : '' }} {{ gv.tenBoMon ? '- ' + gv.tenBoMon : '' }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Nội dung dự kiến</label>
                <textarea class="form-control" [(ngModel)]="formData.noiDungDuKien" name="noiDungDuKien" rows="3"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Công nghệ sử dụng</label>
                <input type="text" class="form-control" [(ngModel)]="formData.congNgheSuDung" name="congNgheSuDung">
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" class="btn btn-primary">Đăng ký lại</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DeTaiSvComponent implements OnInit {
  dotList: DotDangKyResponse[] = [];
  giangVienList: GiangVienResponse[] = [];
  deTaiCuaToi: DeTaiResponse | null = null;
  daDangKy = false;
  formData: any = {};

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
            const modalEl = document.getElementById('dangKyLaiModal');
            if (modalEl) {
              const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
            }
            this.loadData();
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Đăng ký lại thất bại');
        }
      });
    } else {
      // KHONG_DAT_GVHD, KHONG_DAT_PHAN_BIEN, KHONG_DAT_BAO_VE: tạo đề tài mới
      this.svService.dangKyDeTai(this.formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Đăng ký đề tài mới thành công!');
            const modalEl = document.getElementById('dangKyLaiModal');
            if (modalEl) {
              const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
              if (modal) modal.hide();
            }
            this.loadData();
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Đăng ký đề tài thất bại');
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
          this.loadData();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Đăng ký thất bại');
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
      'CHO_DUYET': 'bg-warning',
      'CHO_GV_DUYET_LAI': 'bg-warning',
      'DU_DIEU_KIEN': 'bg-success',
      'KHONG_DU_DIEU_KIEN': 'bg-danger',
      'DANG_THUC_HIEN': 'bg-info',
      'DAT_GVHD': 'bg-success',
      'KHONG_DAT_GVHD': 'bg-danger',
      'DAT_PHAN_BIEN': 'bg-success',
      'HOAN_THANH': 'bg-primary'
    };
    return map[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const map: any = {
      'CHO_DUYET': 'Chờ duyệt',
      'CHO_GV_DUYET_LAI': 'Chờ GV duyệt lại',
      'DU_DIEU_KIEN': 'Đủ điều kiện',
      'KHONG_DU_DIEU_KIEN': 'Không đủ ĐK',
      'DANG_THUC_HIEN': 'Đang thực hiện',
      'DAT_GVHD': 'Đạt HD',
      'KHONG_DAT_GVHD': 'Không đạt HD',
      'DAT_PHAN_BIEN': 'Đạt PB',
      'HOAN_THANH': 'Hoàn thành'
    };
    return map[status] || status;
  }
}

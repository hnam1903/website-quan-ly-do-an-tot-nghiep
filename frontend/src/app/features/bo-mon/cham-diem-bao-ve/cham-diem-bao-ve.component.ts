import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { HoiDongBaoVeResponse, ThanhVienResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cham-diem-bao-ve',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-warning-subtle">
          <i class="bi bi-shield-check text-warning"></i>
        </div>
        <div>
          <h2>Chấm điểm bảo vệ</h2>
          <p class="mb-0">Nhập và quản lý điểm bảo vệ của các hội đồng</p>
        </div>
      </div>
      <label class="btn btn-primary mb-0">
        <i class="bi bi-upload me-2"></i> Import Excel
        <input type="file" accept=".xlsx,.xls" (change)="onFileSelected($event)" style="display: none;">
      </label>
    </div>

    <!-- Alert import -->
    <div *ngIf="importMessage" class="alert mt-3" [ngClass]="importSuccess ? 'alert-success' : 'alert-danger'">
      <i class="bi me-2" [class.bi-check-circle-fill]="importSuccess" [class.bi-exclamation-triangle-fill]="!importSuccess"></i>
      {{ importMessage }}
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div *ngIf="loading" class="text-center p-3">
          <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
        </div>

        <div *ngIf="!loading && hoiDongList.length === 0" class="alert alert-info m-4">
          <i class="bi bi-info-circle me-2"></i>Không có hội đồng nào cần chấm điểm.
        </div>

        <div *ngIf="!loading && hoiDongList.length > 0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="text-center" style="width: 60px">STT</th>
                  <th>Sinh viên</th>
                  <th>Đề tài</th>
                  <th style="width: 150px">Ngày bảo vệ</th>
                  <th style="width: 100px">Địa điểm</th>
                  <th style="width: 120px">Trạng thái</th>
                  <th style="width: 80px" class="text-center">Điểm</th>
                  <th style="width: 160px">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let hd of hoiDongList; let i = index" class="align-middle">
                  <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
                  <td>
                    <strong>{{ hd.hoTenSinhVien }}</strong><br>
                    <small class="text-secondary"><code>{{ hd.maSinhVien }}</code></small>
                  </td>
                  <td>
                    <span class="text-truncate d-inline-block" style="max-width: 200px">{{ hd.tenDeTai }}</span>
                  </td>
                  <td>{{ hd.ngayBaoVe ? (hd.ngayBaoVe | date:'dd/MM/yyyy HH:mm') : '-' }}</td>
                  <td>{{ hd.diaDiem || '-' }}</td>
                  <td>
                    <span class="badge" [ngClass]="getBadgeClass(hd.trangThai)">
                      {{ getTrangThaiText(hd.trangThai) }}
                    </span>
                  </td>
                  <td class="text-center">
                    <strong>{{ hd.diemBaoVe || '-' }}</strong>
                  </td>
                  <td class="text-center">
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-outline-primary btn-icon" (click)="openEditModal(hd)" *ngIf="hd.trangThai === 'DA_BAO_VE' || hd.diemBaoVe" title="Sửa điểm">
                        <span class="material-symbols-outlined">edit</span>
                      </button>
                      <button class="btn btn-sm btn-outline-primary btn-icon" (click)="xemChiTiet(hd)" title="Xem chi tiết">
                        <span class="material-symbols-outlined">visibility</span>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal nhập/sửa điểm -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi" [class.bi-pencil-square]="isEditMode" [class.bi-shield-check]="!isEditMode"></i> {{ isEditMode ? 'Sửa điểm bảo vệ' : 'Nhập điểm bảo vệ' }}</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Sinh viên</label>
                  <p class="info-value">{{ selectedHoiDong?.hoTenSinhVien }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group mb-0">
                  <label class="info-label">Đề tài</label>
                  <p class="info-value">{{ selectedHoiDong?.tenDeTai }}</p>
                </div>
              </div>
            </div>

            <hr>
            <h6 class="mb-3"><i class="bi bi-people me-2"></i>Điểm của từng thành viên hội đồng</h6>

            <div *ngFor="let tv of selectedHoiDong?.thanhViens; let i = index" class="row g-3 mb-3">
              <div class="col-md-8">
                <label class="form-label">
                  <i class="bi bi-person me-1"></i>{{ tv.hoTenGiangVien }}
                  <span class="badge badge-secondary ms-1">{{ getVaiTroText(tv.vaiTro) }}</span>
                  <span *ngIf="tv.hocVi" class="text-muted ms-1">({{ tv.hocVi }})</span>
                </label>
              </div>
              <div class="col-md-4">
                <div class="input-group">
                  <input type="number" class="form-control" [(ngModel)]="diemGiangVienMap[tv.giangVienId]"
                         min="0" max="10" step="0.5" placeholder="0-10">
                  <span class="input-group-text">/10</span>
                </div>
              </div>
            </div>

            <div class="mt-4">
              <label class="form-label">Nhận xét chung</label>
              <textarea class="form-control" [(ngModel)]="nhanXetMoi" rows="3"
                        placeholder="Nhận xét của hội đồng..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="button" class="btn btn-success" (click)="luuDiem()">
              <i class="bi bi-check2 me-1"></i>{{ isEditMode ? 'Cập nhật' : 'Lưu điểm' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xem chi tiết -->
    <div class="modal-overlay" *ngIf="showChiTietModal" (click)="closeChiTietModal()">
      <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-shield-check me-2"></i>Kết quả bảo vệ</h5>
            <button type="button" class="btn-close" (click)="closeChiTietModal()"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info mb-4">
              <strong>Sinh viên:</strong> {{ selectedHoiDong?.hoTenSinhVien }}<br>
              <strong>Đề tài:</strong> {{ selectedHoiDong?.tenDeTai }}
            </div>

            <!-- Bảng điểm từng thành viên -->
            <table class="table table-bordered mb-3" *ngIf="selectedHoiDong && selectedHoiDong.thanhViens && selectedHoiDong.thanhViens.length > 0">
              <thead>
                <tr>
                  <th>Thành viên</th>
                  <th style="width: 140px">Vai trò</th>
                  <th style="width: 100px" class="text-center">Điểm</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tv of selectedHoiDong?.thanhViens">
                  <td><strong>{{ tv.hoTenGiangVien }}</strong></td>
                  <td>{{ getVaiTroText(tv.vaiTro) }}</td>
                  <td class="text-center">
                    <strong>{{ tv.diem || '-' }}</strong>
                  </td>
                </tr>
              </tbody>
            </table>

            <div *ngIf="selectedHoiDong?.nhanXetCham" class="alert alert-success">
              <strong>Nhận xét:</strong><br>{{ selectedHoiDong?.nhanXetCham }}
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeChiTietModal()">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .table td { vertical-align: middle; }
  `]
})
export class ChamDiemBaoVeComponent implements OnInit {
  hoiDongList: HoiDongBaoVeResponse[] = [];
  loading = false;
  showModal = false;
  showChiTietModal = false;
  isEditMode = false;
  selectedHoiDong: HoiDongBaoVeResponse | null = null;
  diemGiangVienMap: { [key: number]: number | null } = {};
  nhanXetMoi = '';

  // Import Excel
  importMessage = '';
  importSuccess = false;
  selectedFile: File | null = null;

  constructor(
    private boMonService: BoMonService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.boMonService.getHoiDongBaoVe().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.hoiDongList = res.data || [];
        }
      },
      error: () => {
        this.loading = false;
        this.toastr.error('Không thể tải danh sách hội đồng');
      }
    });
  }

  getBadgeClass(trangThai: string): string {
    switch (trangThai) {
      case 'CHO_BAO_VE': return 'bg-warning';
      case 'DA_BAO_VE': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getTrangThaiText(trangThai: string): string {
    switch (trangThai) {
      case 'CHO_BAO_VE': return 'Chờ bảo vệ';
      case 'DA_BAO_VE': return 'Đã bảo vệ';
      default: return trangThai;
    }
  }

  getVaiTroText(vaiTro: string): string {
    switch (vaiTro) {
      case 'CHU_TICH': return 'Chủ tịch';
      case 'THU_KY': return 'Thư ký';
      case 'UY_VIEN': return 'Ủy viên';
      default: return vaiTro;
    }
  }

  openDiemModal(hd: HoiDongBaoVeResponse): void {
    this.selectedHoiDong = hd;
    this.diemGiangVienMap = {};
    this.nhanXetMoi = hd.nhanXetCham || '';
    this.isEditMode = false;
    this.showModal = true;
  }

  openEditModal(hd: HoiDongBaoVeResponse): void {
    this.selectedHoiDong = hd;
    this.diemGiangVienMap = {};
    this.nhanXetMoi = hd.nhanXetCham || '';
    this.isEditMode = true;
    
    // Load điểm hiện tại của từng thành viên
    this.boMonService.getDiemBaoVeByHoiDong(hd.id).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          res.data.forEach((d: any) => {
            if (d.diem !== null) {
              this.diemGiangVienMap[d.giangVienId] = d.diem;
            }
          });
        }
      }
    });
    
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedHoiDong = null;
    this.diemGiangVienMap = {};
    this.isEditMode = false;
  }

  xemChiTiet(hd: HoiDongBaoVeResponse): void {
    this.selectedHoiDong = hd;
    this.showChiTietModal = true;
  }

  closeChiTietModal(): void {
    this.showChiTietModal = false;
    this.selectedHoiDong = null;
  }

  luuDiem(): void {
    if (!this.selectedHoiDong) return;

    const diemThanhViens: { giangVienId: number; diem: number }[] = [];

    if (this.selectedHoiDong.thanhViens) {
      this.selectedHoiDong.thanhViens.forEach(tv => {
        const diem = this.diemGiangVienMap[tv.giangVienId];
        if (diem !== null && diem !== undefined) {
          if (diem < 0 || diem > 10) {
            this.toastr.warning('Điểm phải từ 0 đến 10');
            return;
          }
          diemThanhViens.push({ giangVienId: tv.giangVienId, diem });
        }
      });
    }

    if (diemThanhViens.length === 0) {
      this.toastr.warning('Vui lòng nhập điểm cho ít nhất một thành viên');
      return;
    }

    if (this.isEditMode) {
      // Sửa điểm - gọi API update
      this.boMonService.updateDiemBaoVe(this.selectedHoiDong.id, {
        hoiDongId: this.selectedHoiDong.id,
        nhanXet: this.nhanXetMoi,
        diemThanhViens
      } as any).subscribe({
        next: (res) => {
          this.toastr.success('Cập nhật điểm thành công!');
          this.closeModal();
          this.loadData();
        },
        error: (err) => {
          console.error('Lỗi cập nhật:', err);
          console.error('Chi tiết lỗi:', err.error?.errors);
          this.toastr.error(err.error?.message || 'Cập nhật điểm thất bại');
        }
      });
    } else {
      // Nhập điểm mới - gọi API create
      this.boMonService.importDiemBaoVe({
        hoiDongId: this.selectedHoiDong.id,
        nhanXet: this.nhanXetMoi,
        diemThanhViens
      } as any).subscribe({
        next: (res: any) => {
          this.toastr.success('Nhập điểm thành công!');
          this.closeModal();
          this.loadData();
        },
        error: (err: any) => {
          console.error('Lỗi nhập điểm:', err);
          this.toastr.error(err.error?.message || 'Nhập điểm thất bại');
        }
      });
    }
  }

  // Import Excel
  downloadTemplate(): void {
    this.boMonService.downloadDiemBaoVeTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_diem_bao_ve.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toastr.error('Không thể tải template');
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.importMessage = '';

    this.boMonService.importDiemExcel(file).subscribe({
      next: (res: any) => {
        this.importSuccess = true;
        this.importMessage = res.message || 'Import thành công!';
        this.loadData();
        setTimeout(() => this.importMessage = '', 5000);
      },
      error: (err: any) => {
        this.importSuccess = false;
        this.importMessage = err.error?.message || 'Import thất bại!';
        setTimeout(() => this.importMessage = '', 5000);
      }
    });

    event.target.value = '';
  }
}

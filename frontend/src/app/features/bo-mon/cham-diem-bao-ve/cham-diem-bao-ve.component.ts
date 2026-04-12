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
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h2>Chấm điểm bảo vệ</h2>
        
      </div>
      <label class="btn btn-primary mb-0">
        <i class="bi bi-upload"></i> Import Excel
        <input type="file" accept=".xlsx,.xls" (change)="onFileSelected($event)" style="display: none;">
      </label>
    </div>

    <!-- Alert import -->
    <div *ngIf="importMessage" class="alert mt-3" [ngClass]="importSuccess ? 'alert-success' : 'alert-danger'">
      {{ importMessage }}
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngIf="loading" class="text-center p-3">
          <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
        </div>

        <div *ngIf="!loading && hoiDongList.length === 0" class="alert alert-info">
          Không có hội đồng nào cần chấm điểm.
        </div>

        <div *ngIf="!loading && hoiDongList.length > 0">
          <div class="table-responsive">
            <table class="table table-hover">
              <thead class="table-light">
                <tr>
                  <th>STT</th>
                  <th>Sinh viên</th>
                  <th>Đề tài</th>
                  <th>Ngày bảo vệ</th>
                  <th>Địa điểm</th>
                  <th>Trạng thái</th>
                  <th>Điểm</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let hd of hoiDongList; let i = index">
                  <td>{{ i + 1 }}</td>
                  <td>
                    <strong>{{ hd.hoTenSinhVien }}</strong><br>
                    <small class="text-muted">{{ hd.maSinhVien }}</small>
                  </td>
                  <td>{{ hd.tenDeTai }}</td>
                  <td>{{ hd.ngayBaoVe ? (hd.ngayBaoVe | date:'dd/MM/yyyy HH:mm') : '-' }}</td>
                  <td>{{ hd.diaDiem || '-' }}</td>
                  <td>
                    <span class="badge" [ngClass]="getBadgeClass(hd.trangThai)">
                      {{ getTrangThaiText(hd.trangThai) }}
                    </span>
                  </td>
                  <td>
                    {{ hd.diemBaoVe || '-' }}
                  </td>
                  <td>
                    <button class="btn btn-sm btn-warning me-1" (click)="openEditModal(hd)" *ngIf="hd.trangThai === 'DA_BAO_VE' || hd.diemBaoVe">
                      <i class="bi bi-pencil"></i> Sửa
                    </button>
                    <button class="btn btn-sm btn-info" (click)="xemChiTiet(hd)">
                      <i class="bi bi-eye"></i> Xem
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal nhập/sửa điểm -->
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)" *ngIf="showModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditMode ? 'Sửa điểm bảo vệ' : 'Nhập điểm bảo vệ' }}</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Sinh viên</label>
              <input type="text" class="form-control" [value]="selectedHoiDong?.hoTenSinhVien" readonly>
            </div>
            <div class="mb-3">
              <label class="form-label">Đề tài</label>
              <input type="text" class="form-control" [value]="selectedHoiDong?.tenDeTai" readonly>
            </div>

            <hr>
            <h6 class="mb-3">Điểm của từng thành viên hội đồng</h6>

            <div class="row mb-3" *ngFor="let tv of selectedHoiDong?.thanhViens; let i = index">
              <div class="col-md-8">
                <label class="form-label">
                  {{ tv.hoTenGiangVien }}
                  <span class="badge bg-secondary ms-1">{{ getVaiTroText(tv.vaiTro) }}</span>
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

            <div class="alert alert-info mt-3" *ngIf="tinhTrungBinh() !== null">
              <strong>Điểm trung bình: {{ tinhTrungBinh() }}/10</strong>
            </div>

            <div class="mb-3 mt-3">
              <label class="form-label">Nhận xét chung</label>
              <textarea class="form-control" [(ngModel)]="nhanXetMoi" rows="3"
                        placeholder="Nhận xét của hội đồng..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="button" class="btn btn-success" (click)="luuDiem()">
              <i class="bi bi-check-lg"></i> {{ isEditMode ? 'Cập nhật' : 'Lưu điểm' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xem chi tiết -->
    <div class="modal fade show d-block" tabindex="-1" style="background: rgba(0,0,0,0.5)" *ngIf="showChiTietModal">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Kết quả bảo vệ</h5>
            <button type="button" class="btn-close" (click)="closeChiTietModal()"></button>
          </div>
          <div class="modal-body">
            <div class="mb-4">
              <strong>Sinh viên:</strong> {{ selectedHoiDong?.hoTenSinhVien }}<br>
              <strong>Đề tài:</strong> {{ selectedHoiDong?.tenDeTai }}
            </div>

            <!-- Bảng điểm từng thành viên -->
            <table class="table table-bordered mb-3" *ngIf="selectedHoiDong && selectedHoiDong.thanhViens && selectedHoiDong.thanhViens.length > 0">
              <thead class="table-light">
                <tr>
                  <th>Thành viên</th>
                  <th>Vai trò</th>
                  <th>Điểm</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let tv of selectedHoiDong?.thanhViens">
                  <td><strong>{{ tv.hoTenGiangVien }}</strong></td>
                  <td>{{ getVaiTroText(tv.vaiTro) }}</td>
                  <td class="text-center">
                    {{ tv.diem || '-' }}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="table-success">
                  <td colspan="2" class="text-end"><strong>Điểm trung bình:</strong></td>
                  <td class="text-center">
                    <strong>{{ selectedHoiDong.diemBaoVe }}</strong>
                  </td>
                </tr>
              </tfoot>
            </table>

            <p *ngIf="selectedHoiDong?.nhanXetCham" class="mt-3">
              <strong>Nhận xét:</strong><br>{{ selectedHoiDong?.nhanXetCham }}
            </p>
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
      case 'DANG_BAO_VE': return 'bg-info';
      case 'DA_BAO_VE': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getTrangThaiText(trangThai: string): string {
    switch (trangThai) {
      case 'CHO_BAO_VE': return 'Chờ bảo vệ';
      case 'DANG_BAO_VE': return 'Đang bảo vệ';
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

  tinhTrungBinh(): number | null {
    if (!this.selectedHoiDong?.thanhViens) return null;

    let tongDiem = 0;
    let soLuong = 0;

    this.selectedHoiDong.thanhViens.forEach(tv => {
      const diem = this.diemGiangVienMap[tv.giangVienId];
      if (diem !== null && diem !== undefined) {
        tongDiem += diem;
        soLuong++;
      }
    });

    if (soLuong === 0) return null;
    return Math.round((tongDiem / soLuong) * 100) / 100;
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

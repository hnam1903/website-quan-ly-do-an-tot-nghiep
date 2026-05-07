import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeTaiResponse, GiangVienResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-hoi-dong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-success-subtle">
          <span class="material-symbols-outlined text-success">group</span>
        </div>
        <div>
          <h2>Thành lập hội đồng bảo vệ</h2>
          <p class="mb-0">Thiết lập hội đồng cho sinh viên bảo vệ</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div *ngIf="svDatPB.length === 0" class="alert alert-info m-4">
          <span class="material-symbols-outlined me-2">info</span>Không có sinh viên đủ điều kiện
        </div>

        <div class="table-responsive" *ngIf="svDatPB.length > 0">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th>Sinh viên</th>
                <th>Đề tài</th>
                <th style="width: 160px">GVHD</th>
                <th style="width: 160px">GVPB</th>
                <th style="width: 120px" class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of svDatPB; let i = index" class="align-middle">
                <td class="text-center">
                  <span class="stt-badge">{{ i + 1 }}</span>
                </td>
                <td><strong>{{ dt.hoTenSinhVien }}</strong></td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 250px">{{ dt.tenDeTai }}</span>
                </td>
                <td>
                  <span *ngIf="dt.hoTenGiangVienHuongDan; else noGvhd" class="text-muted">
                    <span class="material-symbols-outlined me-1">person</span>{{ dt.hoTenGiangVienHuongDan }}
                  </span>
                  <ng-template #noGvhd><span class="text-muted fst-italic">-</span></ng-template>
                </td>
                <td>
                  <span *ngIf="dt.hoTenGiangVienPhanBien; else noGvpb" class="text-muted">
                    <span class="material-symbols-outlined me-1">person</span>{{ dt.hoTenGiangVienPhanBien }}
                  </span>
                  <ng-template #noGvpb><span class="text-muted fst-italic">-</span></ng-template>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-primary" (click)="showHoiDongModal(dt)">
                    <span class="material-symbols-outlined me-1">add_circle</span>Lập HĐ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
      <div class="modal-dialog modal-lg" (click)="$event.stopPropagation()">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title"><span class="material-symbols-outlined me-2">group</span>Thành lập hội đồng</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info mb-4">
              <strong>Sinh viên:</strong> {{ selectedDeTai?.hoTenSinhVien }}<br>
              <strong>Đề tài:</strong> {{ selectedDeTai?.tenDeTai }}
            </div>

            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label">Ngày bảo vệ <span class="text-danger">*</span></label>
                <input type="date" class="form-control" [(ngModel)]="formData.ngayBaoVe">
              </div>
              <div class="col-md-6">
                <label class="form-label">Địa điểm</label>
                <input type="text" class="form-control" [(ngModel)]="formData.diaDiem" placeholder="VD: Phòng 301">
              </div>
            </div>

            <h6 class="mb-3"><span class="material-symbols-outlined me-2">group</span>Thành viên hội đồng (3 người)</h6>
            <div *ngFor="let tv of thanhVien; let i = index" class="row g-3 mb-3">
              <div class="col-md-8">
                <select class="form-select" [(ngModel)]="tv.giangVienId">
                  <option [value]="null">Chọn giảng viên</option>
                  <option *ngFor="let gv of giangVienList" [value]="gv.id">
                    {{ gv.hoTen }} ({{ gv.hocVi }})
                  </option>
                </select>
              </div>
              <div class="col-md-4">
                <select class="form-select" [(ngModel)]="tv.vaiTro">
                  <option value="CHU_TICH">Chủ tịch</option>
                  <option value="THU_KY">Thư ký</option>
                  <option value="UY_VIEN">Ủy viên</option>
                </select>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="button" class="btn btn-primary" (click)="taoHoiDong()">
              <span class="material-symbols-outlined me-1">check</span>Tạo hội đồng
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HoiDongComponent implements OnInit {
  svDatPB: DeTaiResponse[] = [];
  giangVienList: GiangVienResponse[] = [];
  showModal = false;
  selectedDeTai: DeTaiResponse | null = null;
  thanhVien: any[] = [
    { giangVienId: null, vaiTro: 'CHU_TICH' },
    { giangVienId: null, vaiTro: 'THU_KY' },
    { giangVienId: null, vaiTro: 'UY_VIEN' }
  ];
  formData: any = {};

  constructor(
    private boMonService: BoMonService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const currentUser = this.authService.getCurrentUser();
    this.boMonService.getDeTai('DAT_PHAN_BIEN', currentUser?.boMonId).subscribe({
      next: (res) => {
        if (res.success) this.svDatPB = res.data;
      }
    });

    this.boMonService.getGiangVien(currentUser?.boMonId).subscribe({
      next: (res) => {
        if (res.success) this.giangVienList = res.data;
      }
    });
  }

  showHoiDongModal(dt: DeTaiResponse): void {
    this.selectedDeTai = dt;
    this.thanhVien = [
      { giangVienId: null, vaiTro: 'CHU_TICH' },
      { giangVienId: null, vaiTro: 'THU_KY' },
      { giangVienId: null, vaiTro: 'UY_VIEN' }
    ];
    this.formData = {};
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedDeTai = null;
  }

  taoHoiDong(): void {
    if (!this.selectedDeTai) return;
    
    // Validate
    const hasEmpty = this.thanhVien.some(tv => !tv.giangVienId);
    if (hasEmpty) {
      this.toastr.warning('Vui lòng chọn đủ 3 thành viên');
      return;
    }

    // Format ngày bảo vệ theo dd/MM/yyyy
    let ngayBaoVeFormatted = '';
    if (this.formData.ngayBaoVe) {
      const date = new Date(this.formData.ngayBaoVe);
      const day = ('0' + date.getDate()).slice(-2);
      const month = ('0' + (date.getMonth() + 1)).slice(-2);
      const year = date.getFullYear();
      ngayBaoVeFormatted = `${day}/${month}/${year}`;
    }

    const data = {
      deTaiId: this.selectedDeTai.id,
      ngayBaoVe: ngayBaoVeFormatted,
      diaDiem: this.formData.diaDiem,
      thanhViens: this.thanhVien
    };

    this.boMonService.taoHoiDong(data).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Tạo hội đồng thành công!');
          this.closeModal();
          this.loadData();
        }
      }
    });
  }
}

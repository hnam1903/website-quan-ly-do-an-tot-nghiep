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
      <h2>Thành lập hội đồng bảo vệ</h2>

    </div>

    <div class="card mb-4">
     
      <div class="card-body">
        <div class="table-responsive">
          <table class="table">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sinh viên</th>
                <th>Đề tài</th>
                <th>GVHD</th>
                <th>GVPB</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of svDatPB; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ dt.hoTenSinhVien }}</td>
                <td>{{ dt.tenDeTai }}</td>
                <td>{{ dt.hoTenGiangVienHuongDan || '-' }}</td>
                <td>{{ dt.hoTenGiangVienPhanBien || '-' }}</td>
                <td>
                  <button class="btn btn-sm btn-primary" (click)="showHoiDongModal(dt)">
                    Lập HĐ
                  </button>
                </td>
              </tr>
              <tr *ngIf="svDatPB.length === 0">
                <td colspan="6" class="text-center text-muted">Không có sinh viên đủ điều kiện</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div class="modal show d-block" *ngIf="showModal" tabindex="-1" style="background: rgba(0,0,0,0.5);">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thành lập hội đồng</h5>
            <button type="button" class="btn-close" (click)="closeModal()"></button>
          </div>
          <div class="modal-body">
            <p><strong>Sinh viên:</strong> {{ selectedDeTai?.hoTenSinhVien }}</p>
            <p><strong>Đề tài:</strong> {{ selectedDeTai?.tenDeTai }}</p>
            
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label">Ngày bảo vệ</label>
                <input type="date" class="form-control" [(ngModel)]="formData.ngayBaoVe">
              </div>
              <div class="col-md-6">
                <label class="form-label">Địa điểm</label>
                <input type="text" class="form-control" [(ngModel)]="formData.diaDiem" placeholder="VD: Phòng 301">
              </div>
            </div>

            <h6>Thành viên hội đồng (3 người)</h6>
            <div *ngFor="let tv of thanhVien; let i = index" class="row mb-2">
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
            <button type="button" class="btn btn-primary" (click)="taoHoiDong()">Tạo hội đồng</button>
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

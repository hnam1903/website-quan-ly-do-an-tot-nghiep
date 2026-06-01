import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeTaiResponse, GiangVienResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-phan-cong-phan-bien-bm',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-warning-subtle">
          <span class="material-symbols-outlined text-warning">person_check</span>
        </div>
        <div>
          <h2>Phân công Giảng viên phản biện</h2>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div *ngIf="svDatGVHD.length === 0" class="alert alert-info m-4">
          <span class="material-symbols-outlined me-2">info</span>Không có sinh viên nào cần phân công phản biện.
        </div>

        <div class="table-responsive" *ngIf="svDatGVHD.length > 0">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th>Sinh viên</th>
                <th style="width: 120px">Mã SV</th>
                <th>Tên đề tài</th>
                <th style="width: 160px">GV Hướng dẫn</th>
                <th style="width: 200px">Chọn GVPB</th>
                <th style="width: 140px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of svDatGVHD; let i = index" class="align-middle">
                <td class="text-center">
                  <span class="stt-badge">{{ i + 1 }}</span>
                </td>
                <td><strong>{{ dt.hoTenSinhVien }}</strong></td>
                <td><code>{{ dt.maSinhVien }}</code></td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 200px">{{ dt.tenDeTai }}</span>
                </td>
                <td>
                  <span *ngIf="dt.hoTenGiangVienHuongDan; else noGvhd" class="text-muted">
                    <span class="material-symbols-outlined me-1">person</span>{{ dt.hoTenGiangVienHuongDan }}
                  </span>
                  <ng-template #noGvhd><span class="text-muted fst-italic">Chưa có</span></ng-template>
                </td>
                <td>
                  <select class="form-select form-select-sm" [(ngModel)]="selectedGvPbMap[dt.id]">
                    <option [value]="null">Chọn GVPB</option>
                    <option *ngFor="let gv of giangVienList" [value]="gv.id"
                            [disabled]="isGvTrungVoiGvhd(dt, gv.id)"
                            [class.text-danger]="isGvTrungVoiGvhd(dt, gv.id)"
                            [class.bg-warning]="isGvTrungVoiGvhd(dt, gv.id)">
                      {{ gv.hoTen }}
                      <span *ngIf="isGvTrungVoiGvhd(dt, gv.id)" class="text-danger fw-bold">
                        [Trùng GVHD]
                      </span>
                    </option>
                  </select>
                </td>
                <td>
                  <button class="btn btn-sm btn-primary" (click)="phanCongPB(dt.id)">
                    <span class="material-symbols-outlined me-1">check</span> Phân công
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class PhanCongPhanBienBmComponent implements OnInit {
  svDatGVHD: DeTaiResponse[] = [];
  giangVienList: GiangVienResponse[] = [];
  selectedGvPbMap: any = {};

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
    const boMonId = currentUser?.boMonId;

    this.boMonService.getDeTai('DAT_GVHD', undefined, boMonId).subscribe({
      next: (res) => {
        if (res.success) this.svDatGVHD = res.data || [];
      }
    });

    this.boMonService.getGiangVien(boMonId).subscribe({
      next: (res) => {
        if (res.success) this.giangVienList = res.data || [];
      }
    });
  }

  // Kiểm tra GV phản biện có trùng với GV hướng dẫn không
  isGvTrungVoiGvhd(dt: DeTaiResponse, gvId: number): boolean {
    return dt.giangVienHuongDanId === gvId;
  }

  phanCongPB(deTaiId: number): void {
    const gvId = this.selectedGvPbMap[deTaiId];
    if (!gvId) {
      this.toastr.warning('Vui lòng chọn giảng viên phản biện');
      return;
    }
    this.boMonService.phanCongPhanBien(deTaiId, gvId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Phân công phản biện thành công!');
          this.loadData();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
      }
    });
  }
}

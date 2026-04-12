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
      <h2>Phân công Giảng viên phản biện</h2>
    
    </div>

    <div class="card">
    
      <div class="card-body">
        <div *ngIf="svDatGVHD.length === 0" class="alert alert-info">
          Không có sinh viên nào cần phân công phản biện.
        </div>

        <div class="table-responsive" *ngIf="svDatGVHD.length > 0">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sinh viên</th>
                <th>Mã SV</th>
                <th>Tên đề tài</th>
                <th>GV Hướng dẫn</th>
                <th>Chọn GVPB</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of svDatGVHD; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ dt.hoTenSinhVien }}</td>
                <td>{{ dt.maSinhVien }}</td>
                <td>{{ dt.tenDeTai }}</td>
                <td>{{ dt.hoTenGiangVienHuongDan || 'Chưa có' }}</td>
                <td>
                  <select class="form-select form-select-sm" [(ngModel)]="selectedGvPbMap[dt.id]">
                    <option [value]="null">Chọn GVPB</option>
                    <option *ngFor="let gv of giangVienList" [value]="gv.id">
                      {{ gv.hoTen }} ({{ gv.hocVi }})
                    </option>
                  </select>
                </td>
                <td>
                  <button class="btn btn-sm btn-primary" (click)="phanCongPB(dt.id)">
                    <i class="fas fa-check"></i> Phân công
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

    this.boMonService.getDeTai('DAT_GVHD', boMonId).subscribe({
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

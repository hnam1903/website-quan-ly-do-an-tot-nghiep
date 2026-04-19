import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeTaiResponse, GiangVienResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-phan-cong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Phân công Giảng viên hướng dẫn</h2>
    
    </div>

    <div class="card">
      
      <div class="card-body">
        <div *ngIf="svDuDieuKien.length === 0" class="alert alert-info">
          Không có sinh viên cần phân công GVHD.
        </div>

        <div class="table-responsive" *ngIf="svDuDieuKien.length > 0">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sinh viên</th>
                <th>Mã SV</th>
                <th>Tên đề tài</th>
                <th>GV dự kiến</th>
                <th>Chọn GVHD</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of svDuDieuKien; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ dt.hoTenSinhVien }}</td>
                <td>{{ dt.maSinhVien }}</td>
                <td>{{ dt.tenDeTai }}</td>
                <td>{{ dt.hoTenGiangVienDuKien || 'Chưa có' }}</td>
                <td style="width: 200px;">
                  <select class="form-select form-select-sm" [(ngModel)]="selectedGvMap[dt.id]">
                    <option [value]="null">Chọn GVHD</option>
                    <option *ngFor="let gv of giangVienList" [value]="gv.id">
                      {{ gv.hoTen }} ({{ gv.hocVi }})
                    </option>
                  </select>
                </td>
                <td>
                  <button class="btn btn-sm btn-primary" (click)="phanCongHD(dt.id)">
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
export class PhanCongComponent implements OnInit {
  svDuDieuKien: DeTaiResponse[] = [];
  svDatGVHD: DeTaiResponse[] = [];
  giangVienList: GiangVienResponse[] = [];
  selectedGvMap: any = {};
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

    // Lấy đề tài DANG_THUC_HIEN - đã duyệt, cần phân công GVHD
    this.boMonService.getDeTai('DANG_THUC_HIEN', boMonId).subscribe({
      next: (res) => {
        if (res.success) this.svDuDieuKien = res.data;
      }
    });

    // Lấy đề tài bị GV từ chối, cần phân công lại
    this.boMonService.getDeTai('CHO_GV_DUYET_LAI', boMonId).subscribe({
      next: (res) => {
        if (res.success) this.svDuDieuKien = [...this.svDuDieuKien, ...res.data];
      }
    });

    this.boMonService.getGiangVien(boMonId).subscribe({
      next: (res) => {
        if (res.success) this.giangVienList = res.data;
      }
    });
  }

  phanCongHD(deTaiId: number): void {
    const gvId = this.selectedGvMap[deTaiId];
    if (!gvId) {
      this.toastr.warning('Vui lòng chọn giảng viên');
      return;
    }
    this.boMonService.phanCongHuongDan(deTaiId, gvId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Phân công thành công!');
          this.loadData();
        }
      }
    });
  }

  phanCongPB(deTaiId: number): void {
    const gvId = this.selectedGvPbMap[deTaiId];
    if (!gvId) {
      this.toastr.warning('Vui lòng chọn giảng viên');
      return;
    }
    this.boMonService.phanCongPhanBien(deTaiId, gvId).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Phân công thành công!');
          this.loadData();
        }
      }
    });
  }
}

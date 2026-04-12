import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { DeTaiResponse } from '../../../core/models/models';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-danh-sach-phan-bien',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="page-header">
      <h2>Danh sách sinh viên phản biện</h2>
 
    </div>

    <div class="card">
      <div class="card-body">
        <table class="table table-hover" *ngIf="deTaiList.length > 0">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Tên đề tài</th>
              <th>Sinh viên</th>
              <th>Lớp</th>
              <th>Bộ môn</th>
              <th>GV Hướng dẫn</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let dt of deTaiList; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ dt.tenDeTai }}</td>
              <td>{{ dt.hoTenSinhVien }}</td>
              <td>{{ dt.lopSinhVien }}</td>
              <td>{{ dt.tenBoMon }}</td>
              <td>{{ dt.hoTenGiangVienHuongDan }}</td>
              <td>
                <span *ngIf="dt.daChamDiemPB" class="badge bg-success">
                  <i class="bi bi-check-circle me-1"></i>Đã chấm ({{ dt.diemPhanBien }} đ)
                </span>
                <span *ngIf="!dt.daChamDiemPB" class="badge bg-warning text-dark">
                  <i class="bi bi-clock me-1"></i>Chưa chấm
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="deTaiList.length === 0" class="text-center py-5">
          <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
          <p class="text-muted mt-2">Không có sinh viên nào được phân công phản biện</p>
        </div>
      </div>
    </div>
  `
})
export class DanhSachPhanBienComponent implements OnInit {
  deTaiList: DeTaiResponse[] = [];

  constructor(private gvService: GiangVienService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.gvService.getDeTaiPhanBien().subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiList = res.data;
        }
      }
    });
  }
}

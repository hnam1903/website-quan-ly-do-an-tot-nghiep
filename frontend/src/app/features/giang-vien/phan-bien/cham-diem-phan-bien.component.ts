import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { DeTaiResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cham-diem-phan-bien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Chấm điểm phản biện</h2>
    
    </div>

    <div class="card">
      <div class="card-body">
        <table class="table table-hover" *ngIf="phanBienList.length > 0">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Họ tên SV</th>
              <th>Mã SV</th>
              <th>Tên đề tài</th>
              <th>GVHD</th>
              <th>Điểm</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let dt of phanBienList; let i = index">
              <tr>
                <td>{{ i + 1 }}</td>
                <td>{{ dt.hoTenSinhVien || '-' }}</td>
                <td>{{ dt.maSinhVien || '-' }}</td>
                <td>{{ dt.tenDeTai }}</td>
                <td>{{ dt.hoTenGiangVienHuongDan || '-' }}</td>
                <td>{{ dt.diemPhanBien || '-' }}</td>
                <td>
                  <span *ngIf="dt.daChamDiemPB" class="badge bg-success">Đã chấm</span>
                  <span *ngIf="!dt.daChamDiemPB" class="badge bg-warning text-dark">Chưa chấm</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-primary" (click)="showForm(dt)">
                    <i class="bi bi-pencil"></i> {{ dt.daChamDiemPB ? 'Sửa điểm' : 'Chấm điểm' }}
                  </button>
                </td>
              </tr>
              <!-- Form chấm điểm -->
              <tr *ngIf="activeFormId === dt.id" class="table-secondary">
                <td colspan="8">
                  <div class="row g-2 align-items-end">
                    <div class="col-md-2">
                      <label class="form-label">Điểm (0 - 10)</label>
                      <input type="number" class="form-control" [(ngModel)]="diemMap[dt.id]"
                             placeholder="0-10" min="0" max="10">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Nhận xét</label>
                      <input type="text" class="form-control" [(ngModel)]="nhanXetMap[dt.id]"
                             placeholder="Nhận xét về đồ án...">
                    </div>
                    <div class="col-md-2">
                      <button class="btn btn-success w-100" (click)="chamDiem(dt)">
                        <i class="bi bi-check-lg"></i> Lưu
                      </button>
                    </div>
                    <div class="col-md-2">
                      <button class="btn btn-secondary w-100" (click)="cancelForm()">
                        <i class="bi bi-x-lg"></i> Hủy
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>

        <div *ngIf="phanBienList.length === 0" class="text-center py-5">
          <i class="bi bi-check-circle" style="font-size: 3rem; color: #ccc;"></i>
          <p class="text-muted mt-2">Không có sinh viên cần chấm điểm phản biện</p>
        </div>
      </div>
    </div>
  `
})
export class ChamDiemPhanBienComponent implements OnInit {
  phanBienList: DeTaiResponse[] = [];
  diemMap: any = {};
  nhanXetMap: any = {};
  activeFormId: number | null = null;

  constructor(
    private gvService: GiangVienService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.gvService.getDeTaiPhanBien().subscribe({
      next: (res) => {
        if (res.success) {
          this.phanBienList = res.data;
        }
      },
      error: (err) => console.error('Lỗi load:', err)
    });
  }

  showForm(dt: DeTaiResponse): void {
    this.activeFormId = dt.id;
    // Pre-fill dữ liệu nếu đã chấm
    if (dt.daChamDiemPB) {
      this.diemMap[dt.id] = dt.diemPhanBien;
      this.nhanXetMap[dt.id] = dt.nhanXetPhanBien;
    } else {
      this.diemMap[dt.id] = null;
      this.nhanXetMap[dt.id] = null;
    }
  }

  cancelForm(): void {
    this.activeFormId = null;
  }

  chamDiem(dt: DeTaiResponse): void {
    const diem = this.diemMap[dt.id];
    if (!diem || diem < 0 || diem > 10) {
      this.toastr.warning('Điểm phải từ 0 đến 10');
      return;
    }
    this.gvService.chamDiemPhanBien({
      deTaiId: dt.id,
      diem,
      nhanXet: this.nhanXetMap[dt.id]
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Chấm điểm thành công!');
          this.activeFormId = null;
          this.loadData();
        }
      },
      error: () => {
        this.toastr.error('Chấm điểm thất bại');
      }
    });
  }
}

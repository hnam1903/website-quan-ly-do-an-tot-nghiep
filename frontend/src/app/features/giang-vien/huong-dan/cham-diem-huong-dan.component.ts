import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { PhanCongHuongDanResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cham-diem-huong-dan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Chấm điểm hướng dẫn</h2>
      <p class="text-muted mb-0">Chấm điểm sinh viên được hướng dẫn</p>
    </div>

    <div class="card">
      <div class="card-body">
        <table class="table table-hover" *ngIf="huongDanList.length > 0">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Họ tên SV</th>
              <th>Mã SV</th>
              <th>Tên đề tài</th>
              <th>Điểm</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let pc of huongDanList; let i = index">
              <tr>
                <td>{{ i + 1 }}</td>
                <td>{{ pc.hoTenSinhVien || '-' }}</td>
                <td>{{ pc.maSinhVien || '-' }}</td>
                <td>{{ pc.tenDeTai }}</td>
                <td>
                  <span *ngIf="pc.daChamDiem" class="badge bg-success">{{ pc.diemCham }}</span>
                  <span *ngIf="!pc.daChamDiem" class="badge bg-secondary">-</span>
                </td>
                <td>
                  <span *ngIf="pc.daChamDiem" class="badge bg-success">Đã chấm</span>
                  <span *ngIf="!pc.daChamDiem" class="badge bg-warning text-dark">Chưa chấm</span>
                </td>
                <td>
                  <button *ngIf="!pc.daChamDiem" class="btn btn-sm btn-primary" (click)="showForm(pc.id)">
                    <i class="bi bi-pencil"></i> Chấm điểm
                  </button>
                  <span *ngIf="pc.daChamDiem" class="text-muted">
                    {{ pc.nhanXetCham || 'Không có nhận xét' }}
                  </span>
                </td>
              </tr>
              <!-- Form chấm điểm -->
              <tr *ngIf="activeFormId === pc.id" class="table-secondary">
                <td colspan="7">
                  <div class="row g-2 align-items-end">
                    <div class="col-md-2">
                      <label class="form-label">Điểm (0 - 10)</label>
                      <input type="number" class="form-control" [(ngModel)]="diemMap[pc.id]"
                             placeholder="0-10" min="0" max="10">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Nhận xét</label>
                      <input type="text" class="form-control" [(ngModel)]="nhanXetMap[pc.id]"
                             placeholder="Nhận xét về đồ án...">
                    </div>
                    <div class="col-md-2">
                      <button class="btn btn-success w-100" (click)="chamDiem(pc)">
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

        <div *ngIf="huongDanList.length === 0" class="text-center py-5">
          <i class="bi bi-check-circle" style="font-size: 3rem; color: #ccc;"></i>
          <p class="text-muted mt-2">Không có sinh viên cần chấm điểm</p>
        </div>
      </div>
    </div>
  `
})
export class ChamDiemHuongDanComponent implements OnInit {
  huongDanList: PhanCongHuongDanResponse[] = [];
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
    this.gvService.getDeTaiHuongDan().subscribe({
      next: (res) => {
        if (res.success) {
          this.huongDanList = res.data;
        }
      },
      error: (err) => console.error('Lỗi load:', err)
    });
  }

  showForm(id: number): void {
    this.activeFormId = id;
  }

  cancelForm(): void {
    this.activeFormId = null;
  }

  chamDiem(pc: PhanCongHuongDanResponse): void {
    const diem = this.diemMap[pc.id];
    if (!diem || diem < 0 || diem > 10) {
      this.toastr.warning('Điểm phải từ 0 đến 10');
      return;
    }
    this.gvService.chamDiemHuongDan({
      deTaiId: pc.deTaiId,
      diem,
      nhanXet: this.nhanXetMap[pc.id]
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

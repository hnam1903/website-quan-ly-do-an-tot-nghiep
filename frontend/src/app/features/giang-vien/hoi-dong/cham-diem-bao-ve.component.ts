import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { HoiDongBaoVeResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-cham-diem-bao-ve',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Chấm điểm bảo vệ</h2>
      <p class="text-muted mb-0">Chấm điểm sinh viên trong hội đồng bảo vệ</p>
    </div>

    <div class="card">
      <div class="card-body">
        <table class="table table-hover" *ngIf="hoiDongList.length > 0">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Họ tên SV</th>
              <th>Mã SV</th>
              <th>Tên đề tài</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let hd of hoiDongList; let i = index">
              <tr>
                <td>{{ i + 1 }}</td>
                <td>{{ hd.hoTenSinhVien || '-' }}</td>
                <td>{{ hd.maSinhVien || '-' }}</td>
                <td>{{ hd.tenDeTai }}</td>
                <td>
                  <span *ngIf="hd.daChamDiem" class="badge bg-success">Đã chấm</span>
                  <span *ngIf="!hd.daChamDiem" class="badge bg-warning text-dark">Chưa chấm</span>
                </td>
                <td>
                  <button *ngIf="!hd.daChamDiem" class="btn btn-sm btn-primary" (click)="showForm(hd.id)">
                    <i class="bi bi-pencil"></i> Chấm điểm
                  </button>
                  <span *ngIf="hd.daChamDiem" class="text-muted">
                    <i class="bi bi-check-circle text-success"></i>
                    {{ hd.diemCham }} / 10
                    <span *ngIf="hd.nhanXetCham"> - {{ hd.nhanXetCham }}</span>
                  </span>
                </td>
              </tr>
              <!-- Form chấm điểm -->
              <tr *ngIf="activeFormId === hd.id" class="table-secondary">
                <td colspan="6">
                  <div class="row g-2 align-items-end">
                    <div class="col-md-2">
                      <label class="form-label">Điểm (0 - 10)</label>
                      <input type="number" class="form-control" [(ngModel)]="diemMap[hd.id]"
                             placeholder="0-10" min="0" max="10">
                    </div>
                    <div class="col-md-6">
                      <label class="form-label">Nhận xét</label>
                      <input type="text" class="form-control" [(ngModel)]="nhanXetMap[hd.id]"
                             placeholder="Nhận xét...">
                    </div>
                    <div class="col-md-2">
                      <button class="btn btn-success w-100" (click)="chamDiem(hd)">
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

        <div *ngIf="hoiDongList.length === 0" class="text-center py-5">
          <i class="bi bi-check-circle" style="font-size: 3rem; color: #ccc;"></i>
          <p class="text-muted mt-2">Không có hội đồng nào cần chấm điểm</p>
        </div>
      </div>
    </div>
  `
})
export class ChamDiemBaoVeComponent implements OnInit {
  hoiDongList: HoiDongBaoVeResponse[] = [];
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
    this.gvService.getHoiDongBaoVe().subscribe({
      next: (res) => {
        if (res.success) {
          this.hoiDongList = res.data;
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

  chamDiem(hd: HoiDongBaoVeResponse): void {
    const diem = this.diemMap[hd.id];
    if (!diem || diem < 0 || diem > 10) {
      this.toastr.warning('Điểm phải từ 0 đến 10');
      return;
    }
    this.gvService.chamDiemBaoVe({
      hoiDongId: hd.id,
      diem,
      nhanXet: this.nhanXetMap[hd.id]
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

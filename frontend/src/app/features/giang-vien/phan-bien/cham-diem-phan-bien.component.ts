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
      <p class="text-muted mb-0">Chấm điểm sinh viên được phân công phản biện</p>
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngFor="let dt of deTaiList" class="border-bottom pb-3 mb-3">
          <h6>{{ dt.tenDeTai }}</h6>
          <p class="mb-2">
            <small>
              <strong>Sinh viên:</strong> {{ dt.hoTenSinhVien }} |
              <strong>Lớp:</strong> {{ dt.lopSinhVien }} |
              <strong>GVHD:</strong> {{ dt.hoTenGiangVienHuongDan }}
            </small>
          </p>

          <div *ngIf="dt.daChamDiemPB" class="alert alert-success mb-0">
            <i class="bi bi-check-circle"></i> <strong>Đã chấm điểm</strong>
            <br>
            <strong>Điểm:</strong> {{ dt.diemPhanBien }} / 10
          </div>

          <div *ngIf="!dt.daChamDiemPB" class="row align-items-end">
            <div class="col-md-3">
              <label class="form-label">Điểm (0 - 10)</label>
              <input type="number" class="form-control" [(ngModel)]="diemMap[dt.id]"
                     placeholder="0 - 10" min="0" max="10">
            </div>
            <div class="col-md-6">
              <label class="form-label">Nhận xét</label>
              <input type="text" class="form-control" [(ngModel)]="nhanXetMap[dt.id]"
                     placeholder="Nhận xét về đồ án...">
            </div>
            <div class="col-md-3">
              <button class="btn btn-primary w-100" (click)="chamDiem(dt.id)">
                <i class="bi bi-check-lg me-1"></i>Chấm điểm
              </button>
            </div>
          </div>
        </div>

        <p *ngIf="deTaiList.length === 0" class="text-muted text-center py-4">
          <i class="bi bi-check-circle" style="font-size: 2rem;"></i><br>
          Không có sinh viên cần chấm điểm phản biện
        </p>
      </div>
    </div>
  `
})
export class ChamDiemPhanBienComponent implements OnInit {
  deTaiList: DeTaiResponse[] = [];
  diemMap: any = {};
  nhanXetMap: any = {};

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
          this.deTaiList = res.data;
        }
      }
    });
  }

  chamDiem(id: number): void {
    const diem = this.diemMap[id];
    if (!diem || diem < 0 || diem > 10) {
      this.toastr.warning('Điểm phải từ 0 đến 10');
      return;
    }
    this.gvService.chamDiemPhanBien({
      deTaiId: id,
      diem,
      nhanXet: this.nhanXetMap[id]
    }).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Chấm điểm thành công!');
          this.loadData();
        }
      },
      error: () => {
        this.toastr.error('Chấm điểm thất bại');
      }
    });
  }
}

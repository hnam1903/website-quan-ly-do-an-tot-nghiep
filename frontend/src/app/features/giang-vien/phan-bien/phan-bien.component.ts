import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { DeTaiResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-phan-bien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Phản biện đồ án</h2>
      <p class="text-muted mb-0">Danh sách sinh viên cần phản biện</p>
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngFor="let dt of deTaiList" class="border-bottom pb-3 mb-3">
          <h6>{{ dt.tenDeTai }}</h6>
          <p class="mb-2"><small>Sinh viên: {{ dt.hoTenSinhVien }}</small></p>

          <div *ngIf="dt.daChamDiemPB" class="alert alert-success mb-0">
            <i class="bi bi-check-circle"></i> <strong>Đã phản biện</strong>
            <br>Điểm: <strong>{{ dt.diemPhanBien }}</strong>
          </div>

          <div *ngIf="!dt.daChamDiemPB" class="row">
            <div class="col-md-4">
              <input type="number" class="form-control" [(ngModel)]="diemMap[dt.id]" placeholder="Điểm (0-10)" min="0" max="10">
            </div>
            <div class="col-md-6">
              <input type="text" class="form-control" [(ngModel)]="nhanXetMap[dt.id]" placeholder="Nhận xét">
            </div>
            <div class="col-md-2">
              <button class="btn btn-primary" (click)="chamDiem(dt.id)">Chấm điểm</button>
            </div>
          </div>
        </div>
        <p *ngIf="deTaiList.length === 0" class="text-muted">Không có sinh viên cần phản biện</p>
      </div>
    </div>
  `
})
export class PhanBienComponent implements OnInit {
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
      }
    });
  }
}

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
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-warning-subtle">
          <span class="material-symbols-outlined text-warning">edit_note</span>
        </div>
        <div>
          <h2>Chấm điểm hướng dẫn</h2>
          <p class="mb-0">Nhập điểm và nhận xét cho sinh viên được hướng dẫn</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table table-hover mb-0" *ngIf="huongDanList.length > 0">
          <thead>
            <tr>
              <th class="text-center" style="width: 60px">STT</th>
              <th style="width: 160px">Họ tên SV</th>
              <th style="width: 100px">Mã SV</th>
              <th>Tên đề tài</th>
              <th style="width: 80px" class="text-center">Điểm</th>
              <th style="width: 100px">Trạng thái</th>
              <th style="width: 140px" class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let pc of huongDanList; let i = index">
              <tr class="align-middle">
                <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
                <td><strong>{{ pc.hoTenSinhVien || '-' }}</strong></td>
                <td><code>{{ pc.maSinhVien || '-' }}</code></td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 250px">{{ pc.tenDeTai }}</span>
                </td>
                <td class="text-center">
                  <strong [class.text-success]="pc.diemCham" [class.text-warning]="!pc.diemCham">
                    {{ pc.diemCham || '-' }}
                  </strong>
                </td>
                <td>
                  <span *ngIf="pc.daChamDiem" class="badge bg-success">
                    <span class="material-symbols-outlined me-1 text-white">check_circle</span>Đã chấm
                  </span>
                  <span *ngIf="!pc.daChamDiem" class="badge bg-warning text-dark">
                    <span class="material-symbols-outlined me-1">hourglass_empty</span>Chưa chấm
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm" [class.btn-outline-warning]="!pc.daChamDiem" [class.btn-outline-secondary]="pc.daChamDiem" (click)="showForm(pc)">
                    <span class="material-symbols-outlined me-1">edit</span>{{ pc.daChamDiem ? 'Sửa' : 'Chấm điểm' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="activeFormId === pc.id" class="table-active">
                <td colspan="7">
                  <div class="p-4 bg-light rounded">
                    <h6 class="mb-3"><span class="material-symbols-outlined me-2">edit_note</span>Chấm điểm cho: {{ pc.hoTenSinhVien }}</h6>
                    <div class="row g-3">
                      <div class="col-md-3">
                        <label class="form-label">Điểm (0 - 10)</label>
                        <input type="number" class="form-control" [(ngModel)]="diemMap[pc.id]"
                               placeholder="0-10" min="0" max="10">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Nhận xét</label>
                        <input type="text" class="form-control" [(ngModel)]="nhanXetMap[pc.id]"
                               placeholder="Nhận xét về đồ án...">
                      </div>
                      <div class="col-md-3 d-flex align-items-end gap-2">
                        <button class="btn btn-success flex-grow-1" (click)="chamDiem(pc)">
                          <span class="material-symbols-outlined me-1">check</span>Lưu
                        </button>
                        <button class="btn btn-secondary" (click)="cancelForm()">
                          <span class="material-symbols-outlined">close</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>

        <div *ngIf="huongDanList.length === 0" class="text-center py-5">
          <div class="empty-state">
            <span class="material-symbols-outlined text-success fs-2 d-block mb-3">task_alt</span>
            <p class="mb-1 fw-semibold">Không có sinh viên cần chấm điểm</p>
            <small class="text-muted">Danh sách sẽ được cập nhật khi có sinh viên</small>
          </div>
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

  showForm(pc: PhanCongHuongDanResponse): void {
    this.activeFormId = pc.id;
    if (pc.daChamDiem) {
      this.diemMap[pc.id] = pc.diemCham;
      this.nhanXetMap[pc.id] = pc.nhanXetCham;
    } else {
      this.diemMap[pc.id] = null;
      this.nhanXetMap[pc.id] = null;
    }
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

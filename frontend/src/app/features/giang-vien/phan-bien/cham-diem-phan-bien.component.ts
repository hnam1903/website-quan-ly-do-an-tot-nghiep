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
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-warning-subtle">
          <span class="material-symbols-outlined text-warning">rate_review</span>
        </div>
        <div>
          <h2>Chấm điểm phản biện</h2>
          <p class="mb-0">Nhập điểm và nhận xét phản biện cho sinh viên</p>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <select class="form-select" [(ngModel)]="selectedDotId" (change)="onDotChange()" style="width: 220px;">
          <option [ngValue]="null">Tất cả các đợt</option>
          <option *ngFor="let dot of dotDangKyList" [ngValue]="dot.id">{{ dot.tenDot }}</option>
        </select>
        <span class="badge bg-warning text-dark">{{ filteredList.length }} sinh viên</span>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table table-hover mb-0" *ngIf="filteredList.length > 0">
          <thead>
            <tr>
              <th class="text-center" style="width: 60px">STT</th>
              <th style="width: 160px">Họ tên SV</th>
              <th style="width: 100px">Mã SV</th>
              <th>Tên đề tài</th>
              <th style="width: 140px">GVHD</th>
              <th style="width: 80px" class="text-center">Điểm</th>
              <th style="width: 100px">Trạng thái</th>
              <th style="width: 140px" class="text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let dt of filteredList; let i = index">
              <tr class="align-middle">
                <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
                <td><strong>{{ dt.hoTenSinhVien || '-' }}</strong></td>
                <td><code>{{ dt.maSinhVien || '-' }}</code></td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 250px">{{ dt.tenDeTai }}</span>
                </td>
                <td>{{ dt.hoTenGiangVienHuongDan || '-' }}</td>
                <td class="text-center">
                  <strong [class.text-success]="dt.diemPhanBien" [class.text-warning]="!dt.diemPhanBien">
                    {{ dt.diemPhanBien || '-' }}
                  </strong>
                </td>
                <td>
                  <span *ngIf="dt.daChamDiemPB" class="badge bg-success">
                    <span class="material-symbols-outlined me-1 text-white">check_circle</span>Đã chấm
                  </span>
                  <span *ngIf="!dt.daChamDiemPB" class="badge bg-warning text-dark">
                    <span class="material-symbols-outlined me-1">hourglass_empty</span>Chưa chấm
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm" [class.btn-outline-warning]="!dt.daChamDiemPB" [class.btn-outline-secondary]="dt.daChamDiemPB" (click)="showForm(dt)">
                    <span class="material-symbols-outlined me-1">edit</span>{{ dt.daChamDiemPB ? 'Sửa' : 'Chấm điểm' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="activeFormId === dt.id" class="table-active">
                <td colspan="8">
                  <div class="p-4 bg-light rounded">
                    <h6 class="mb-3"><span class="material-symbols-outlined me-2">rate_review</span>Chấm điểm phản biện cho: {{ dt.hoTenSinhVien }}</h6>
                    <div class="row g-3">
                      <div class="col-md-3">
                        <label class="form-label">Điểm (0 - 10)</label>
                        <input type="number" class="form-control" [(ngModel)]="diemMap[dt.id]"
                               placeholder="0-10" min="0" max="10">
                      </div>
                      <div class="col-md-6">
                        <label class="form-label">Nhận xét</label>
                        <input type="text" class="form-control" [(ngModel)]="nhanXetMap[dt.id]"
                               placeholder="Nhận xét về đồ án...">
                      </div>
                      <div class="col-md-3 d-flex align-items-end gap-2">
                        <button class="btn btn-success flex-grow-1" (click)="chamDiem(dt)">
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

        <div *ngIf="filteredList.length === 0" class="text-center py-5">
          <div class="empty-state">
            <span class="material-symbols-outlined text-success fs-2 d-block mb-3">task_alt</span>
            <p class="mb-1 fw-semibold">Không có sinh viên cần chấm điểm phản biện</p>
            <small class="text-muted">Danh sách sẽ được cập nhật khi có sinh viên</small>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ChamDiemPhanBienComponent implements OnInit {
  phanBienList: DeTaiResponse[] = [];
  filteredList: DeTaiResponse[] = [];
  diemMap: any = {};
  nhanXetMap: any = {};
  activeFormId: number | null = null;

  dotDangKyList: any[] = [];
  selectedDotId: number | null = null;

  constructor(
    private gvService: GiangVienService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDotList();
  }

  loadDotList(): void {
    this.gvService.getDotDangKy().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dotDangKyList = res.data || [];
          if (this.dotDangKyList.length > 0) {
            this.selectedDotId = this.dotDangKyList[0].id;
          }
        }
        this.loadData();
      },
      error: () => {
        this.dotDangKyList = [];
        this.loadData();
      }
    });
  }

  loadData(): void {
    const dotId = this.selectedDotId ?? undefined;
    this.gvService.getDeTaiPhanBien(dotId).subscribe({
      next: (res) => {
        if (res.success) {
          this.phanBienList = res.data;
          this.applyFilter();
        }
      },
      error: (err) => console.error('Lỗi load:', err)
    });
  }

  onDotChange(): void {
    this.loadData();
  }

  applyFilter(): void {
    this.filteredList = this.phanBienList;
  }

  showForm(dt: DeTaiResponse): void {
    this.activeFormId = dt.id;
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

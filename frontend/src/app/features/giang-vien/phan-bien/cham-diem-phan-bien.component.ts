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
          <i class="bi bi-chat-square-text text-warning"></i>
        </div>
        <div>
          <h2>Chấm điểm phản biện</h2>
          <p class="mb-0">Nhập điểm và nhận xét phản biện cho sinh viên</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table table-hover mb-0" *ngIf="phanBienList.length > 0">
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
            <ng-container *ngFor="let dt of phanBienList; let i = index">
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
                  <span *ngIf="dt.daChamDiemPB" class="badge badge-success">
                    <i class="bi bi-check-circle-fill me-1"></i>Đã chấm
                  </span>
                  <span *ngIf="!dt.daChamDiemPB" class="badge badge-warning text-dark">
                    <i class="bi bi-hourglass-split me-1"></i>Chưa chấm
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm" [class.btn-outline-warning]="!dt.daChamDiemPB" [class.btn-outline-secondary]="dt.daChamDiemPB" (click)="showForm(dt)">
                    <i class="bi bi-pencil me-1"></i>{{ dt.daChamDiemPB ? 'Sửa' : 'Chấm điểm' }}
                  </button>
                </td>
              </tr>
              <tr *ngIf="activeFormId === dt.id" class="table-active">
                <td colspan="8">
                  <div class="p-4 bg-light rounded">
                    <h6 class="mb-3"><i class="bi bi-chat-square-text me-2"></i>Chấm điểm phản biện cho: {{ dt.hoTenSinhVien }}</h6>
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
                          <i class="bi bi-check-lg me-1"></i>Lưu
                        </button>
                        <button class="btn btn-secondary" (click)="cancelForm()">
                          <i class="bi bi-x-lg"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>

        <div *ngIf="phanBienList.length === 0" class="text-center py-5">
          <div class="empty-state">
            <i class="bi bi-check-circle text-success fs-1 d-block mb-3"></i>
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

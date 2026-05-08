import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { HoiDongBaoVeResponse } from '../../../core/models/models';

@Component({
  selector: 'app-danh-sach-bao-ve',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-success-subtle">
          <span class="material-symbols-outlined text-success">groups</span>
        </div>
        <div>
          <h2>Danh sách hội đồng bảo vệ</h2>
          <p class="mb-0">Xem lịch và thông tin hội đồng bảo vệ</p>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <select class="form-select" [(ngModel)]="selectedDotId" (change)="onDotChange()" style="width: 220px;">
          <option [ngValue]="null">Tất cả các đợt</option>
          <option *ngFor="let dot of dotDangKyList" [ngValue]="dot.id">{{ dot.tenDot }}</option>
        </select>
        <span class="badge bg-success">{{ filteredList.length }} hội đồng</span>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table table-hover mb-0" *ngIf="filteredList.length > 0">
          <thead class="table-light">
            <tr>
              <th class="text-center" style="width: 60px">STT</th>
              <th style="width: 100px">Mã SV</th>
              <th style="width: 160px">Họ tên SV</th>
              <th style="width: 100px">Lớp</th>
              <th>Tên đề tài</th>
              <th style="width: 110px">Ngày bảo vệ</th>
              <th style="width: 80px">Phòng</th>
              <th style="width: 140px" class="text-center">Thành viên</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let hd of filteredList; let i = index" class="align-middle">
              <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
              <td><code>{{ hd.maSinhVien || '-' }}</code></td>
              <td><strong>{{ hd.hoTenSinhVien || '-' }}</strong></td>
              <td>{{ hd.lopSinhVien || '-' }}</td>
              <td>
                <span class="text-truncate d-inline-block" style="max-width: 280px">{{ hd.tenDeTai }}</span>
              </td>
              <td>{{ hd.ngayBaoVe | date:'dd/MM/yyyy' }}</td>
              <td>{{ hd.diaDiem || '-' }}</td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary" (click)="xemThanhVien(hd)">
                  <span class="material-symbols-outlined me-1">group</span> Xem ({{ hd.thanhViens?.length || 0 }})
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="filteredList.length === 0" class="text-center py-5">
          <div class="empty-state">
            <span class="material-symbols-outlined" style="font-size: 3rem; color: #ccc;">inbox</span>
            <p class="text-muted mt-2">Bạn không có hội đồng nào</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal thành viên -->
    <div class="modal fade" id="thanhVienModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content" *ngIf="selected">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Thành viên hội đồng</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="fw-bold">Đề tài</label>
              <p class="mb-2">{{ selected.tenDeTai }}</p>
            </div>
            <div class="mb-3">
              <label class="fw-bold">Sinh viên</label>
              <p class="mb-2">{{ selected.hoTenSinhVien }} ({{ selected.maSinhVien }}) - {{ selected.lopSinhVien }}</p>
            </div>
            <div class="mb-3">
              <label class="fw-bold">Ngày bảo vệ</label>
              <p class="mb-2">{{ selected.ngayBaoVe | date:'dd/MM/yyyy HH:mm' }}</p>
            </div>
            <div class="mb-3">
              <label class="fw-bold">Địa điểm</label>
              <p class="mb-2">{{ selected.diaDiem }}</p>
            </div>
            <div class="mb-3">
              <label class="fw-bold">Thành viên</label>
              <ul class="list-group">
                <li class="list-group-item" *ngFor="let tv of selected.thanhViens">
                  <span class="material-symbols-outlined me-2">badge</span>
                  <strong>{{ tv.hoTenGiangVien }}</strong>
                  <span class="text-muted"> - {{ tv.hocVi }}</span>
                  <span class="badge bg-info ms-2">{{ tv.vaiTro }}</span>
                </li>
              </ul>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DanhSachBaoVeComponent implements OnInit {
  hoiDongList: HoiDongBaoVeResponse[] = [];
  filteredList: HoiDongBaoVeResponse[] = [];
  selected: HoiDongBaoVeResponse | null = null;

  dotDangKyList: any[] = [];
  selectedDotId: number | null = null;

  constructor(private gvService: GiangVienService) {}

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
    this.gvService.getHoiDongBaoVe(dotId).subscribe({
      next: (res) => {
        if (res.success) {
          this.hoiDongList = res.data;
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
    this.filteredList = this.hoiDongList;
  }

  xemThanhVien(hd: HoiDongBaoVeResponse): void {
    this.selected = hd;
    const modalEl = document.getElementById('thanhVienModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
}

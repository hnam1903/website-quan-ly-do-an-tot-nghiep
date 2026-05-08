import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { PhanCongHuongDanResponse } from '../../../core/models/models';

@Component({
  selector: 'app-danh-sach-huong-dan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-primary-subtle">
          <span class="material-symbols-outlined text-primary">checklist</span>
        </div>
        <div>
          <h2>Danh sách hướng dẫn</h2>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <select class="form-select" [(ngModel)]="selectedDotId" (change)="onDotChange()" style="width: 220px;">
          <option [ngValue]="null">Tất cả các đợt</option>
          <option *ngFor="let dot of dotDangKyList" [ngValue]="dot.id">{{ dot.tenDot }}</option>
        </select>
        <span class="badge bg-primary">{{ filteredList.length }} sinh viên</span>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table table-hover mb-0" *ngIf="filteredList.length > 0">
          <thead>
            <tr>
              <th class="text-center" style="width: 60px">STT</th>
              <th style="width: 120px">Mã SV</th>
              <th style="width: 160px">Họ tên SV</th>
              <th style="width: 100px">Lớp</th>
              <th>Tên đề tài</th>
              <th style="width: 140px" class="text-center">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pc of filteredList; let i = index" class="align-middle">
              <td class="text-center">
                <span class="stt-badge">{{ i + 1 }}</span>
              </td>
              <td><code>{{ pc.maSinhVien || '-' }}</code></td>
              <td><strong>{{ pc.hoTenSinhVien || '-' }}</strong></td>
              <td>{{ pc.lopSinhVien || '-' }}</td>
              <td>
                <span class="text-truncate d-inline-block" style="max-width: 300px">{{ pc.tenDeTai }}</span>
              </td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary btn-icon" (click)="xemChiTiet(pc)" title="Xem chi tiết">
                  <span class="material-symbols-outlined">visibility</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="filteredList.length === 0" class="text-center py-5">
          <div class="empty-state">
            <span class="material-symbols-outlined fs-2 d-block mb-3" style="color: #ccc;">inbox</span>
            <p class="mb-1 fw-semibold">Chưa có sinh viên nào được hướng dẫn</p>
            <small class="text-muted">Danh sách sẽ được cập nhật khi có sinh viên được phân công</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal chi tiết -->
    <div class="modal fade" id="chiTietModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="selected">
          <div class="modal-header">
            <h5 class="modal-title"><span class="material-symbols-outlined me-2">info</span>Chi tiết đề tài</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Sinh viên</label>
                  <p class="info-value">{{ selected.hoTenSinhVien }}</p>
                  <small class="text-muted">Mã SV: {{ selected.maSinhVien }} | Lớp: {{ selected.lopSinhVien }}</small>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Bộ môn</label>
                  <p class="info-value">{{ selected.tenBoMon || '-' }}</p>
                </div>
              </div>
              <div class="col-12">
                <div class="info-group">
                  <label class="info-label">Tên đề tài</label>
                  <p class="info-title">{{ selected.tenDeTai }}</p>
                </div>
              </div>
              <div class="col-12">
                <div class="info-group">
                  <label class="info-label">Nội dung đề tài</label>
                  <p class="info-value" style="white-space: pre-line;">{{ selected.noiDungDuKien || 'Không có thông tin' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Công nghệ sử dụng</label>
                  <p class="info-value">{{ selected.congNgheSuDung || 'Không có thông tin' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">GV Hướng dẫn</label>
                  <p class="info-value">{{ selected.hoTenGiangVien }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group mb-0">
                  <label class="info-label">Trạng thái</label>
                  <p class="info-value">
                    <span *ngIf="selected.trangThai === 'CHO_DUYET'" class="badge bg-warning text-dark">Chờ duyệt</span>
                    <span *ngIf="selected.trangThai === 'DUYET'" class="badge bg-success">Đã duyệt</span>
                  </p>
                </div>
              </div>
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
export class DanhSachHuongDanComponent implements OnInit {
  huongDanList: PhanCongHuongDanResponse[] = [];
  filteredList: PhanCongHuongDanResponse[] = [];
  selected: PhanCongHuongDanResponse | null = null;
  
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
    this.gvService.getDeTaiHuongDan(dotId).subscribe({
      next: (res) => {
        if (res.success) {
          this.huongDanList = res.data;
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
    this.filteredList = this.huongDanList;
  }

  xemChiTiet(pc: PhanCongHuongDanResponse): void {
    this.selected = pc;
    const modalEl = document.getElementById('chiTietModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
}

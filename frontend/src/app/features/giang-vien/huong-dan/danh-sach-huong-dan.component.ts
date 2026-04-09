import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { PhanCongHuongDanResponse } from '../../../core/models/models';

@Component({
  selector: 'app-danh-sach-huong-dan',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>Danh sách hướng dẫn</h2>
      <p class="text-muted mb-0">Thông tin sinh viên và đề tài được hướng dẫn</p>
    </div>

    <div class="card">
      <div class="card-body">
        <table class="table table-hover" *ngIf="huongDanList.length > 0">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Mã SV</th>
              <th>Họ tên SV</th>
              <th>Lớp</th>
              <th>Tên đề tài</th>
              <th>Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let pc of huongDanList; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ pc.maSinhVien || '-' }}</td>
              <td>{{ pc.hoTenSinhVien || '-' }}</td>
              <td>{{ pc.lopSinhVien || '-' }}</td>
              <td>{{ pc.tenDeTai }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" (click)="xemChiTiet(pc)">
                  <i class="bi bi-eye"></i> Xem chi tiết
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="huongDanList.length === 0" class="text-center py-5">
          <i class="bi bi-inbox" style="font-size: 3rem; color: #ccc;"></i>
          <p class="text-muted mt-2">Chưa có sinh viên nào được hướng dẫn</p>
        </div>
      </div>
    </div>

    <!-- Modal chi tiết -->
    <div class="modal fade" id="chiTietModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="selected">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Chi tiết đề tài</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="fw-bold">Sinh viên</label>
                <p class="mb-1">{{ selected.hoTenSinhVien }}</p>
                <small class="text-muted">Mã SV: {{ selected.maSinhVien }} | Lớp: {{ selected.lopSinhVien }}</small>
              </div>
              <div class="col-md-6">
                <label class="fw-bold">Bộ môn</label>
                <p>{{ selected.tenBoMon || '-' }}</p>
              </div>
            </div>
            <div class="mb-3">
              <label class="fw-bold">Tên đề tài</label>
              <p class="mb-0">{{ selected.tenDeTai }}</p>
            </div>
            <div class="mb-3">
              <label class="fw-bold">Nội dung đề tài</label>
              <p class="mb-0" style="white-space: pre-wrap;">{{ selected.noiDungDuKien || 'Không có thông tin' }}</p>
            </div>
            <div class="mb-3">
              <label class="fw-bold">Công nghệ sử dụng</label>
              <p class="mb-0">{{ selected.congNgheSuDung || 'Không có thông tin' }}</p>
            </div>
            <div class="row">
              <div class="col-md-6">
                <label class="fw-bold">GV Hướng dẫn</label>
                <p class="mb-0">{{ selected.hoTenGiangVien }}</p>
              </div>
              <div class="col-md-6">
                <label class="fw-bold">Trạng thái</label>
                <p class="mb-0">
                  <span *ngIf="selected.trangThai === 'CHO_DUYET'" class="badge bg-warning text-dark">Chờ duyệt</span>
                  <span *ngIf="selected.trangThai === 'DUYET'" class="badge bg-success">Đã duyệt</span>
                </p>
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
  selected: PhanCongHuongDanResponse | null = null;

  constructor(private gvService: GiangVienService) {}

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

  xemChiTiet(pc: PhanCongHuongDanResponse): void {
    this.selected = pc;
    const modalEl = document.getElementById('chiTietModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
}

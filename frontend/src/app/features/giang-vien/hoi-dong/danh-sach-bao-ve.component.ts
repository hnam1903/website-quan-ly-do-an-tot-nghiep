import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { HoiDongBaoVeResponse } from '../../../core/models/models';

@Component({
  selector: 'app-danh-sach-bao-ve',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>Danh sách hội đồng bảo vệ</h2>
     
    </div>

    <div class="card">
      <div class="card-body">
        <table class="table table-hover" *ngIf="hoiDongList.length > 0">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Mã SV</th>
              <th>Họ tên SV</th>
              <th>Lớp</th>
              <th>Tên đề tài</th>
              <th>Ngày bảo vệ</th>
              <th>Phòng</th>
              <th>Thành viên hội đồng</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let hd of hoiDongList; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ hd.maSinhVien || '-' }}</td>
              <td>{{ hd.hoTenSinhVien || '-' }}</td>
              <td>{{ hd.lopSinhVien || '-' }}</td>
              <td>{{ hd.tenDeTai }}</td>
              <td>{{ hd.ngayBaoVe | date:'dd/MM/yyyy' }}</td>
              <td>{{ hd.diaDiem || '-' }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" (click)="xemThanhVien(hd)">
                  <span class="material-symbols-outlined me-1">group</span> Xem ({{ hd.thanhViens?.length || 0 }})
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="hoiDongList.length === 0" class="text-center py-5">
          <span class="material-symbols-outlined" style="font-size: 3rem; color: #ccc;">inbox</span>
          <p class="text-muted mt-2">Bạn không có hội đồng nào</p>
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
  selected: HoiDongBaoVeResponse | null = null;

  constructor(private gvService: GiangVienService) {}

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

  xemThanhVien(hd: HoiDongBaoVeResponse): void {
    this.selected = hd;
    const modalEl = document.getElementById('thanhVienModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }
}

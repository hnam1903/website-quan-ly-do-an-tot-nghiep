import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { DeTaiResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-danh-sach-phan-bien',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Danh sách sinh viên phản biện</h2>
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngIf="isLoading" class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p class="mt-2">Đang tải dữ liệu...</p>
        </div>

        <div *ngIf="deTaiList.length === 0 && !isLoading" class="alert alert-info">
          <i class="bi bi-info-circle"></i> Không có sinh viên nào được phân công phản biện
        </div>

        <div class="table-responsive" *ngIf="deTaiList.length > 0">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th width="12%" class="text-center">Mã SV</th>
                <th width="18%">Họ và tên</th>
                <th width="10%">Lớp</th>
                <th width="35%">Tên đề tài</th>
                <th width="12%" class="text-center">Trạng thái</th>
                <th width="13%" class="text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of deTaiList">
                <td class="text-center"><strong>{{ dt.maSinhVien }}</strong></td>
                <td>{{ dt.hoTenSinhVien }}</td>
                <td>{{ dt.lopSinhVien || '-' }}</td>
                <td class="text-truncate" style="max-width: 350px;" title="{{ dt.tenDeTai }}">
                  {{ dt.tenDeTai }}
                </td>
                <td class="text-center">
                  <span *ngIf="dt.daChamDiemPB" class="badge bg-success">
                    <i class="bi bi-check-circle me-1"></i>Đã chấm
                  </span>
                  <span *ngIf="!dt.daChamDiemPB" class="badge bg-warning text-dark">
                    <i class="bi bi-hourglass-split me-1"></i>Chưa chấm
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-primary" (click)="moModalChiTiet(dt)">
                    <i class="bi bi-eye me-1"></i>Chi tiết
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết & Chấm điểm -->
    <div class="modal fade" id="modalChiTiet" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="deTaiChon">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết phản biện</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <label class="form-label fw-bold">Sinh viên</label>
                <p class="mb-1">{{ deTaiChon.hoTenSinhVien }}</p>
                <small class="text-muted">Mã SV: {{ deTaiChon.maSinhVien }}</small>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Lớp</label>
                <p>{{ deTaiChon.lopSinhVien || '-' }}</p>
              </div>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">Tên đề tài</label>
              <p class="mb-0">{{ deTaiChon.tenDeTai }}</p>
            </div>

            <div class="mb-3">
              <label class="form-label fw-bold">GV Hướng dẫn</label>
              <p>{{ deTaiChon.hoTenGiangVienHuongDan || '-' }}</p>
            </div>

            <hr>

            <div *ngIf="deTaiChon.daChamDiemPB" class="alert alert-success mb-0">
              <div class="row">
                <div class="col-md-4">
                  <strong>Điểm phản biện:</strong> {{ deTaiChon.diemPhanBien }}
                </div>
                <div class="col-md-8" *ngIf="deTaiChon.nhanXetPhanBien">
                  <strong>Nhận xét:</strong> {{ deTaiChon.nhanXetPhanBien }}
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
export class DanhSachPhanBienComponent implements OnInit {
  deTaiList: DeTaiResponse[] = [];
  deTaiChon: DeTaiResponse | null = null;
  isLoading = false;

  constructor(
    private gvService: GiangVienService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.gvService.getDeTaiPhanBien().subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiList = res.data || [];
          this.deTaiList.sort((a, b) => {
            if ((a.maSinhVien || '') < (b.maSinhVien || '')) return -1;
            if ((a.maSinhVien || '') > (b.maSinhVien || '')) return 1;
            if ((a.hoTenSinhVien || '') < (b.hoTenSinhVien || '')) return -1;
            if ((a.hoTenSinhVien || '') > (b.hoTenSinhVien || '')) return 1;
            if ((a.lopSinhVien || '') < (b.lopSinhVien || '')) return -1;
            if ((a.lopSinhVien || '') > (b.lopSinhVien || '')) return 1;
            return (a.tenDeTai || '').localeCompare(b.tenDeTai || '');
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Lỗi khi tải dữ liệu');
        this.isLoading = false;
      }
    });
  }

  moModalChiTiet(dt: DeTaiResponse): void {
    this.deTaiChon = { ...dt };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalChiTiet'));
    modal.show();
  }
}

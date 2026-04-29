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
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-info-subtle">
          <i class="bi bi-chat-square-text text-info"></i>
        </div>
        <div>
          <h2>Danh sách sinh viên phản biện</h2>
          <p class="mb-0">Xem và chấm điểm phản biện</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div *ngIf="isLoading" class="text-center py-4">
          <span class="spinner-border spinner-border-sm me-2"></span> Đang tải dữ liệu...
        </div>

        <div *ngIf="!isLoading && deTaiList.length === 0" class="alert alert-info m-4">
          <i class="bi bi-info-circle"></i> Không có sinh viên nào được phân công phản biện
        </div>

        <div class="table-responsive" *ngIf="!isLoading && deTaiList.length > 0">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th style="width: 100px" class="text-center">Mã SV</th>
                <th style="width: 180px">Họ và tên</th>
                <th style="width: 100px">Lớp</th>
                <th>Tên đề tài</th>
                <th style="width: 120px" class="text-center">Trạng thái</th>
                <th style="width: 120px" class="text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of deTaiList" class="align-middle">
                <td class="text-center"><code>{{ dt.maSinhVien }}</code></td>
                <td><strong>{{ dt.hoTenSinhVien }}</strong></td>
                <td>{{ dt.lopSinhVien || '-' }}</td>
                <td class="text-truncate" style="max-width: 350px;" title="{{ dt.tenDeTai }}">
                  {{ dt.tenDeTai }}
                </td>
                <td class="text-center">
                  <span *ngIf="dt.daChamDiemPB" class="badge badge-success">
                    <i class="bi bi-check-circle-fill me-1"></i>Đã chấm
                  </span>
                  <span *ngIf="!dt.daChamDiemPB" class="badge badge-warning text-dark">
                    <i class="bi bi-hourglass-split me-1"></i>Chưa chấm
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-primary btn-icon" (click)="moModalChiTiet(dt)" title="Chi tiết">
                    <i class="bi bi-eye"></i>
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
            <h5 class="modal-title"><i class="bi bi-info-circle me-2"></i>Chi tiết phản biện</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Sinh viên</label>
                  <p class="info-value">{{ deTaiChon.hoTenSinhVien }}</p>
                  <small class="text-muted">Mã SV: {{ deTaiChon.maSinhVien }}</small>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Lớp</label>
                  <p class="info-value">{{ deTaiChon.lopSinhVien || '-' }}</p>
                </div>
              </div>
              <div class="col-12">
                <div class="info-group">
                  <label class="info-label">Tên đề tài</label>
                  <p class="info-title">{{ deTaiChon.tenDeTai }}</p>
                </div>
              </div>
              <div class="col-12">
                <div class="info-group mb-0">
                  <label class="info-label">GV Hướng dẫn</label>
                  <p class="info-value">{{ deTaiChon.hoTenGiangVienHuongDan || '-' }}</p>
                </div>
              </div>
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

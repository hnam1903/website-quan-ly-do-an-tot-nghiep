import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { PhanCongHuongDanResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-duyet-huong-dan',
  standalone: true,
  imports: [CommonModule],
  providers: [],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-warning-subtle">
          <span class="material-symbols-outlined text-warning">person_check</span>
        </div>
        <div>
          <h2>Duyệt Giảng viên hướng dẫn</h2>
          <p class="mb-0">Xem xét và phê duyệt yêu cầu hướng dẫn</p>
        </div>
      </div>
      <span class="badge bg-warning text-dark">
        <span class="material-symbols-outlined me-1" style="font-size: 16px;">hourglass_empty</span>{{ choDuyetList.length }} sinh viên chờ duyệt
      </span>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <table class="table table-hover mb-0" *ngIf="choDuyetList.length > 0">
          <thead>
            <tr>
              <th class="text-center" style="width: 60px">STT</th>
              <th style="width: 120px">Mã SV</th>
              <th style="width: 160px">Họ tên SV</th>
              <th style="width: 100px">Lớp</th>
              <th>Tên đề tài</th>
              <th style="width: 140px">Bộ môn</th>
              <th style="width: 100px" class="text-center">Chi tiết</th>
              <th style="width: 200px">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let sv of choDuyetList; let i = index" class="align-middle">
              <td class="text-center">
                <span class="stt-badge">{{ i + 1 }}</span>
              </td>
              <td><code>{{ sv.maSinhVien || '-' }}</code></td>
              <td><strong>{{ sv.hoTenSinhVien || '-' }}</strong></td>
              <td>{{ sv.lopSinhVien || '-' }}</td>
              <td>
                <span class="text-truncate d-inline-block" style="max-width: 250px">{{ sv.tenDeTai }}</span>
              </td>
              <td><span >{{ sv.tenBoMon }}</span></td>
              <td class="text-center">
                <button class="btn btn-sm btn-outline-primary btn-icon" (click)="xemChiTiet(sv)" title="Xem chi tiết">
                  <span class="material-symbols-outlined">visibility</span>
                </button>
              </td>
              <td>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-success btn-icon" (click)="duyet(sv)" title="Đồng ý hướng dẫn">
                    <span class="material-symbols-outlined">check_circle</span>
                  </button>
                  <button class="btn btn-sm btn-outline-danger btn-icon" (click)="tuChoi(sv)" title="Từ chối">
                    <span class="material-symbols-outlined">cancel</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="choDuyetList.length === 0" class="text-center py-5">
          <div class="empty-state">
            <span class="material-symbols-outlined text-success fs-2 d-block mb-3">task_alt</span>
            <p class="mb-1 fw-semibold">Không có sinh viên nào chờ duyệt hướng dẫn</p>
            <small class="text-muted">Tất cả yêu cầu đã được xử lý</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận -->
    <div class="modal fade" id="xacNhanModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content" *ngIf="selected">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ actionType === 'duyet' ? 'Xác nhận đồng ý hướng dẫn' : 'Xác nhận từ chối hướng dẫn' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="actionType === 'duyet'">
              <p>Bạn xác nhận <strong>đồng ý</strong> nhận hướng dẫn sinh viên:</p>
              <ul class="list-unstyled">
                <li class="mb-2"><strong>Tên:</strong> {{ selected.hoTenSinhVien }}</li>
                <li><strong>Đề tài:</strong> {{ selected.tenDeTai }}</li>
              </ul>
              <p class="text-muted small">Sau khi xác nhận, sinh viên sẽ được thông báo và đề tài sẽ chuyển sang trạng thái "Đang thực hiện".</p>
            </div>
            <div *ngIf="actionType === 'tuchoi'">
              <p>Bạn xác nhận <strong>từ chối</strong> nhận hướng dẫn sinh viên:</p>
              <ul class="list-unstyled">
                <li class="mb-2"><strong>Tên:</strong> {{ selected.hoTenSinhVien }}</li>
                <li><strong>Đề tài:</strong> {{ selected.tenDeTai }}</li>
              </ul>
              <p class="text-muted small">Sau khi từ chối, Bộ môn sẽ phân công giảng viên khác.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn" [class.btn-success]="actionType === 'duyet'" [class.btn-danger]="actionType === 'tuchoi'" (click)="confirmAction()">
              <span class="material-symbols-outlined me-1">check</span>Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal chi tiết đề tài -->
    <div class="modal fade" id="chiTietModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="chiTietDeTai">
          <div class="modal-header bg-info text-white">
            <h5 class="modal-title"><span class="material-symbols-outlined me-2">info</span>Chi tiết đề tài đăng ký</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Sinh viên</label>
                  <p class="info-value">{{ chiTietDeTai.hoTenSinhVien }}</p>
                  <small class="text-muted">{{ chiTietDeTai.maSinhVien }} - {{ chiTietDeTai.lopSinhVien }}</small>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Bộ môn</label>
                  <p class="info-value">{{ chiTietDeTai.tenBoMon }}</p>
                </div>
              </div>
              <div class="col-12">
                <div class="info-group">
                  <label class="info-label">Tên đề tài</label>
                  <p class="info-title">{{ chiTietDeTai.tenDeTai }}</p>
                </div>
              </div>
              <div class="col-12">
                <div class="info-group">
                  <label class="info-label">Nội dung dự kiến</label>
                  <p class="info-value">{{ chiTietDeTai.noiDungDuKien || 'Chưa có' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Công nghệ sử dụng</label>
                  <p class="info-value">{{ chiTietDeTai.congNgheSuDung || 'Chưa có' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Giảng viên hướng dẫn</label>
                  <p class="info-value">{{ chiTietDeTai.hoTenGiangVien || 'Chưa phân công' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Trạng thái phân công</label>
                  <p class="info-value">
                    <span [class]="getTrangThaiPhanCongClass(chiTietDeTai.trangThai)">
                      {{ getTrangThaiPhanCongText(chiTietDeTai.trangThai) }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group mb-0">
                  <label class="info-label">Ngày phân công</label>
                  <p class="info-value">{{ chiTietDeTai.ngayPhanCong | date:'dd/MM/yyyy HH:mm' }}</p>
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
export class DuyetHuongDanComponent implements OnInit {
  choDuyetList: PhanCongHuongDanResponse[] = [];
  selected: PhanCongHuongDanResponse | null = null;
  chiTietDeTai: PhanCongHuongDanResponse | null = null;
  actionType: 'duyet' | 'tuchoi' = 'duyet';

  constructor(private gvService: GiangVienService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.gvService.getDeTaiChoDuyet().subscribe({
      next: (res) => {
        if (res.success) {
          this.choDuyetList = res.data;
        }
      },
      error: (err) => console.error('Lỗi load:', err)
    });
  }

  xemChiTiet(item: PhanCongHuongDanResponse): void {
    this.chiTietDeTai = item;
    const modalEl = document.getElementById('chiTietModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  duyet(item: PhanCongHuongDanResponse): void {
    this.selected = item;
    this.actionType = 'duyet';
    this.showModal();
  }

  tuChoi(item: PhanCongHuongDanResponse): void {
    this.selected = item;
    this.actionType = 'tuchoi';
    this.showModal();
  }

  confirmAction(): void {
    if (!this.selected) return;

    const duyet = this.actionType === 'duyet';
    this.gvService.duyetSinhVien(this.selected.id, duyet).subscribe({
      next: (res) => {
        if (res.success) {
          this.hideModal();
          this.loadData();
        }
      },
      error: (err) => {
        console.error('Lỗi:', err);
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
      }
    });
  }

  getTrangThaiPhanCongText(trangThai: string): string {
    const map: Record<string, string> = {
      'CHO_DUYET': 'Chờ duyệt',
      'DUYET': 'Đã duyệt',
      'TU_CHOI': 'Từ chối'
    };
    return map[trangThai] || trangThai;
  }

  getTrangThaiPhanCongClass(trangThai: string): string {
    const map: Record<string, string> = {
      'CHO_DUYET': 'badge bg-warning text-dark',
      'DUYET': 'badge bg-success',
      'TU_CHOI': 'badge bg-danger'
    };
    return map[trangThai] || 'badge bg-secondary';
  }

  private showModal(): void {
    const modalEl = document.getElementById('xacNhanModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  private hideModal(): void {
    const modalEl = document.getElementById('xacNhanModal');
    if (modalEl) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalEl);
      if (modal) modal.hide();
    }
  }
}
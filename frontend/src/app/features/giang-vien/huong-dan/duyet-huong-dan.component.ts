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
      <h2>Duyệt Giảng viên hướng dẫn</h2>
   
    </div>

    <div class="card">
      <div class="card-body">
        <table class="table table-hover" *ngIf="choDuyetList.length > 0">
          <thead class="table-light">
            <tr>
              <th>STT</th>
              <th>Mã SV</th>
              <th>Họ tên SV</th>
              <th>Lớp</th>
              <th>Tên đề tài</th>
              <th>Bộ môn</th>
              <th class="text-center">Chi tiết</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let sv of choDuyetList; let i = index">
              <td>{{ i + 1 }}</td>
              <td>{{ sv.maSinhVien || '-' }}</td>
              <td>{{ sv.hoTenSinhVien || '-' }}</td>
              <td>{{ sv.lopSinhVien || '-' }}</td>
              <td>{{ sv.tenDeTai }}</td>
              <td>{{ sv.tenBoMon }}</td>
              <td class="text-center">
                <button class="btn btn-outline-primary btn-sm" (click)="xemChiTiet(sv)" data-bs-toggle="modal" data-bs-target="#chiTietModal">
                  <i class="bi bi-eye"></i> Xem
                </button>
              </td>
              <td>
                <button class="btn btn-sm btn-success me-2" (click)="duyet(sv)">
                  <i class="bi bi-check-circle"></i> Đồng ý
                </button>
                <button class="btn btn-sm btn-danger" (click)="tuChoi(sv)">
                  <i class="bi bi-x-circle"></i> Từ chối
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="choDuyetList.length === 0" class="text-center py-5">
          <i class="bi bi-check-circle" style="font-size: 3rem; color: #28a745;"></i>
          <p class="text-muted mt-2">Không có sinh viên nào chờ duyệt hướng dẫn</p>
        </div>
      </div>
    </div>

    <!-- Modal xác nhận -->
    <div class="modal fade" id="xacNhanModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content" *ngIf="selected">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">{{ actionType === 'duyet' ? 'Xác nhận đồng ý hướng dẫn' : 'Xác nhận từ chối hướng dẫn' }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div *ngIf="actionType === 'duyet'">
              <p>Bạn xác nhận <strong>đồng ý</strong> nhận hướng dẫn sinh viên:</p>
              <ul>
                <li><strong>Tên:</strong> {{ selected.hoTenSinhVien }}</li>
                <li><strong>Đề tài:</strong> {{ selected.tenDeTai }}</li>
              </ul>
              <p class="text-muted">Sau khi xác nhận, sinh viên sẽ được thông báo và đề tài sẽ chuyển sang trạng thái "Đang thực hiện".</p>
            </div>
            <div *ngIf="actionType === 'tuchoi'">
              <p>Bạn xác nhận <strong>từ chối</strong> nhận hướng dẫn sinh viên:</p>
              <ul>
                <li><strong>Tên:</strong> {{ selected.hoTenSinhVien }}</li>
                <li><strong>Đề tài:</strong> {{ selected.tenDeTai }}</li>
              </ul>
              <p class="text-muted">Sau khi từ chối, Bộ môn sẽ phân công giảng viên khác.</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn" [class.btn-success]="actionType === 'duyet'" [class.btn-danger]="actionType === 'tuchoi'" (click)="confirmAction()">
              Xác nhận
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
            <h5 class="modal-title">Chi tiết đề tài đăng ký</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label fw-bold">Sinh viên</label>
                <p class="mb-1">{{ chiTietDeTai.hoTenSinhVien }}</p>
                <small class="text-muted">{{ chiTietDeTai.maSinhVien }} - {{ chiTietDeTai.lopSinhVien }}</small>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Bộ môn</label>
                <p>{{ chiTietDeTai.tenBoMon }}</p>
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Tên đề tài</label>
                <p>{{ chiTietDeTai.tenDeTai }}</p>
              </div>
              <div class="col-12">
                <label class="form-label fw-bold">Nội dung dự kiến</label>
                <p class="text-muted">{{ chiTietDeTai.noiDungDuKien || 'Chưa có' }}</p>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Công nghệ sử dụng</label>
                <p class="text-muted">{{ chiTietDeTai.congNgheSuDung || 'Chưa có' }}</p>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Giảng viên hướng dẫn</label>
                <p>{{ chiTietDeTai.hoTenGiangVien || 'Chưa phân công' }}</p>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Trạng thái phân công</label>
                <p>
                  <span [class]="getTrangThaiPhanCongClass(chiTietDeTai.trangThai)">
                    {{ getTrangThaiPhanCongText(chiTietDeTai.trangThai) }}
                  </span>
                </p>
              </div>
              <div class="col-md-6">
                <label class="form-label fw-bold">Ngày phân công</label>
                <p>{{ chiTietDeTai.ngayPhanCong | date:'dd/MM/yyyy HH:mm' }}</p>
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
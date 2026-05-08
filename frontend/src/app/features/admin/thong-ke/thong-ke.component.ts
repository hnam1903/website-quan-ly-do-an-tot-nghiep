import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { DeTaiResponse, DotDangKyResponse, BoMonResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-thong-ke',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header d-flex justify-content-between align-items-center flex-wrap gap-2">
      <div>
        <h2>Thống kê danh sách đề tài</h2>
       
      </div>
      <div class="d-flex gap-2">
        <select class="form-select" style="width: 200px;" [(ngModel)]="selectedDotId" (change)="loadThongKe()">
          <option [ngValue]="null">Tất cả đợt</option>
          <option *ngFor="let dot of dotList" [ngValue]="dot.id">{{ dot.tenDot }}</option>
        </select>
        <select class="form-select" style="width: 200px;" [(ngModel)]="selectedBoMonId" (change)="loadThongKe()">
          <option [ngValue]="null">Tất cả Bộ môn</option>
          <option *ngFor="let bm of boMonList" [ngValue]="bm.id">{{ bm.tenBoMon }}</option>
        </select>
      </div>
    </div>

    <div class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <span>Danh sách thống kê ({{ thongKeList.length }} đề tài)</span>
        <button class="btn btn-success btn-sm" (click)="exportExcel()">
          <span class="material-symbols-outlined me-1">table_chart</span>Xuất Excel
        </button>
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover table-bordered">
            <thead class="table-light">
              <tr>
                <th class="text-center" width="50">STT</th>
                <th>Đợt</th>
                <th>Tên SV</th>
                <th>Mã SV</th>
                <th>Bộ môn</th>
                <th>GV Hướng dẫn</th>
                <th>Trạng thái</th>
                <th class="text-center">Chi tiết</th>
                <th class="text-center">Xóa</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="isLoading">
                <td colspan="9" class="text-center py-4">
                  <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
                </td>
              </tr>
              <tr *ngFor="let dt of thongKeList; let i = index">
                <td class="text-center">{{ i + 1 }}</td>
                <td>{{ dt.tenDotDangKy || '-' }}</td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong>
                </td>
                <td>{{ dt.maSinhVien }}</td>
                <td>{{ dt.tenBoMon || '-' }}</td>
                <td>{{ dt.hoTenGiangVienHuongDan || 'Chưa phân' }}</td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(dt.trangThai)">
                    {{ getStatusText(dt.trangThai) }}
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-outline-primary btn-sm" (click)="chiTietDeTai = dt" data-bs-toggle="modal" data-bs-target="#chiTietModal">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                </td>
                <td class="text-center">
                  <button class="btn btn-outline-danger btn-sm" (click)="xoaDeTai(dt)" title="Xóa đề tài">
                    <span class="material-symbols-outlined">delete</span>
                  </button>
                </td>
              </tr>
              <tr *ngIf="!isLoading && thongKeList.length === 0">
                <td colspan="9" class="text-center text-muted py-4">
                  Không có dữ liệu thống kê.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết -->
    <div class="modal fade" id="chiTietModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="chiTietDeTai">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">Chi tiết đề tài</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <!-- Thông tin sinh viên -->
            <div class="mb-4">
              <h6 class="border-bottom pb-2 mb-3"><span class="material-symbols-outlined me-2">person</span>Sinh viên</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">Họ tên</label>
                  <p class="mb-1">{{ chiTietDeTai.hoTenSinhVien }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Mã sinh viên</label>
                  <p class="mb-1">{{ chiTietDeTai.maSinhVien }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Lớp</label>
                  <p class="mb-1">{{ chiTietDeTai.lopSinhVien }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Bộ môn</label>
                  <p class="mb-1">{{ chiTietDeTai.tenBoMon }}</p>
                </div>
              </div>
            </div>

            <!-- Thông tin đề tài -->
            <div class="mb-4">
              <h6 class="border-bottom pb-2 mb-3"><span class="material-symbols-outlined me-2">menu_book</span>Đề tài</h6>
              <div class="row g-3">
                <div class="col-12">
                  <label class="form-label fw-bold">Tên đề tài</label>
                  <p class="mb-1">{{ chiTietDeTai.tenDeTai }}</p>
                </div>
                <div class="col-12">
                  <label class="form-label fw-bold">Nội dung</label>
                  <p class="mb-1">{{ chiTietDeTai.noiDungDuKien || 'Chưa có' }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Công nghệ sử dụng</label>
                  <p class="mb-1">{{ chiTietDeTai.congNgheSuDung || 'Chưa có' }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">Trạng thái</label>
                  <p class="mb-1">
                    <span class="badge" [ngClass]="getStatusClass(chiTietDeTai.trangThai)">
                      {{ getStatusText(chiTietDeTai.trangThai) }}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Giảng viên -->
            <div class="mb-4">
              <h6 class="border-bottom pb-2 mb-3"><span class="material-symbols-outlined me-2">school</span>Giảng viên</h6>
              <div class="row g-3">
                <div class="col-md-6">
                  <label class="form-label fw-bold">GV Hướng dẫn</label>
                  <p class="mb-1">{{ chiTietDeTai.hoTenGiangVienHuongDan || 'Chưa phân công' }}</p>
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-bold">GV Phản biện</label>
                  <p class="mb-1">{{ chiTietDeTai.hoTenGiangVienPhanBien || 'Chưa phân công' }}</p>
                </div>
              </div>
            </div>

            <!-- Điểm số -->
            <div>
              <h6 class="border-bottom pb-2 mb-3"><span class="material-symbols-outlined me-2">analytics</span>Kết quả chấm điểm</h6>
              <div class="row g-3">
                <div class="col-md-3">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <label class="form-label fw-bold d-block">Điểm Hướng dẫn</label>
                      <h3 class="mb-0 text-primary">{{ chiTietDeTai.diemHuongDan || '-' }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <label class="form-label fw-bold d-block">Điểm Phản biện</label>
                      <h3 class="mb-0 text-success">{{ chiTietDeTai.diemPhanBien || '-' }}</h3>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <label class="form-label fw-bold d-block">Điểm Bảo vệ</label>
                      <div *ngFor="let tv of chiTietDeTai.thanhVienHoiDongList" class="d-flex justify-content-center gap-3">
                        <span>{{ getVaiTroLabel(tv.vaiTro) }}: <strong>{{ tv.diem ?? '-' }}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="col-md-3">
                  <div class="card bg-light">
                    <div class="card-body text-center">
                      <label class="form-label fw-bold d-block">Tổng Bảo vệ</label>
                      <h3 class="mb-0 text-warning">{{ chiTietDeTai.diemTongBaoVe || '-' }}</h3>
                    </div>
                  </div>
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
export class ThongKeComponent implements OnInit {
  thongKeList: DeTaiResponse[] = [];
  dotList: DotDangKyResponse[] = [];
  boMonList: BoMonResponse[] = [];
  selectedDotId: number | null = null;
  selectedBoMonId: number | null = null;
  chiTietDeTai: DeTaiResponse | null = null;
  isLoading = false;

  constructor(
    private adminService: AdminService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDotList();
    this.loadBoMonList();
    this.loadThongKe();
  }

  loadDotList(): void {
    this.adminService.getAllDotDangKy().subscribe({
      next: (res) => {
        if (res.success) {
          this.dotList = res.data;
        }
      }
    });
  }

  loadBoMonList(): void {
    this.adminService.getAllBoMon().subscribe({
      next: (res) => {
        if (res.success) {
          this.boMonList = res.data;
        }
      }
    });
  }

  loadThongKe(): void {
    this.isLoading = true;
    const dotId = this.selectedDotId ?? undefined;
    const bmId = this.selectedBoMonId ?? undefined;
    this.adminService.getThongKeTongHop(dotId, bmId).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success && res.data) {
          this.thongKeList = res.data;
        } else {
          this.thongKeList = [];
        }
      },
      error: () => {
        this.isLoading = false;
        this.toastr.error('Không thể tải dữ liệu thống kê');
        this.thongKeList = [];
      }
    });
  }

  xoaDeTai(deTai: DeTaiResponse): void {
    if (!confirm(`Bạn có chắc chắn muốn xóa đề tài "${deTai.tenDeTai}" của sinh viên ${deTai.hoTenSinhVien}?`)) {
      return;
    }
    if (!deTai.id) return;
    this.adminService.xoaDeTai(deTai.id).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Xóa đề tài thành công');
          this.loadThongKe();
        } else {
          this.toastr.error(res.message || 'Xóa thất bại');
        }
      },
      error: () => {
        this.toastr.error('Không thể xóa đề tài');
      }
    });
  }

  getStatusClass(trangThai: any): string {
    if (!trangThai) return 'bg-secondary';
    switch (trangThai) {
      case 'HOAN_THANH': return 'bg-success';
      case 'DANG_THUC_HIEN': return 'bg-primary';
      case 'DA_NOP_BAO_CAO': return 'bg-info';
      case 'KHONG_DAT_BAO_VE': return 'bg-danger';
      case 'CHO_BO_MON_DUYET': return 'bg-warning';
      case 'CHO_GV_DUYET': return 'bg-warning';
      case 'GV_TU_CHOI': return 'bg-warning';
      case 'CHO_GV_PHAN_CONG': return 'bg-warning';
      case 'CHO_BO_MON_PHAN_CONG': return 'bg-warning';
      default: return 'bg-secondary';
    }
  }

  getStatusText(trangThai: any): string {
    if (!trangThai) return 'Không xác định';
    const statusMap: { [key: string]: string } = {
      'BI_TU_CHOI': 'Bị từ chối',
      'CHO_BO_MON_DUYET': 'Chờ BM duyệt',
      'CHO_GV_DUYET': 'Chờ GV duyệt',
      'GV_TU_CHOI': 'GV từ chối',
      'CHO_GV_PHAN_CONG': 'Chờ phân công GVHD',
      'CHO_BO_MON_PHAN_CONG': 'Chờ BM xác nhận',
      'DANG_THUC_HIEN': 'Đang thực hiện',
      'DA_NOP_BAO_CAO': 'Đã nộp báo cáo',
      'DAT_GVHD': 'Đạt HD',
      'KHONG_DAT_GVHD': 'K đạt HD',
      'CHO_PHAN_BIEN': 'Chờ PB',
      'DAT_PHAN_BIEN': 'Đạt PB',
      'KHONG_DAT_PHAN_BIEN': 'K đạt PB',
      'DANG_BAO_VE': 'Đang bảo vệ',
      'HOAN_THANH': 'Hoàn thành',
      'KHONG_DAT_BAO_VE': 'Không đạt bảo vệ'
    };
    return statusMap[trangThai] || trangThai;
  }

  getVaiTroLabel(vaiTro: string | undefined): string {
    const vaiTroMap: { [key: string]: string } = {
      'CHU_TICH': 'Chủ tịch',
      'THU_KY': 'Thư ký',
      'UY_VIEN': 'Ủy viên',
      'PHAN_BIEN': 'Phản biện'
    };
    return vaiTro ? (vaiTroMap[vaiTro] || vaiTro) : '-';
  }

  exportExcel(): void {
    if (this.thongKeList.length === 0) {
      this.toastr.warning('Không có dữ liệu để xuất');
      return;
    }

    const data = this.thongKeList.map((dt, index) => ({
      'STT': index + 1,
      'Tên Sinh Viên': dt.hoTenSinhVien || '',
      'Mã Sinh Viên': dt.maSinhVien || '',
      'Lớp': dt.lopSinhVien || '',
      'Bộ Môn': dt.tenBoMon || '',
      'Tên Đề Tài': dt.tenDeTai || '',
      'GV Hướng Dẫn': dt.hoTenGiangVienHuongDan || '',
      'GV Phản Biện': dt.hoTenGiangVienPhanBien || '',
      'Điểm Hướng Dẫn': dt.diemHuongDan != null ? dt.diemHuongDan : '',
      'Điểm Phản Biện': dt.diemPhanBien != null ? dt.diemPhanBien : '',
      'Điểm Bảo Vệ': dt.diemBaoVe != null ? dt.diemBaoVe : '',
      'Trạng Thái': this.getStatusText(dt.trangThai)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Thống Kê');

    const colWidths = [
      { wch: 5 },
      { wch: 25 },
      { wch: 12 },
      { wch: 10 },
      { wch: 20 },
      { wch: 40 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 }
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `ThongKe_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    this.toastr.success('Xuất Excel thành công');
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { AdminService } from '../../../core/services/admin.service';
import { QuanLyDiemResponse, BoMonResponse, DotDangKyResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-quan-ly-diem',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-3">
          <div class="page-icon bg-success-subtle">
            <span class="material-symbols-outlined">analytics</span>
          </div>
          <div>
            <h2>Quản lý Điểm</h2>
            <p class="mb-0">Tổng hợp điểm của tất cả sinh viên</p>
          </div>
        </div>
        <div class="d-flex align-items-center gap-3 justify-content-end">
          <select class="form-select" [(ngModel)]="selectedDotId" (change)="loadData()">
            <option [value]="null">-- Tất cả đợt --</option>
            <option *ngFor="let dot of dotDangKyList" [value]="dot.id">{{ dot.tenDot }} - {{ dot.namHoc }}</option>
          </select>
          <select class="form-select" [(ngModel)]="selectedBoMonId" (change)="loadData()">
            <option [value]="null">-- Tất cả bộ môn --</option>
            <option *ngFor="let bm of boMons" [value]="bm.id">{{ bm.tenBoMon }}</option>
          </select>
          <button class="btn btn-success" (click)="exportExcel()">
            <span class="material-symbols-outlined me-2">table_chart</span>Xuất Excel
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="text-center" style="width: 60px">STT</th>
                  <th>Họ và tên</th>
                  <th style="width: 120px">Mã SV</th>
                  <th style="width: 100px">Lớp</th>
                  <th style="width: 160px">Bộ môn</th>
                  <th class="text-center">Tổng hợp điểm</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of filteredData; let i = index" class="align-middle">
                  <td class="text-center">
                    <span class="stt-badge">{{ i + 1 }}</span>
                  </td>
                  <td>
                    <div>
                      <strong class="text-dark">{{ item.hoTen }}</strong>
                      <br>
                      <small class="text-secondary text-truncate d-block" style="max-width: 200px">
                        {{ item.tenDeTai }}
                      </small>
                    </div>
                  </td>
                  <td><code>{{ item.maSinhVien }}</code></td>
                  <td>{{ item.lop || '-' }}</td>
                  <td><span >{{ item.tenBoMon || 'Chưa phân' }}</span></td>
                  <td>
                    <div class="small">
                      <div><strong class="text-muted">GVHD:</strong> {{ item.diemHuongDan !== null && item.diemHuongDan !== undefined ? (item.diemHuongDan | number:'1.1-1') : '-' }}</div>
                      <div><strong class="text-muted">GVPB:</strong> {{ item.diemPhanBien !== null && item.diemPhanBien !== undefined ? (item.diemPhanBien | number:'1.1-1') : '-' }}</div>
                      <div class="mt-1"><strong class="text-muted">HDBV:</strong></div>
                      <div class="ps-3" *ngIf="item.thanhVienHoiDongList && item.thanhVienHoiDongList.length > 0; else noHDBV">
                        <div *ngFor="let tv of item.thanhVienHoiDongList" class="text-muted">
                          {{ getVaiTroLabel(tv.vaiTro) }}: {{ tv.diem !== null ? (tv.diem | number:'1.1-1') : '-' }}
                        </div>
                      </div>
                      <ng-template #noHDBV><span class="text-muted fst-italic">Chưa có</span></ng-template>
                      <div class="fw-bold border-top pt-1 mt-1 text-primary">
                        <span>Tổng BV: {{ item.diemTongBaoVe !== null && item.diemTongBaoVe !== undefined ? (item.diemTongBaoVe | number:'1.1-1') : '-' }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredData.length === 0">
                  <td colspan="6" class="text-center py-5">
                    <div class="empty-state">
                      <span class="material-symbols-outlined fs-1 d-block mb-3">inbox</span>
                      <p class="mb-1 fw-semibold">Không có dữ liệu</p>
                      <small class="text-muted">Thử thay đổi bộ lọc hoặc đợi dữ liệu được cập nhật</small>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }
    .page-header .d-flex:last-child {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex-shrink: 0;
    }
    .page-header select,
    .page-header button {
      width: auto;
      min-width: 150px;
    }
    .card {
      border-radius: 12px;
    }
    .table th {
      font-weight: 600;
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e9ecef;
    }
    .table td {
      vertical-align: middle;
    }
    .badge {
      font-weight: 500;
    }
    .page-link {
      cursor: pointer;
      color: #6c757d;
    }
    .page-link:hover {
      color: #0d6efd;
    }
  `]
})
export class QuanLyDiemComponent implements OnInit {
  data: QuanLyDiemResponse[] = [];
  filteredData: QuanLyDiemResponse[] = [];
  boMons: BoMonResponse[] = [];
  dotDangKyList: DotDangKyResponse[] = [];
  selectedBoMonId: number | null = null;
  selectedDotId: number | null = null;

  constructor(private adminService: AdminService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadDotDangKy();
    this.loadBoMons();
    this.loadData();
  }

  loadDotDangKy(): void {
    this.adminService.getAllDotDangKy().subscribe({
      next: (res) => {
        if (res.success) {
          this.dotDangKyList = res.data;
        }
      }
    });
  }

  loadBoMons(): void {
    this.adminService.getAllBoMon().subscribe({
      next: (res) => {
        if (res.success) {
          this.boMons = res.data;
        }
      }
    });
  }

  loadData(): void {
    this.adminService.getQuanLyDiem(this.selectedBoMonId || undefined, this.selectedDotId || undefined).subscribe({
      next: (res) => {
        if (res.success) {
          this.data = res.data;
          this.filteredData = res.data;
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu điểm:', err);
      }
    });
  }

  getDiemClass(diem: number | undefined | null): string {
    return '';
  }

  getVaiTroLabel(vaiTro: string): string {
    const vaiTroMap: { [key: string]: string } = {
      'CHU_TICH': 'Chủ tịch',
      'THU_KY': 'Thư ký',
      'UY_VIEN': 'Ủy viên'
    };
    return vaiTroMap[vaiTro] || vaiTro;
  }

  exportExcel(): void {
    if (this.filteredData.length === 0) {
      this.toastr.warning('Không có dữ liệu để xuất');
      return;
    }

    const data = this.filteredData.map((item, index) => {
      const hdbvDiem = item.thanhVienHoiDongList?.map(tv => 
        `${this.getVaiTroLabel(tv.vaiTro)}: ${tv.diem != null ? tv.diem : '-'}`
      ).join(', ') || '-';
      
      return {
        'STT': index + 1,
        'Mã SV': item.maSinhVien || '',
        'Họ tên': item.hoTen || '',
        'Lớp': item.lop || '',
        'Bộ môn': item.tenBoMon || '',
        'Đề tài': item.tenDeTai || '',
        'Điểm Hướng dẫn': item.diemHuongDan != null ? item.diemHuongDan : '',
        'Điểm Phản biện': item.diemPhanBien != null ? item.diemPhanBien : '',
        'HDBV (theo vai trò)': hdbvDiem,
        'Tổng điểm': item.diemTongBaoVe != null ? item.diemTongBaoVe : ''
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Quản lý Điểm');

    const colWidths = [
      { wch: 5 },
      { wch: 12 },
      { wch: 25 },
      { wch: 10 },
      { wch: 20 },
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 },
      { wch: 12 }
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `QuanLyDiem_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    this.toastr.success('Xuất Excel thành công');
  }
}

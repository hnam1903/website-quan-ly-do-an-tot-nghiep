import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as XLSX from 'xlsx';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { QuanLyDiemResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-quan-ly-diem-bo-mon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <!-- Page Header -->
      <div class="page-header d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 class="mb-1">Quản lý Điểm</h4>
          <p class="text-muted mb-0">Tổng hợp điểm sinh viên bộ môn</p>
        </div>
        <div class="d-flex align-items-center">
          <input type="text" class="form-control me-3" placeholder="Tìm kiếm..." 
                 [(ngModel)]="searchText" (input)="filterData()" style="width: 200px;">
          <button class="btn btn-success" (click)="exportExcel()">
            <span class="material-symbols-outlined me-2">table</span>Xuất Excel
          </button>
        </div>
      </div>

      <!-- Table -->
      <div class="card border-0 shadow-sm">
        <div class="card-header bg-white">
         
        </div>
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th class="text-center" style="width: 50px">STT</th>
                  <th>Họ và tên</th>
                  <th>Mã SV</th>
                  <th>Lớp</th>
                  <th class="text-center">Tổng hợp điểm</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of filteredData; let i = index">
                  <td class="text-center text-muted">{{ i + 1 }}</td>
                  <td>
                    <div>
                      <strong>{{ item.hoTen }}</strong>
                      <br>
                      <small class="text-muted text-truncate d-block" style="max-width: 200px">
                        {{ item.tenDeTai }}
                      </small>
                    </div>
                  </td>
                  <td><code>{{ item.maSinhVien }}</code></td>
                  <td>{{ item.lop || '-' }}</td>
                  <td class="text-center">
                    <div class="small">
                      <div><strong>GVHD:</strong> {{ item.diemHuongDan !== null && item.diemHuongDan !== undefined ? (item.diemHuongDan | number:'1.1-1') : '-' }}</div>
                      <div><strong>GVPB:</strong> {{ item.diemPhanBien !== null && item.diemPhanBien !== undefined ? (item.diemPhanBien | number:'1.1-1') : '-' }}</div>
                      <div class="mt-1"><strong>HDBV:</strong></div>
                      <div class="ps-2" *ngIf="item.thanhVienHoiDongList && item.thanhVienHoiDongList.length > 0; else noHDBV">
                        <div *ngFor="let tv of item.thanhVienHoiDongList">
                          {{ getVaiTroLabel(tv.vaiTro) }}: {{ tv.diem !== null ? (tv.diem | number:'1.1-1') : '-' }}
                        </div>
                      </div>
                      <ng-template #noHDBV><span class="text-muted">Chưa có</span></ng-template>
                      <div class="fw-bold border-top pt-1 mt-1">
                        <span>Tổng BV: {{ item.diemTongBaoVe !== null && item.diemTongBaoVe !== undefined ? (item.diemTongBaoVe | number:'1.1-1') : '-' }}</span>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="filteredData.length === 0">
                <td colspan="5" class="text-center py-4 text-muted">
                  <span class="material-symbols-outlined fs-2 d-block mb-2">inbox</span>
                  Không có dữ liệu
                </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <!-- Pagination -->
        <div class="card-footer bg-white" *ngIf="filteredData.length > 0">
        </div>
      </div>
    </div>
  `,
  styles: [`
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
export class QuanLyDiemBoMonComponent implements OnInit {
  data: QuanLyDiemResponse[] = [];
  filteredData: QuanLyDiemResponse[] = [];
  searchText = '';

  constructor(private boMonService: BoMonService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.boMonService.getQuanLyDiem().subscribe({
      next: (res) => {
        if (res.success) {
          this.data = res.data;
          this.filterData();
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu điểm:', err);
      }
    });
  }

  filterData(): void {
    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      this.filteredData = this.data.filter(item =>
        item.hoTen?.toLowerCase().includes(search) ||
        item.maSinhVien?.toLowerCase().includes(search) ||
        item.tenDeTai?.toLowerCase().includes(search)
      );
    } else {
      this.filteredData = [...this.data];
    }
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
      { wch: 40 },
      { wch: 15 },
      { wch: 15 },
      { wch: 35 },
      { wch: 12 }
    ];
    worksheet['!cols'] = colWidths;

    const fileName = `QuanLyDiemBoMon_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    this.toastr.success('Xuất Excel thành công');
  }
}

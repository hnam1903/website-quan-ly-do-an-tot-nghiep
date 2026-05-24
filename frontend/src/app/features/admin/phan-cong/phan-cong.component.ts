import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../core/services/admin.service';
import { PhanCongSummaryResponse, BoMonResponse, DotDangKyResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-phan-cong',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="phan-cong-container">
      <!-- Page Header -->
      <div class="page-header">
        <div class="d-flex align-items-center gap-3">
          <div class="page-icon bg-primary-subtle">
            <span class="material-symbols-outlined">assignment_ind</span>
          </div>
          <div>
            <h2>Xem Phân công</h2>
          
          </div>
        </div>
        <div class="d-flex align-items-center gap-3 justify-content-end">
          <select class="form-select" [(ngModel)]="selectedBoMonId" (change)="loadData()">
            <option [value]="null">-- Tất cả bộ môn --</option>
            <option *ngFor="let bm of boMons" [value]="bm.id">{{ bm.tenBoMon }}</option>
          </select>
          <select class="form-select" [(ngModel)]="selectedDotId" (change)="loadData()">
            <option [value]="null">-- Tất cả đợt --</option>
            <option *ngFor="let dot of dotDangKyList" [value]="dot.id">{{ dot.tenDot }} - {{ dot.namHoc }}</option>
          </select>
        </div>
      </div>

      <!-- Table -->
      <div class="card">
        <div class="card-body p-0">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead>
                <tr>
                  <th class="text-center" style="width: 50px">STT</th>
                  <th style="min-width: 250px">Đề tài</th>
                  <th style="min-width: 160px">Sinh viên</th>
                  <th style="width: 140px">Bộ môn</th>
                  <th style="width: 180px">Đợt</th>
                  <th style="min-width: 150px">GVHD</th>
                  <th style="min-width: 150px">GVPB</th>
                  <th style="min-width: 200px">Hội đồng BV</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of data; let i = index" class="align-middle">
                  <td class="text-center">
                    <span class="stt-badge">{{ i + 1 }}</span>
                  </td>
                  <td>
                    <div class="text-truncate" style="max-width: 250px;" title="{{ item.tenDeTai }}">
                      <strong class="text-dark">{{ item.tenDeTai }}</strong>
                    </div>
                  </td>
                  <td>
                    <strong>{{ item.hoTenSinhVien }}</strong>
                    <div class="text-muted"><small>{{ item.maSinhVien }}</small></div>
                  </td>
                  <td><span class="badge bg-light text-dark">{{ item.tenBoMon || 'Chưa phân' }}</span></td>
                  <td>
                    <div *ngIf="item.tenDot">{{ item.tenDot }}</div>
                   
                  </td>
                  <td>
                    <span *ngIf="item.hoTenGvhd; else chuaPhanGVHD" class="text-success">
                      <span class="material-symbols-outlined fs-6 me-1">person</span>
                      {{ item.hoTenGvhd }}
                    </span>
                    <ng-template #chuaPhanGVHD>
                      <span class="badge bg-warning text-dark">Chưa phân</span>
                    </ng-template>
                  </td>
                  <td>
                    <span *ngIf="item.hoTenGvpb; else chuaPhanGVPB" class="text-primary">
                      <span class="material-symbols-outlined fs-6 me-1">rate_review</span>
                      {{ item.hoTenGvpb }}
                    </span>
                    <ng-template #chuaPhanGVPB>
                      <span class="badge bg-warning text-dark">Chưa phân</span>
                    </ng-template>
                  </td>
                  <td>
                    <div *ngIf="item.thanhVienHoiDong && item.thanhVienHoiDong.length > 0; else chuaCoHoiDong">
                      <div class="hoi-dong-members">
                        <div *ngFor="let tv of item.thanhVienHoiDong" class="hoi-dong-member">
                          <span class="badge" [class.bg-danger]="tv.vaiTro === 'CHU_TICH'"
                                [class.bg-info]="tv.vaiTro === 'THU_KY'"
                                [class.bg-secondary]="tv.vaiTro === 'UY_VIEN'"
                                [class.bg-warning]="!tv.vaiTro">
                            {{ getVaiTroLabel(tv.vaiTro) }}
                          </span>
                          <span class="ms-1">{{ tv.hoTen }}</span>
                        </div>
                      </div>
                    </div>
                    <ng-template #chuaCoHoiDong>
                      <span class="badge bg-secondary">Chưa lập HĐ</span>
                    </ng-template>
                  </td>
                </tr>
                <tr *ngIf="data.length === 0">
                  <td colspan="8" class="text-center py-5">
                    <div class="empty-state">
                      <span class="material-symbols-outlined fs-1 d-block mb-3">inbox</span>
                      <p class="mb-1 fw-semibold">Không có dữ liệu phân công</p>
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
    .phan-cong-container {
      margin-left: -15px;
    }
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
    .hoi-dong-members {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .hoi-dong-member {
      display: flex;
      align-items: center;
    }
    .stt-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background-color: #e9ecef;
      font-weight: 600;
      font-size: 0.8rem;
    }
   
    .page-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .page-icon span {
      font-size: 24px;
      color: var(--bs-primary);
    }
    .empty-state {
      padding: 2rem;
      color: #6c757d;
    }
  `]
})
export class PhanCongAdminComponent implements OnInit {
  data: PhanCongSummaryResponse[] = [];
  boMons: BoMonResponse[] = [];
  dotDangKyList: DotDangKyResponse[] = [];
  selectedBoMonId: number | null = null;
  selectedDotId: number | null = null;

  constructor(private adminService: AdminService, private toastr: ToastrService) {}

  ngOnInit(): void {
    this.loadBoMons();
    this.loadDotDangKy();
    this.loadData();
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

  loadDotDangKy(): void {
    this.adminService.getAllDotDangKy().subscribe({
      next: (res) => {
        if (res.success) {
          this.dotDangKyList = res.data;
        }
      }
    });
  }

  loadData(): void {
    this.adminService.getPhanCongSummary(
      this.selectedBoMonId || undefined,
      this.selectedDotId || undefined
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.data = res.data;
        }
      },
      error: (err) => {
        console.error('Lỗi khi tải dữ liệu phân công:', err);
        this.toastr.error('Không thể tải dữ liệu phân công');
      }
    });
  }

  getVaiTroLabel(vaiTro: string | undefined): string {
    const vaiTroMap: { [key: string]: string } = {
      'CHU_TICH': 'Chủ tịch',
      'THU_KY': 'Thư ký',
      'UY_VIEN': 'Ủy viên'
    };
    return vaiTro ? (vaiTroMap[vaiTro] || vaiTro) : 'Thành viên';
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeTaiResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-danh-sach-gvhd',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>Danh sách Giảng viên hướng dẫn</h2>
     
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngIf="loading" class="text-center p-3">
          <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
        </div>
        <div *ngIf="!loading && gvhdGroups.length === 0" class="alert alert-info">
          Chưa có đề tài nào được phân công GVHD.
        </div>

        <div *ngIf="!loading && gvhdGroups.length > 0">
          <div class="mb-3" *ngFor="let gvhd of gvhdGroups">
            <div class="card gvhd-card" [class.active]="expandedGvhd === gvhd.hoTenGvhd" (click)="toggleGvhd(gvhd.hoTenGvhd)">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <i class="bi bi-person-badge me-2"></i>
                  <strong>{{ gvhd.hoTenGvhd }}</strong>
                  <span class="badge bg-primary ms-2">{{ gvhd.soLuong }} sinh viên</span>
                </div>
                <i class="bi" [ngClass]="expandedGvhd === gvhd.hoTenGvhd ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
            </div>
            <div class="table-responsive mt-2" *ngIf="expandedGvhd === gvhd.hoTenGvhd">
              <table class="table table-hover table-sm">
                <thead class="table-light">
                  <tr>
                    <th class="text-center" style="width: 50px;">STT</th>
                    <th>Sinh viên</th>
                    <th>Mã SV</th>
                    <th>Lớp</th>
                    <th>Tên đề tài</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let dt of gvhd.deTaiList; let i = index">
                    <td class="text-center">{{ i + 1 }}</td>
                    <td>{{ dt.hoTenSinhVien }}</td>
                    <td>{{ dt.maSinhVien }}</td>
                    <td>{{ dt.lopSinhVien }}</td>
                    <td>{{ dt.tenDeTai }}</td>
                    <td>
                      <span class="badge" [ngClass]="getBadgeClass(dt.trangThai)">
                        {{ dt.trangThai }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gvhd-card {
      cursor: pointer;
      transition: all 0.2s;
    }
    .gvhd-card:hover {
      background-color: #f8f9fa;
    }
    .gvhd-card.active {
      background-color: #e7f1ff;
      border-color: #0d6efd;
    }
  `]
})
export class DanhSachGvhdComponent implements OnInit {
  deTaiList: DeTaiResponse[] = [];
  gvhdGroups: { hoTenGvhd: string; soLuong: number; deTaiList: DeTaiResponse[] }[] = [];
  loading = false;
  expandedGvhd: string | null = null;

  constructor(
    private boMonService: BoMonService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    const boMonId = currentUser?.boMonId;

    this.boMonService.getDeTai(undefined, boMonId).subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const filtered = res.data.filter(dt =>
            dt.hoTenGiangVienHuongDan || dt.hoTenGiangVienDuKien
          );
          this.nhomTheoGvhd(filtered);
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Không thể tải danh sách');
      }
    });
  }

  toggleGvhd(hoTen: string): void {
    this.expandedGvhd = this.expandedGvhd === hoTen ? null : hoTen;
  }

  nhomTheoGvhd(deTaiList: DeTaiResponse[]): void {
    const map = new Map<string, DeTaiResponse[]>();

    deTaiList.forEach(dt => {
      const tenGvhd = dt.hoTenGiangVienHuongDan || dt.hoTenGiangVienDuKien || 'Chưa phân công';
      if (!map.has(tenGvhd)) {
        map.set(tenGvhd, []);
      }
      map.get(tenGvhd)!.push(dt);
    });

    this.gvhdGroups = Array.from(map.entries()).map(([hoTenGvhd, deTaiList]) => ({
      hoTenGvhd,
      soLuong: deTaiList.length,
      deTaiList
    }));
  }

  getBadgeClass(trangThai: string): string {
    switch (trangThai) {
      case 'DANG_THUC_HIEN': return 'bg-success';
      case 'CHO_GV_DUYET': return 'bg-warning';
      case 'DA_DUYET': return 'bg-primary';
      case 'CHO_PHAN_CONG_PB': return 'bg-info';
      case 'DA_PHAN_CONG_PB': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  }
}

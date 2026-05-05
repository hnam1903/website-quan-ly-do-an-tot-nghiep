import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeTaiResponse, PhanCongHuongDanResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-danh-sach-gvhd',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-primary-subtle">
          <i class="bi bi-person-badge text-primary"></i>
        </div>
        <div>
          <h2>Danh sách Giảng viên hướng dẫn</h2>
          <p class="mb-0">Theo dõi phân công GVHD theo từng giảng viên</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngIf="loading" class="text-center p-3">
          <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
        </div>
        <div *ngIf="!loading && gvhdGroups.length === 0" class="alert alert-info">
          <i class="bi bi-info-circle me-2"></i>Chưa có đề tài nào được phân công GVHD.
        </div>

        <div *ngIf="!loading && gvhdGroups.length > 0">
          <div class="mb-3" *ngFor="let gvhd of gvhdGroups">
            <div class="gvhd-card gv-card" [class.active]="expandedGvhd === gvhd.hoTenGvhd" (click)="toggleGvhd(gvhd.hoTenGvhd)">
              <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-3">
                    <div >
                      <i class="bi bi-person-badge"></i>
                    </div>
                    <div>
                      <strong>{{ gvhd.hoTenGvhd }}</strong>
                      <span class="badge bg-primary ms-2">{{ gvhd.soLuong }} sinh viên</span>
                    </div>
                  </div>
                  <i class="bi" [ngClass]="expandedGvhd === gvhd.hoTenGvhd ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
                </div>
              </div>
            </div>
            <div class="table-responsive mt-2" *ngIf="expandedGvhd === gvhd.hoTenGvhd">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th class="text-center" style="width: 60px">STT</th>
                    <th>Sinh viên</th>
                    <th style="width: 100px">Mã SV</th>
                    <th style="width: 100px">Lớp</th>
                    <th>Tên đề tài</th>
                    <th style="width: 140px">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let dt of gvhd.deTaiList; let i = index">
                    <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
                    <td><strong>{{ dt.hoTenSinhVien }}</strong></td>
                    <td><code>{{ dt.maSinhVien }}</code></td>
                    <td>{{ dt.lopSinhVien }}</td>
                    <td>{{ dt.tenDeTai }}</td>
                    <td><span class="badge" [ngClass]="getBadgeClass(dt.deTaiTrangThai || '')">{{ dt.deTaiTrangThai }}</span></td>
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
    .gv-icon {
      width: 40px;
      height: 40px;
      background: var(--primary-light);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--primary);
      font-size: 1.25rem;
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

    this.boMonService.getDanhSachGvhd().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          const data = (res.data.map(pc => ({
            id: pc.id,
            deTaiId: pc.deTaiId,
            tenDeTai: pc.tenDeTai,
            hoTenSinhVien: pc.hoTenSinhVien,
            maSinhVien: pc.maSinhVien,
            lopSinhVien: pc.lopSinhVien,
            hoTenGiangVienHuongDan: pc.hoTenGiangVien,
            trangThai: pc.deTaiTrangThai,
            deTaiTrangThai: pc.deTaiTrangThai
          })) as unknown) as DeTaiResponse[];
          
          this.nhomTheoGvhd(data);
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
      const tenGvhd = dt.hoTenGiangVienHuongDan || 'Chưa phân công';
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
    if (!trangThai) return 'bg-secondary';
    switch (trangThai) {
      case 'DANG_THUC_HIEN': return 'bg-success';
      case 'DAT_GVHD': return 'bg-primary';
      case 'CHO_PHAN_BIEN': return 'bg-info';
      case 'DAT_PHAN_BIEN': return 'bg-warning text-dark';
      case 'CHO_BO_MON_DUYET': return 'bg-warning text-dark';
      case 'DA_GUI_BO_MON': return 'bg-warning text-dark';
      case 'HOAN_THANH': return 'bg-success';
      case 'KHONG_DAT_BAO_VE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeTaiResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-danh-sach-gvpb',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>Danh sách GVPB</h2>
      <p class="text-muted mb-0">Xem danh sách phân công giảng viên phản biện theo từng GV</p>
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngIf="loading" class="text-center p-3">
          <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
        </div>
        <div *ngIf="!loading && gvpbGroups.length === 0" class="alert alert-info">
          Chưa có đề tài nào được phân công GVPB.
        </div>

        <div *ngIf="!loading && gvpbGroups.length > 0">
          <div class="mb-3" *ngFor="let gvpb of gvpbGroups">
            <div class="card gvpb-card" [class.active]="expandedGvpb === gvpb.hoTenGvpb" (click)="toggleGvpb(gvpb.hoTenGvpb)">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <i class="bi bi-person-badge me-2"></i>
                  <strong>{{ gvpb.hoTenGvpb }}</strong>
                  <span class="badge bg-primary ms-2">{{ gvpb.soLuong }} sinh viên</span>
                </div>
                <i class="bi" [ngClass]="expandedGvpb === gvpb.hoTenGvpb ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
            </div>
            <div class="table-responsive mt-2" *ngIf="expandedGvpb === gvpb.hoTenGvpb">
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
                  <tr *ngFor="let dt of gvpb.deTaiList; let i = index">
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
    .gvpb-card {
      cursor: pointer;
      transition: all 0.2s;
    }
    .gvpb-card:hover {
      background-color: #f8f9fa;
    }
    .gvpb-card.active {
      background-color: #fff3cd;
      border-color: #ffc107;
    }
  `]
})
export class DanhSachGvpbComponent implements OnInit {
  deTaiList: DeTaiResponse[] = [];
  gvpbGroups: { hoTenGvpb: string; soLuong: number; deTaiList: DeTaiResponse[] }[] = [];
  loading = false;
  expandedGvpb: string | null = null;

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
            dt.hoTenGiangVienPhanBien
          );
          this.nhomTheoGvpb(filtered);
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Không thể tải danh sách');
      }
    });
  }

  toggleGvpb(hoTen: string): void {
    this.expandedGvpb = this.expandedGvpb === hoTen ? null : hoTen;
  }

  nhomTheoGvpb(deTaiList: DeTaiResponse[]): void {
    const map = new Map<string, DeTaiResponse[]>();

    deTaiList.forEach(dt => {
      const tenGvpb = dt.hoTenGiangVienPhanBien || 'Chưa phân công';
      if (!map.has(tenGvpb)) {
        map.set(tenGvpb, []);
      }
      map.get(tenGvpb)!.push(dt);
    });

    this.gvpbGroups = Array.from(map.entries()).map(([hoTenGvpb, deTaiList]) => ({
      hoTenGvpb,
      soLuong: deTaiList.length,
      deTaiList
    }));
  }

  getBadgeClass(trangThai: string): string {
    switch (trangThai) {
      case 'DANG_THUC_HIEN': return 'bg-success';
      case 'CHO_GV_DUYET': return 'bg-warning';
      case 'DA_DUYET': return 'bg-primary';
      case 'DAT_GVHD': return 'bg-info';
      case 'CHO_PHAN_CONG_HD': return 'bg-warning';
      case 'CHO_PHAN_CONG_PB': return 'bg-warning';
      case 'DA_PHAN_CONG_PB': return 'bg-secondary';
      case 'DA_PHAN_CONG_HD': return 'bg-info';
      case 'CHO_HOI_DONG': return 'bg-warning';
      case 'DA_CHAM_DIEM': return 'bg-primary';
      case 'DA_BAO_VE': return 'bg-success';
      case 'KET_QUA': return 'bg-success';
      default: return 'bg-secondary';
    }
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeTaiResponse, PhanCongPhanBienResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-danh-sach-gvpb',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-warning-subtle">
          <span class="material-symbols-outlined text-warning">person_check</span>
        </div>
        <div>
          <h2>Danh sách GVPB</h2>
          <p class="mb-0">Xem danh sách phân công giảng viên phản biện</p>
        </div>
        <div class="ms-auto">
          <select class="form-select" style="width: 200px;" [(ngModel)]="selectedDotId" (change)="loadData()">
            <option [ngValue]="null">Tất cả đợt</option>
            <option *ngFor="let dot of dotList" [ngValue]="dot.id">{{ dot.tenDot }}</option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngIf="loading" class="text-center p-3">
          <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
        </div>
        <div *ngIf="!loading && gvpbGroups.length === 0" class="alert alert-info">
          <span class="material-symbols-outlined me-2">info</span>Chưa có đề tài nào được phân công GVPB.
        </div>

        <div *ngIf="!loading && gvpbGroups.length > 0">
          <div class="mb-3" *ngFor="let gvpb of gvpbGroups">
            <div class="gvpb-card pb-card" [class.active]="expandedGvpb === gvpb.hoTenGvpb" (click)="toggleGvpb(gvpb.hoTenGvpb)">
              <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-3">
                    <div >
                      <span class="material-symbols-outlined">person_check</span>
                    </div>
                    <div>
                      <strong>{{ gvpb.hoTenGvpb }}</strong>
                      <span class="badge bg-warning text-dark ms-2">{{ gvpb.soLuong }} sinh viên</span>
                    </div>
                  </div>
                  <span class="material-symbols-outlined">{{ expandedGvpb === gvpb.hoTenGvpb ? 'expand_less' : 'expand_more' }}</span>
                </div>
              </div>
            </div>
            <div class="table-responsive mt-2" *ngIf="expandedGvpb === gvpb.hoTenGvpb">
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
                  <tr *ngFor="let dt of gvpb.deTaiList; let i = index">
                    <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
                    <td><strong>{{ dt.hoTenSinhVien }}</strong></td>
                    <td><code>{{ dt.maSinhVien }}</code></td>
                    <td>{{ dt.lopSinhVien }}</td>
                    <td>{{ dt.tenDeTai }}</td>
                    <td><span class="badge" [ngClass]="getBadgeClass(dt.trangThai)">{{ dt.trangThai }}</span></td>
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
    .pb-icon {
      width: 40px;
      height: 40px;
      background: var(--warning-light);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--warning);
      font-size: 1.25rem;
    }
  `]
})
export class DanhSachGvpbComponent implements OnInit {
  deTaiList: DeTaiResponse[] = [];
  gvpbGroups: { hoTenGvpb: string; soLuong: number; deTaiList: DeTaiResponse[] }[] = [];
  loading = false;
  expandedGvpb: string | null = null;
  selectedDotId: number | null = null;
  dotList: any[] = [];

  constructor(
    private boMonService: BoMonService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDotList();
    this.loadData();
  }

  loadDotList(): void {
    this.boMonService.getAllDotDangKy().subscribe((res: any) => {
      if (res.success) {
        this.dotList = res.data;
      }
    });
  }

  loadData(): void {
    this.loading = true;
    const dotId = this.selectedDotId ?? undefined;

    this.boMonService.getDanhSachGvpb(dotId).subscribe({
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
            hoTenGiangVienPhanBien: pc.hoTenGiangVien,
            trangThai: pc.deTaiTrangThai
          })) as unknown) as DeTaiResponse[];
          
          this.nhomTheoGvpb(data);
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
    if (!trangThai) return 'bg-secondary';
    switch (trangThai) {
      case 'DANG_THUC_HIEN': return 'bg-success';
      case 'DAT_GVHD': return 'bg-primary';
      case 'CHO_PHAN_BIEN': return 'bg-info';
      case 'DAT_PHAN_BIEN': return 'bg-warning text-dark';
      case 'CHO_BO_MON_DUYET': return 'bg-warning text-dark';
      case 'CHO_GV_DUYET': return 'bg-warning text-dark';
      case 'GV_TU_CHOI': return 'bg-warning text-dark';
      case 'CHO_GV_PHAN_CONG': return 'bg-warning text-dark';
      case 'CHO_BO_MON_PHAN_CONG': return 'bg-warning text-dark';
      case 'HOAN_THANH': return 'bg-success';
      case 'KHONG_DAT_BAO_VE': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }
}

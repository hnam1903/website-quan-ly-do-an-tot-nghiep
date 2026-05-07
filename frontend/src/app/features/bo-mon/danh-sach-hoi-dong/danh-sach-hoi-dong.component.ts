import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { HoiDongBaoVeResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-danh-sach-hoi-dong',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-info-subtle">
          <span class="material-symbols-outlined text-info">group</span>
        </div>
        <div>
          <h2>Danh sách hội đồng bảo vệ</h2>
          <p class="mb-0">Xem thông tin hội đồng đã thành lập</p>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngIf="loading" class="text-center p-3">
          <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
        </div>
        <div *ngIf="!loading && hoiDongList.length === 0" class="alert alert-info">
          <span class="material-symbols-outlined me-2">info</span>Chưa có hội đồng bảo vệ nào được thành lập.
        </div>

        <div *ngIf="!loading && hoiDongList.length > 0">
          <div class="mb-3" *ngFor="let hd of hoiDongList">
            <div class="hoi-dong-card hd-card" [class.active]="expandedHd === hd.id" (click)="toggleHoiDong(hd.id)">
              <div class="card-body">
                <div class="d-flex align-items-center justify-content-between">
                  <div class="d-flex align-items-center gap-3">
                    <div >
                      <span class="material-symbols-outlined">group</span>
                    </div>
                    <div>
                      <strong>{{ hd.sinhVien || hd.hoTenSinhVien }}</strong>
                      <br>
                      <small class="text-muted">{{ hd.deTai || hd.tenDeTai }}</small>
                    </div>
                  </div>
                  <div class="d-flex align-items-center gap-4 me-3">
                    <span class="text-muted"><strong>Ngày:</strong> {{ hd.ngayBaoVe | date:'dd/MM/yyyy' }}</span>
                    <span class="text-muted"><strong>Phòng:</strong> {{ hd.diaDiem }}</span>
                  </div>
                  <span class="material-symbols-outlined">{{ expandedHd === hd.id ? 'expand_less' : 'expand_more' }}</span>
                </div>
              </div>
            </div>
            <div class="table-responsive mt-2" *ngIf="expandedHd === hd.id">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th class="text-center" style="width: 60px">STT</th>
                    <th>Thành viên</th>
                    <th style="width: 140px">Vai trò</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let tv of hd.thanhViens; let i = index">
                    <td class="text-center"><span class="stt-badge">{{ i + 2 }}</span></td>
                    <td><span class="material-symbols-outlined me-2 text-muted">person</span>{{ tv.hoTen || tv.hoTenGiangVien }}</td>
                    <td><span  [ngClass]="getVaiTroBadge(tv.vaiTro)"><span class="material-symbols-outlined me-1">{{ getVaiTroIcon(tv.vaiTro) }}</span>{{ getVaiTroText(tv.vaiTro) }}</span></td>
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
    .hoi-dong-card {
      cursor: pointer;
      transition: all 0.2s;
    }
    .hd-icon {
      width: 40px;
      height: 40px;
      background: var(--info-light);
      border-radius: var(--radius-lg);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--info);
      font-size: 1.25rem;
    }
  `]
})
export class DanhSachHoiDongComponent implements OnInit {
  hoiDongList: any[] = [];
  loading = false;
  expandedHd: number | null = null;

  constructor(
    private boMonService: BoMonService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.loading = true;
    this.boMonService.getHoiDongBaoVe().subscribe({
      next: (res) => {
        this.loading = false;
        if (res.success) {
          this.hoiDongList = res.data || [];
        }
      },
      error: (err) => {
        this.loading = false;
        this.toastr.error('Không thể tải danh sách hội đồng');
      }
    });
  }

  toggleHoiDong(id: number): void {
    this.expandedHd = this.expandedHd === id ? null : id;
  }

  getBadgeClass(trangThai: string): string {
    switch (trangThai) {
      case 'CHO_BAO_VE': return 'bg-warning';
      case 'DANG_BAO_VE': return 'bg-info';
      case 'DA_BAO_VE': return 'bg-success';
      default: return 'bg-secondary';
    }
  }

  getTrangThaiText(trangThai: string): string {
    switch (trangThai) {
      case 'CHO_BAO_VE': return 'Chờ bảo vệ';
      case 'DANG_BAO_VE': return 'Đang bảo vệ';
      case 'DA_BAO_VE': return 'Đã bảo vệ';
      default: return trangThai;
    }
  }

  getVaiTroBadge(vaiTro: string): string {
    switch (vaiTro) {
      case 'CHU_TICH': return 'badge-danger';
      case 'THU_KY': return 'badge-primary';
      case 'UY_VIEN': return 'badge-secondary';
      default: return 'badge-secondary';
    }
  }

  getVaiTroIcon(vaiTro: string): string {
    switch (vaiTro) {
      case 'CHU_TICH': return 'shield';
      case 'THU_KY': return 'edit';
      case 'UY_VIEN': return 'person';
      default: return 'person';
    }
  }

  getVaiTroText(vaiTro: string): string {
    switch (vaiTro) {
      case 'CHU_TICH': return 'Chủ tịch';
      case 'THU_KY': return 'Thư ký';
      case 'UY_VIEN': return 'Ủy viên';
      default: return vaiTro;
    }
  }
}

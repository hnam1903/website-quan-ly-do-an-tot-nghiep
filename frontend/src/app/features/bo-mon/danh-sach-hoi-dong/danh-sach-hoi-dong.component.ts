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
      <h2>Danh sách hội đồng bảo vệ</h2>
     
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngIf="loading" class="text-center p-3">
          <span class="spinner-border spinner-border-sm me-2"></span> Đang tải...
        </div>
        <div *ngIf="!loading && hoiDongList.length === 0" class="alert alert-info">
          Chưa có hội đồng bảo vệ nào được thành lập.
        </div>

        <div *ngIf="!loading && hoiDongList.length > 0">
          <div class="mb-3" *ngFor="let hd of hoiDongList">
            <div class="card hoi-dong-card" [class.active]="expandedHd === hd.id" (click)="toggleHoiDong(hd.id)">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <i class="bi bi-people me-2"></i>
                  <strong>{{ hd.sinhVien || hd.hoTenSinhVien }}</strong>
                  <span class="text-muted ms-2">{{ hd.deTai || hd.tenDeTai }}</span>
                </div>
                <div class="d-flex align-items-center gap-3 ms-auto">
                  <span class="text-muted"><strong>Ngày bảo vệ:</strong> {{ hd.ngayBaoVe | date:'dd/MM/yyyy' }}</span>
                  <span class="text-muted"><strong>Phòng:</strong> {{ hd.diaDiem }}</span>
                </div>
                <i class="bi" [ngClass]="expandedHd === hd.id ? 'bi-chevron-up' : 'bi-chevron-down'"></i>
              </div>
            </div>
            <div class="table-responsive mt-2" *ngIf="expandedHd === hd.id">
              <table class="table table-hover table-sm">
                <thead class="table-light">
                  <tr>
                    <th class="text-center" style="width: 50px;">STT</th>
                    <th>Thành viên</th>
                    <th>Vai trò</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let tv of hd.thanhViens; let i = index">
                    <td class="text-center">{{ i + 2 }}</td>
                    <td>{{ tv.hoTen || tv.hoTenGiangVien }}</td>
                    <td><span class="badge" [ngClass]="getVaiTroBadge(tv.vaiTro)">{{ getVaiTroText(tv.vaiTro) }}</span></td>
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
    .hoi-dong-card:hover {
      background-color: #f8f9fa;
    }
    .hoi-dong-card.active {
      background-color: #e3f2fd;
      border-color: #2196f3;
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
      case 'CHU_TICH': return 'bg-danger';
      case 'THU_KY': return 'bg-primary';
      case 'UY_VIEN': return 'bg-secondary';
      default: return 'bg-secondary';
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

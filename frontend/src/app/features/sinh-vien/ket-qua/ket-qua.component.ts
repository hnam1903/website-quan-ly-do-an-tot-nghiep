import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SinhVienService } from '../../../core/services/sinh-vien.service';
import { DeTaiResponse, DiemHuongDanResponse, DiemPhanBienResponse } from '../../../core/models/models';

@Component({
  selector: 'app-ket-qua',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>Kết quả đồ án</h2>
      <p class="text-muted mb-0">Xem kết quả các giai đoạn đồ án</p>
    </div>

    <div class="row">
      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">Điểm Hướng dẫn</h5>
          </div>
          <div class="card-body text-center">
            <h1 class="display-4" *ngIf="ketQuaHD">{{ ketQuaHD.diem }}</h1>
            <h1 class="display-4 text-muted" *ngIf="!ketQuaHD">-</h1>
            <p *ngIf="ketQuaHD">
              <span [class]="ketQuaHD.trangThai === 'DU_DIEU_KIEN' ? 'badge bg-success' : 'badge bg-danger'">
                {{ ketQuaHD.trangThai === 'DU_DIEU_KIEN' ? 'Đạt' : 'Không đạt' }}
              </span>
            </p>
            <p *ngIf="ketQuaHD?.nhanXet" class="text-muted small">{{ ketQuaHD?.nhanXet }}</p>
            <p *ngIf="!ketQuaHD" class="text-muted">Chưa có kết quả</p>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-header bg-warning text-dark">
            <h5 class="mb-0">Điểm Phản biện</h5>
          </div>
          <div class="card-body text-center">
            <h1 class="display-4" *ngIf="ketQuaPB">{{ ketQuaPB.diem }}</h1>
            <h1 class="display-4 text-muted" *ngIf="!ketQuaPB">-</h1>
            <p *ngIf="ketQuaPB">
              <span [class]="ketQuaPB.trangThai === 'DU_DIEU_KIEN' ? 'badge bg-success' : 'badge bg-danger'">
                {{ ketQuaPB.trangThai === 'DU_DIEU_KIEN' ? 'Đạt' : 'Không đạt' }}
              </span>
            </p>
            <p *ngIf="ketQuaPB?.nhanXet" class="text-muted small">{{ ketQuaPB?.nhanXet }}</p>
            <p *ngIf="!ketQuaPB" class="text-muted">Chưa có kết quả</p>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">Điểm Bảo vệ</h5>
          </div>
          <div class="card-body text-center">
            <h1 class="display-4" *ngIf="ketQuaBV">{{ ketQuaBV.diemBaoVe }}</h1>
            <h1 class="display-4 text-muted" *ngIf="!ketQuaBV">-</h1>
            <p *ngIf="!ketQuaBV" class="text-muted">Chưa có kết quả</p>
          </div>
        </div>
      </div>
    </div>
  `
})
export class KetQuaComponent implements OnInit {
  ketQuaHD: DiemHuongDanResponse | null = null;
  ketQuaPB: DiemPhanBienResponse | null = null;
  ketQuaBV: DeTaiResponse | null = null;

  constructor(private svService: SinhVienService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.svService.getKetQuaHuongDan().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.ketQuaHD = res.data;
        }
      }
    });

    this.svService.getKetQuaPhanBien().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.ketQuaPB = res.data;
        }
      }
    });

    this.svService.getKetQuaBaoVe().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.ketQuaBV = res.data;
        }
      }
    });
  }
}

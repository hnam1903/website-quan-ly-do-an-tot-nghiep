import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SinhVienService } from '../../../core/services/sinh-vien.service';
import { DeTaiResponse, DiemHuongDanResponse, DiemPhanBienResponse } from '../../../core/models/models';

@Component({
  selector: 'app-ket-qua',
  standalone: true,
  imports: [CommonModule, DatePipe],
  template: `
    <div class="page-header">
      <h2>Kết quả đồ án tốt nghiệp</h2>
      
    </div>

    <div class="row g-4">
      <!-- Điểm Hướng dẫn -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-gradient text-white py-3" style="background: linear-gradient(135deg, #17a2b8, #138496);">
            <div class="d-flex align-items-center">
              <i class="bi bi-person-check fs-4 me-2"></i>
              <h5 class="mb-0">Điểm Hướng dẫn</h5>
            </div>
          </div>
          <div class="card-body text-center py-4">
            <div class="small text-muted mb-2">
              <i class="bi bi-pencil-square me-1"></i>Điểm Hướng dẫn
            </div>
            <div class="display-1 mb-3" [class.text-success]="ketQuaHD && ketQuaHD.diem! >= 5" [class.text-danger]="ketQuaHD && ketQuaHD.diem! < 5" [class.text-muted]="!ketQuaHD">
              {{ ketQuaHD?.diem || '-' }}
            </div>
            <div *ngIf="ketQuaHD" class="mb-3">
              <span class="badge rounded-pill px-3 py-2" [class.bg-success]="ketQuaHD.trangThai === 'DU_DIEU_KIEN'" [class.bg-danger]="ketQuaHD.trangThai !== 'DU_DIEU_KIEN'">
                {{ ketQuaHD.trangThai === 'DU_DIEU_KIEN' ? 'Đạt điều kiện' : 'Không đạt' }}
              </span>
            </div>
            <div *ngIf="ketQuaHD?.nhanXet" class="mt-3 p-3 bg-light rounded text-start">
              <small class="text-muted fw-bold d-block mb-1">Nhận xét của giảng viên hướng dẫn:</small>
              <p class="mb-0 text-secondary" style="font-size: 0.9rem; line-height: 1.5;">{{ ketQuaHD?.nhanXet }}</p>
            </div>
            <div *ngIf="!ketQuaHD" class="text-muted mt-3">
              <i class="bi bi-clock-history me-1"></i> Chưa có kết quả
            </div>
          </div>
        </div>
      </div>

      <!-- Điểm Phản biện -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-gradient text-white py-3" style="background: linear-gradient(135deg, #ffc107, #e0a800);">
            <div class="d-flex align-items-center">
              <i class="bi bi-chat-square-text fs-4 me-2"></i>
              <h5 class="mb-0">Điểm Phản biện</h5>
            </div>
          </div>
          <div class="card-body text-center py-4">
            <div class="small text-muted mb-2">
              <i class="bi bi-pencil-square me-1"></i>Điểm Phản biện
            </div>
            <div class="display-1 mb-3" [class.text-success]="ketQuaPB && ketQuaPB.diem! >= 5" [class.text-danger]="ketQuaPB && ketQuaPB.diem! < 5" [class.text-muted]="!ketQuaPB">
              {{ ketQuaPB?.diem || '-' }}
            </div>
            <div *ngIf="ketQuaPB" class="mb-3">
              <span class="badge rounded-pill px-3 py-2" [class.bg-success]="ketQuaPB.trangThai === 'DU_DIEU_KIEN'" [class.bg-danger]="ketQuaPB.trangThai !== 'DU_DIEU_KIEN'">
                {{ ketQuaPB.trangThai === 'DU_DIEU_KIEN' ? 'Đạt điều kiện' : 'Không đạt' }}
              </span>
            </div>
            <div *ngIf="ketQuaPB?.nhanXet" class="mt-3 p-3 bg-light rounded text-start">
              <small class="text-muted fw-bold d-block mb-1">Nhận xét Của giảng viên phản biện:</small>
              <p class="mb-0 text-secondary" style="font-size: 0.9rem; line-height: 1.5;">{{ ketQuaPB?.nhanXet }}</p>
            </div>
            <div *ngIf="!ketQuaPB" class="text-muted mt-3">
              <i class="bi bi-clock-history me-1"></i> Chưa có kết quả
            </div>
          </div>
        </div>
      </div>

      <!-- Điểm Bảo vệ -->
      <div class="col-lg-4">
        <div class="card border-0 shadow-sm h-100">
          <div class="card-header bg-gradient text-white py-3" style="background: linear-gradient(135deg, #28a745, #1e7e34);">
            <div class="d-flex align-items-center">
              <i class="bi bi-shield-check fs-4 me-2"></i>
              <h5 class="mb-0">Điểm Bảo vệ</h5>
            </div>
          </div>
          <div class="card-body text-center py-4">
            <div class="small text-muted mb-2">
              <i class="bi bi-pencil-square me-1"></i>Điểm Bảo vệ
            </div>
            <div class="display-1 mb-3" [class.text-success]="ketQuaBV?.diemBaoVe && ketQuaBV!.diemBaoVe! >= 5" [class.text-danger]="ketQuaBV?.diemBaoVe && ketQuaBV!.diemBaoVe! < 5" [class.text-muted]="!ketQuaBV?.diemBaoVe">
              {{ ketQuaBV?.diemBaoVe || '-' }}
            </div>
            <small class="text-muted d-block mb-3">Điểm trung bình hội đồng</small>
            <div *ngIf="ketQuaBV?.nhanXetCham" class="mt-3 p-3 bg-light rounded text-start">
              <small class="text-muted fw-bold d-block mb-1">Nhận xét hội đồng:</small>
              <p class="mb-0 text-secondary" style="font-size: 0.9rem; line-height: 1.5;">{{ ketQuaBV?.nhanXetCham }}</p>
            </div>
            
            <div *ngIf="!ketQuaBV?.diemBaoVe" class="text-muted mt-3">
              <i class="bi bi-clock-history me-1"></i> Chưa có kết quả
            </div>
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

  tinhTongDiem(): number {
    if (!this.ketQuaHD || !this.ketQuaPB || !this.ketQuaBV?.diemBaoVe) return 0;
    return Number(this.ketQuaHD.diem) + Number(this.ketQuaPB.diem) + Number(this.ketQuaBV.diemBaoVe);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SinhVienService } from '../../../core/services/sinh-vien.service';
import { DeTaiResponse } from '../../../core/models/models';

@Component({
  selector: 'app-lich-bao-ve',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>Lịch bảo vệ tốt nghiệp</h2>
      
    </div>

    <div *ngIf="!coLich" class="alert alert-info">
      <i class="bi bi-info-circle me-2"></i>
      Hiện tại chưa có lịch bảo vệ. Vui lòng chờ thông báo từ Bộ môn.
    </div>

    <div *ngIf="coLich && lichBaoVe" class="card">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0"><i class="bi bi-calendar-event me-2"></i>Thông tin lịch bảo vệ</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-4">
              <h6 class="text-muted mb-2">Đề tài</h6>
              <h5 class="text-primary">{{ lichBaoVe.tenDeTai }}</h5>
            </div>

            <div class="mb-4">
              <h6 class="text-muted mb-2">Ngày bảo vệ</h6>
              <p class="h4 text-success">
                <i class="bi bi-calendar3 me-2"></i>
                {{ lichBaoVe.ngayBaoVe ? (lichBaoVe.ngayBaoVe | date:'dd/MM/yyyy') : 'Chưa xác định' }}
              </p>
            </div>

            <div class="mb-4">
              <h6 class="text-muted mb-2">Địa điểm</h6>
              <p class="h5">
                <i class="bi bi-geo-alt text-danger me-2"></i>
                {{ lichBaoVe.diaDiem || 'Chưa xác định' }}
              </p>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-4">
              <h6 class="text-muted mb-2">Sinh viên</h6>
              <p class="mb-1"><strong>{{ lichBaoVe.hoTenSinhVien }}</strong></p>
              <p class="text-muted mb-0">MSSV: {{ lichBaoVe.maSinhVien }} | Lớp: {{ lichBaoVe.lopSinhVien }}</p>
            </div>

            <div class="mb-4">
              <h6 class="text-muted mb-2">Giảng viên hướng dẫn</h6>
              <p><strong>{{ lichBaoVe.hoTenGiangVienHuongDan || 'Chưa phân công' }}</strong></p>
            </div>

            <div class="mb-4">
              <h6 class="text-muted mb-2">Hội đồng bảo vệ</h6>
              <ul class="list-unstyled" *ngIf="lichBaoVe.thanhVienHoiDongList?.length">
                <li *ngFor="let tv of lichBaoVe.thanhVienHoiDongList" class="mb-2">
                  <i class="bi bi-person-badge me-2 text-primary"></i>
                  {{ tv.hoTen }}
                  <span class="badge bg-secondary ms-2">{{ getVaiTroText(tv.vaiTro) }}</span>
                </li>
              </ul>
              <p *ngIf="!lichBaoVe.thanhVienHoiDongList?.length" class="text-muted">Chưa có thông tin hội đồng</p>
            </div>
          </div>
        </div>

        <div class="alert alert-warning mt-4">
          <i class="bi bi-lightbulb me-2"></i>
          <strong>Lưu ý:</strong> Vui lòng có mặt đúng ngày và ăn mặc lịch sự.
        </div>

      </div>
    </div>
  `
})
export class LichBaoVeComponent implements OnInit {
  lichBaoVe: DeTaiResponse | null = null;
  coLich = false;

  constructor(private svService: SinhVienService) {}

  ngOnInit(): void {
    this.loadLichBaoVe();
  }

  loadLichBaoVe(): void {
    this.svService.getLichBaoVe().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.lichBaoVe = res.data;
          this.coLich = true;
        } else {
          this.coLich = false;
        }
      },
      error: (err) => {
        console.error('Lỗi load lịch bảo vệ:', err);
        this.coLich = false;
      }
    });
  }

  getVaiTroText(vaiTro: string | undefined): string {
    if (!vaiTro) return 'Thành viên';
    switch (vaiTro) {
      case 'CHU_TICH': return 'Chủ tịch';
      case 'THU_KY': return 'Thư ký';
      case 'UY_VIEN': return 'Ủy viên';
      default: return vaiTro;
    }
  }
}

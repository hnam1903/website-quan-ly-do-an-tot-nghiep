import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SinhVienService } from '../../../core/services/sinh-vien.service';
import { DeTaiResponse } from '../../../core/models/models';

@Component({
  selector: 'app-lich-bao-ve',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="mb-1">
            <i class="bi bi-calendar-event me-2"></i>
            Lịch bảo vệ tốt nghiệp
          </h2>
          <p class="text-muted mb-0 small">Xem thông tin lịch bảo vệ đồ án của bạn</p>
        </div>
      </div>

      <!-- Alert: Chưa có lịch -->
      <div class="alert alert-info" *ngIf="!coLich">
        <i class="bi bi-info-circle me-2"></i>
        Hiện tại chưa có lịch bảo vệ. Vui lòng chờ thông báo từ Bộ môn.
      </div>

      <!-- Main Card -->
      <div class="card shadow-sm" *ngIf="coLich && lichBaoVe">
        
        <div class="card-body p-4">
          <div class="row">
            <!-- Cột trái -->
            <div class="col-md-6">
              <div class="lbv-info-section">
                <div class="lbv-label">
                  <i class="bi bi-card-heading"></i> Đề tài
                </div>
                <h5 class="lbv-value text-primary">{{ lichBaoVe.tenDeTai }}</h5>
              </div>

              <div class="lbv-info-section">
                <div class="lbv-label">
                  <i class="bi bi-calendar3"></i> Ngày bảo vệ
                </div>
                <h4 class="lbv-value lbv-date">
                  <i class="bi bi-calendar-event me-2"></i>
                  {{ lichBaoVe.ngayBaoVe ? (lichBaoVe.ngayBaoVe | date:'dd/MM/yyyy') : 'Chưa xác định' }}
                </h4>
              </div>

              <div class="lbv-info-section">
                <div class="lbv-label">
                  <i class="bi bi-geo-alt"></i> Địa điểm
                </div>
                <h5 class="lbv-value">
                  <i class="bi bi-building me-2 text-danger"></i>
                  {{ lichBaoVe.diaDiem || 'Chưa xác định' }}
                </h5>
              </div>
            </div>

            <!-- Cột phải -->
            <div class="col-md-6">
              <div class="lbv-info-section">
                <div class="lbv-label">
                  <i class="bi bi-person"></i> Sinh viên
                </div>
                <p class="lbv-value mb-1"><strong>{{ lichBaoVe.hoTenSinhVien }}</strong></p>
                <p class="lbv-sub-text mb-0">MSSV: {{ lichBaoVe.maSinhVien }} | Lớp: {{ lichBaoVe.lopSinhVien }}</p>
              </div>

              <div class="lbv-info-section">
                <div class="lbv-label">
                  <i class="bi bi-mortarboard"></i> Giảng viên hướng dẫn
                </div>
                <p class="lbv-value mb-0">
                  <i class="bi bi-person-badge me-2 text-primary"></i>
                  {{ lichBaoVe.hoTenGiangVienHuongDan || 'Chưa phân công' }}
                </p>
              </div>

              <div class="lbv-info-section">
                <div class="lbv-label">
                  <i class="bi bi-people"></i> Hội đồng bảo vệ
                </div>
                <ul class="lbv-member-list" *ngIf="lichBaoVe.thanhVienHoiDongList?.length">
                  <li *ngFor="let tv of lichBaoVe.thanhVienHoiDongList" class="lbv-member-item">
                    <i class="bi bi-person-circle"></i>
                    <span class="lbv-member-name">{{ tv.hoTen }}</span>
                    <span class="lbv-member-role">{{ getVaiTroText(tv.vaiTro) }}</span>
                  </li>
                </ul>
                <p *ngIf="!lichBaoVe.thanhVienHoiDongList?.length" class="lbv-no-data">Chưa có thông tin hội đồng</p>
              </div>
            </div>
          </div>

          <!-- Note -->
          <div class="lbv-note">
            <i class="bi bi-lightbulb-fill"></i>
            <div>
              <strong>Lưu ý:</strong> Vui lòng có mặt đúng ngày và ăn mặc lịch sự.
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Info Section */
    .lbv-info-section {
      margin-bottom: 24px;
    }
    .lbv-info-section:last-child {
      margin-bottom: 0;
    }

    /* Label */
    .lbv-label {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      font-weight: 600;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    .lbv-label i {
      font-size: 14px;
    }

    /* Value */
    .lbv-value {
      margin: 0;
      font-size: 16px;
      color: #212529;
      line-height: 1.5;
    }
    .lbv-sub-text {
      font-size: 14px;
      color: #6c757d;
    }

    /* Date Special Style */
    .lbv-date {
      color: #198754;
      font-weight: 600;
    }

    /* Member List */
    .lbv-member-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .lbv-member-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px 14px;
      background: #f8f9fa;
      border-radius: 8px;
      margin-bottom: 8px;
      transition: all 0.2s;
    }
    .lbv-member-item:hover {
      background: #e9ecef;
    }
    .lbv-member-item:last-child {
      margin-bottom: 0;
    }
    .lbv-member-item i {
      font-size: 20px;
      color: #6c757d;
    }
    .lbv-member-name {
      flex: 1;
      font-weight: 500;
      color: #333;
    }
    .lbv-member-role {
      background: #e7f1ff;
      color: #0d6efd;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }

    /* No Data */
    .lbv-no-data {
      color: #adb5bd;
      font-style: italic;
      margin: 0;
      padding: 10px 0;
    }

    /* Note Box */
    .lbv-note {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px 20px;
      background: #fff3cd;
      border: 1px solid #ffe69c;
      border-radius: 10px;
      margin-top: 24px;
    }
    .lbv-note i {
      font-size: 20px;
      color: #ffc107;
      margin-top: 2px;
    }
    .lbv-note div {
      flex: 1;
      color: #664d03;
      margin: 0;
    }
  `]
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { ApiResponse, DeTaiResponse, BaoCaoResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-de-tai-bo-mon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-primary-subtle">
          <span class="material-symbols-outlined">menu_book</span>
        </div>
        <div>
          <h2>Danh sách đề tài</h2>
          <p class="mb-0">Theo dõi và quản lý đề tài theo trạng thái</p>
        </div>
      </div>
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-4">
      <li class="nav-item">
        <a class="nav-link" [class.active]="activeTab === 'dang-thuc-hien'" (click)="switchTab('dang-thuc-hien')">
          <span class="material-symbols-outlined me-1">play_circle</span>Đang thực hiện ({{ deTaiDangThucHien.length }})
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" [class.active]="activeTab === 'hoan-thanh'" (click)="switchTab('hoan-thanh')">
          <span class="material-symbols-outlined me-1">check_circle</span>Hoàn thành ({{ deTaiHoanThanh.length }})
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" [class.active]="activeTab === 'khong-dat'" (click)="switchTab('khong-dat')">
          <span class="material-symbols-outlined me-1">cancel</span>Không đạt ({{ deTaiKhongDat.length }})
        </a>
      </li>
    </ul>

    <!-- Đang thực hiện -->
    <div *ngIf="activeTab === 'dang-thuc-hien'" class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th style="width: 140px">Đợt</th>
                <th style="width: 120px">Trạng thái</th>
                <th style="width: 100px" class="text-center">Báo cáo</th>
                <th style="width: 100px" class="text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of deTaiDangThucHien; let i = index" class="align-middle">
                <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong><br>
                  <small class="text-secondary"><code>{{ dt.maSinhVien }}</code></small>
                </td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 250px">{{ dt.tenDeTai }}</span>
                </td>
                <td>{{ dt.tenDotDangKy }}</td>
                <td>
                  <span [class]="getStatusClass(dt.trangThai)" class="badge">
                    {{ getStatusText(dt.trangThai) }}
                  </span>
                </td>
                <td class="text-center">
                  <button *ngIf="dt.coBaoCao" class="btn btn-sm btn-success btn-icon" (click)="openBaoCao(dt.id)" title="Xem báo cáo">
                    <i class="bi bi-file-earmark-text"></i>
                  </button>
                  <span *ngIf="!dt.coBaoCao" class="badge badge-secondary">
                    <i class="bi bi-hourglass-split"></i>
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary btn-icon" (click)="openChiTiet(dt)" title="Xem chi tiết">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>
              <tr *ngIf="deTaiDangThucHien.length === 0">
                <td colspan="7" class="text-center py-5">
                  <div class="empty-state">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    <p class="mb-1 fw-semibold">Không có đề tài nào</p>
                    <small class="text-muted">Đang thực hiện</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Hoàn thành -->
    <div *ngIf="activeTab === 'hoan-thanh'" class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th style="width: 140px">Đợt</th>
                <th style="width: 120px">Trạng thái</th>
                <th style="width: 100px" class="text-center">Báo cáo</th>
                <th style="width: 100px" class="text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of deTaiHoanThanh; let i = index" class="align-middle">
                <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong><br>
                  <small class="text-secondary"><code>{{ dt.maSinhVien }}</code></small>
                </td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 250px">{{ dt.tenDeTai }}</span>
                </td>
                <td>{{ dt.tenDotDangKy }}</td>
                <td><span class="badge badge-success"><span class="material-symbols-outlined me-1">check_circle</span>Hoàn thành</span></td>
                <td class="text-center">
                  <button *ngIf="dt.coBaoCao" class="btn btn-sm btn-success btn-icon" (click)="openBaoCao(dt.id)" title="Xem báo cáo">
                    <i class="bi bi-file-earmark-text"></i>
                  </button>
                  <span *ngIf="!dt.coBaoCao" class="badge badge-secondary">
                    <i class="bi bi-hourglass-split"></i>
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-success btn-icon" (click)="openChiTiet(dt)" title="Xem chi tiết">
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="deTaiHoanThanh.length === 0">
                <td colspan="7" class="text-center py-5">
                  <div class="empty-state">
                    <i class="bi bi-inbox fs-1 d-block mb-3"></i>
                    <p class="mb-1 fw-semibold">Không có đề tài nào</p>
                    <small class="text-muted">Hoàn thành</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Không đạt -->
    <div *ngIf="activeTab === 'khong-dat'" class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th style="width: 140px">Đợt</th>
                <th style="width: 140px">Trạng thái</th>
                <th style="width: 100px" class="text-center">Báo cáo</th>
                <th style="width: 100px" class="text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of deTaiKhongDat; let i = index" class="align-middle">
                <td class="text-center"><span class="stt-badge">{{ i + 1 }}</span></td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong><br>
                  <small class="text-secondary"><code>{{ dt.maSinhVien }}</code></small>
                </td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 250px">{{ dt.tenDeTai }}</span>
                </td>
                <td>{{ dt.tenDotDangKy }}</td>
                <td>
                  <span [class]="getStatusClass(dt.trangThai)" class="badge">
                    {{ getStatusText(dt.trangThai) }}
                  </span>
                </td>
                <td class="text-center">
                  <button *ngIf="dt.coBaoCao" class="btn btn-sm btn-success btn-icon" (click)="openBaoCao(dt.id)" title="Xem báo cáo">
                    <i class="bi bi-file-earmark-text"></i>
                  </button>
                  <span *ngIf="!dt.coBaoCao" class="badge badge-secondary">
                    <i class="bi bi-hourglass-split"></i>
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-danger btn-icon" (click)="openChiTiet(dt)" title="Xem chi tiết">
                    <i class="bi bi-eye"></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="deTaiKhongDat.length === 0">
                <td colspan="7" class="text-center py-5">
                  <div class="empty-state">
                    <span class="material-symbols-outlined check_circle text-success fs-1 d-block mb-3"></span>
                    <p class="mb-1 fw-semibold">Không có sinh viên nào không đạt</p>
                    <small class="text-muted">Tất cả đều đạt yêu cầu</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết đề tài -->
    <div class="modal fade" id="chiTietModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" *ngIf="chiTietDeTai">
          <div class="modal-header">
            <h5 class="modal-title"><i class="bi bi-info-circle me-2"></i>Chi tiết đề tài</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-12">
                <div class="info-group">
                  <label class="info-label">Tên đề tài</label>
                  <p class="info-title">{{ chiTietDeTai.tenDeTai }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Sinh viên</label>
                  <p class="info-value">{{ chiTietDeTai.hoTenSinhVien }}</p>
                  <small class="text-muted"><code>{{ chiTietDeTai.maSinhVien }}</code></small>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Trạng thái</label>
                  <p class="info-value">
                    <span [class]="getStatusClass(chiTietDeTai.trangThai)" class="badge">
                      {{ getStatusText(chiTietDeTai.trangThai) }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="col-12">
                <div class="info-group">
                  <label class="info-label">Nội dung đề tài</label>
                  <p class="info-value" style="white-space: pre-line;">{{ chiTietDeTai.noiDungDuKien || 'Chưa có nội dung' }}</p>
                </div>
              </div>
              <div class="col-12">
                <div class="info-group mb-0">
                  <label class="info-label">Công nghệ sử dụng</label>
                  <p class="info-value">{{ chiTietDeTai.congNgheSuDung || 'Chưa có thông tin' }}</p>
                </div>
              </div>
            </div>
            <hr>
            <h6 class="mb-3"><i class="bi bi-people me-2"></i>Giảng viên &amp; Điểm</h6>
            <div class="row g-3">
              <div class="col-md-4">
                <div class="info-card border-start border-4 border-primary">
                  <h6 class="text-primary mb-2"><i class="bi bi-person-check me-2"></i>GV Hướng dẫn</h6>
                  <p class="mb-1">{{ chiTietDeTai.hoTenGiangVienHuongDan || 'Chưa phân công' }}</p>
                  <span class="badge" [class]="chiTietDeTai.diemHuongDan != null ? 'badge-primary' : 'badge-secondary'">
                    {{ chiTietDeTai.diemHuongDan != null ? 'Điểm: ' + chiTietDeTai.diemHuongDan + '/10' : 'Chưa chấm' }}
                  </span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-card border-start border-4 border-warning">
                  <h6 class="text-warning mb-2"><i class="bi bi-person-dash me-2"></i>GV Phản biện</h6>
                  <p class="mb-1">{{ chiTietDeTai.hoTenGiangVienPhanBien || 'Chưa phân công' }}</p>
                  <span class="badge" [class]="chiTietDeTai.diemPhanBien != null ? 'badge-warning text-dark' : 'badge-secondary'">
                    {{ chiTietDeTai.diemPhanBien != null ? 'Điểm: ' + chiTietDeTai.diemPhanBien + '/10' : 'Chưa chấm' }}
                  </span>
                </div>
              </div>
              <div class="col-md-4">
                <div class="info-card border-start border-4 border-success">
                  <h6 class="text-success mb-2"><i class="bi bi-shield-check me-2"></i>GV Hội đồng</h6>
                  <ul class="list-unstyled mb-0" *ngIf="chiTietDeTai.thanhVienHoiDongList?.length">
                    <li *ngFor="let tv of chiTietDeTai.thanhVienHoiDongList" class="mb-1">
                      <i class="bi bi-person-fill me-1 text-muted"></i>{{ tv.hoTen }}
                      <span class="badge badge-success ms-1" style="font-size: 0.65rem;">{{ tv.vaiTro }}</span>
                      <span *ngIf="tv.diem != null" class="badge badge-warning text-dark ms-1" style="font-size: 0.65rem;">{{ tv.diem }}/10</span>
                    </li>
                  </ul>
                  <p class="text-muted mb-0" *ngIf="!chiTietDeTai.thanhVienHoiDongList?.length">Chưa có hội đồng</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết Báo cáo -->
    <div class="modal fade" id="baoCaoModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content" *ngIf="chiTietBaoCao">
          <div class="modal-header bg-success text-white">
            <h5 class="modal-title"><i class="bi bi-file-earmark-text me-2"></i>Báo cáo đề tài</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-12">
                <div class="info-group">
                  <label class="info-label">Tên đề tài</label>
                  <p class="info-title">{{ chiTietBaoCao.tenDeTai }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Sinh viên</label>
                  <p class="info-value">{{ chiTietBaoCao.hoTenSinhVien }}</p>
                  <small class="text-muted"><code>{{ chiTietBaoCao.maSinhVien }}</code></small>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group mb-0">
                  <label class="info-label">Ngày nộp</label>
                  <p class="info-value">{{ chiTietBaoCao.ngayNop | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>
            </div>
            <hr>
            <div class="text-center">
              <div class="mb-3">
                <i class="bi bi-file-earmark-text" style="font-size: 4rem; color: var(--danger);"></i>
              </div>
              <button *ngIf="chiTietBaoCao.fileBaoCao" class="btn btn-success" (click)="downloadFile(chiTietBaoCao.fileBaoCao)">
                <i class="bi bi-download me-2"></i>Tải xuống báo cáo
              </button>
              <p *ngIf="!chiTietBaoCao.fileBaoCao" class="text-muted mb-0">Chưa có file</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Đóng</button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DeTaiBoMonComponent implements OnInit {
  activeTab: string = 'dang-thuc-hien';
  deTaiDangThucHien: DeTaiResponse[] = [];
  deTaiHoanThanh: DeTaiResponse[] = [];
  deTaiKhongDat: DeTaiResponse[] = [];
  chiTietDeTai: DeTaiResponse | null = null;
  chiTietBaoCao: BaoCaoResponse | null = null;

  constructor(
    private boMonService: BoMonService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDeTai();
  }

  switchTab(tab: string): void {
    this.activeTab = tab;
  }

  loadDeTai(): void {
    // Load đề tài đang thực hiện
    this.boMonService.getDeTai('CHO_GV_DUYET').subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiDangThucHien = [...res.data];
        }
      }
    });
    this.boMonService.getDeTai('DANG_THUC_HIEN').subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiDangThucHien = [...this.deTaiDangThucHien, ...res.data];
        }
      }
    });
    this.boMonService.getDeTai('DA_NOP_BAO_CAO').subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiDangThucHien = [...this.deTaiDangThucHien, ...res.data];
        }
      }
    });
    this.boMonService.getDeTai('DAT_GVHD').subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiDangThucHien = [...this.deTaiDangThucHien, ...res.data];
        }
      }
    });
    this.boMonService.getDeTai('CHO_PHAN_BIEN').subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiDangThucHien = [...this.deTaiDangThucHien, ...res.data];
        }
      }
    });
    this.boMonService.getDeTai('DAT_PHAN_BIEN').subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiDangThucHien = [...this.deTaiDangThucHien, ...res.data];
        }
      }
    });
    this.boMonService.getDeTai('DANG_BAO_VE').subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiDangThucHien = [...this.deTaiDangThucHien, ...res.data];
        }
      }
    });

    // Load đề tài hoàn thành (HOAN_THANH)
    this.boMonService.getDeTaiHoanThanh().subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiHoanThanh = res.data;
        }
      }
    });

    // Không đạt ở bất kỳ giai đoạn: hướng dẫn / phản biện / bảo vệ (KHONG_DAT)
    const emptyOk = (): ApiResponse<DeTaiResponse[]> => ({
      success: true,
      message: '',
      data: []
    });
    const safe = (obs: ReturnType<BoMonService['getDeTai']>) =>
      obs.pipe(catchError(() => of(emptyOk())));

    forkJoin({
      gvhd: safe(this.boMonService.getDeTai('KHONG_DAT_GVHD')),
      phanBien: safe(this.boMonService.getDeTai('KHONG_DAT_PHAN_BIEN')),
      baoVe: safe(this.boMonService.getDeTai('KHONG_DAT_BAO_VE'))
    }).subscribe({
      next: ({ gvhd, phanBien, baoVe }) => {
        const merged: DeTaiResponse[] = [];
        if (gvhd.success) merged.push(...(gvhd.data ?? []));
        if (phanBien.success) merged.push(...(phanBien.data ?? []));
        if (baoVe.success) merged.push(...(baoVe.data ?? []));
        this.deTaiKhongDat = merged;
      },
      error: () => this.toastr.error('Không tải được danh sách không đạt')
    });
  }

  /** Điểm hiển thị theo giai đoạn: bảo vệ trước, hoặc phản biện, hoặc hướng dẫn */
  diemHienThiKhongDat(dt: DeTaiResponse): string | number {
    if (dt.diemBaoVe != null) return dt.diemBaoVe;
    if (dt.diemPhanBien != null) return dt.diemPhanBien;
    if (dt.diemHuongDan != null) return dt.diemHuongDan;
    return '-';
  }

  getStatusClass(status: string): string {
    const map: any = {
      'DANG_THUC_HIEN': 'bg-info',
      'DA_NOP_BAO_CAO': 'bg-primary',
      'DAT_GVHD': 'bg-success',
      'KHONG_DAT_GVHD': 'bg-danger',
      'CHO_PHAN_BIEN': 'bg-warning',
      'DAT_PHAN_BIEN': 'bg-success',
      'KHONG_DAT_PHAN_BIEN': 'bg-danger',
      'DANG_BAO_VE': 'bg-primary',
      'HOAN_THANH': 'bg-success',
      'KHONG_DAT_BAO_VE': 'bg-danger'
    };
    return map[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const map: any = {
      'DANG_THUC_HIEN': 'Đang thực hiện',
      'DA_NOP_BAO_CAO': 'Đã nộp báo cáo',
      'DAT_GVHD': 'Đạt GVHD',
      'KHONG_DAT_GVHD': 'Không đạt GVHD',
      'CHO_PHAN_BIEN': 'Chờ phản biện',
      'DAT_PHAN_BIEN': 'Đạt phản biện',
      'KHONG_DAT_PHAN_BIEN': 'Không đạt phản biện',
      'DANG_BAO_VE': 'Đang bảo vệ',
      'HOAN_THANH': 'Hoàn thành',
      'KHONG_DAT_BAO_VE': 'Không đạt bảo vệ'
    };
    return map[status] || status;
  }

  /** Mở modal chi tiết đề tài */
  openChiTiet(dt: DeTaiResponse): void {
    this.chiTietDeTai = dt;
    const modalEl = document.getElementById('chiTietModal');
    if (modalEl) {
      const bsModal = (window as any).bootstrap?.Modal.getOrCreateInstance(modalEl);
      bsModal?.show();
    }
  }

  /** Mở modal xem báo cáo */
  openBaoCao(deTaiId: number): void {
    this.boMonService.getBaoCaoByDeTaiId(deTaiId).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.chiTietBaoCao = res.data;
          const modalEl = document.getElementById('baoCaoModal');
          if (modalEl) {
            const bsModal = (window as any).bootstrap?.Modal.getOrCreateInstance(modalEl);
            bsModal?.show();
          }
        } else {
          this.toastr.warning('Chưa có báo cáo cho đề tài này');
        }
      },
      error: (err) => {
        console.error('Lỗi load báo cáo:', err);
        this.toastr.error('Không thể tải báo cáo');
      }
    });
  }

  /** Tải file báo cáo */
  downloadFile(filePath: string): void {
    if (!filePath) {
      this.toastr.warning('Không có file để tải');
      return;
    }

    const token = localStorage.getItem('token');
    const url = `http://localhost:8080/api/files/download?path=${encodeURIComponent(filePath)}`;

    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Access Denied');
      }
      return response.blob();
    })
    .then(blob => {
      const fileName = this.getFileNameFromPath(filePath);
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(downloadUrl);
    })
    .catch(error => {
      console.error('Download error:', error);
      this.toastr.error('Không thể tải file. Vui lòng đăng nhập lại.');
    });
  }

  private getFileNameFromPath(filePath: string): string {
    if (!filePath) return 'file';
    const parts = filePath.split(/[/\\]/);
    const fileName = parts[parts.length - 1];
    return fileName || 'file';
  }
}

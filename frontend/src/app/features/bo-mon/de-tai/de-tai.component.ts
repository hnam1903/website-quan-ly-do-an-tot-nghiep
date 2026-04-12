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
      <h2>Danh sách đề tài</h2>
  
    </div>

    <!-- Tab Navigation -->
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item">
        <a class="nav-link" [class.active]="activeTab === 'dang-thuc-hien'" (click)="switchTab('dang-thuc-hien')">
          <i class="bi bi-play-circle me-1"></i>Đang thực hiện ({{ deTaiDangThucHien.length }})
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" [class.active]="activeTab === 'hoan-thanh'" (click)="switchTab('hoan-thanh')">
          <i class="bi bi-check-circle me-1"></i>Hoàn thành ({{ deTaiHoanThanh.length }})
        </a>
      </li>
      <li class="nav-item">
        <a class="nav-link" [class.active]="activeTab === 'khong-dat'" (click)="switchTab('khong-dat')">
          <i class="bi bi-x-circle me-1"></i>Không đạt ({{ deTaiKhongDat.length }})
        </a>
      </li>
    </ul>

    <!-- Đang thực hiện -->
    <div *ngIf="activeTab === 'dang-thuc-hien'" class="card">
      <div class="card-header bg-primary text-white">
        <i class="bi bi-play-circle me-2"></i>Đề tài đang thực hiện
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th>Trạng thái</th>
                <th>Báo cáo</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of deTaiDangThucHien; let i = index">
                <td>{{ i + 1 }}</td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong><br>
                  <small class="text-muted">{{ dt.maSinhVien }}</small>
                </td>
                <td>{{ dt.tenDeTai }}</td>
                <td>
                  <span [class]="getStatusClass(dt.trangThai)" class="badge">
                    {{ getStatusText(dt.trangThai) }}
                  </span>
                </td>
                <td>
                  <button *ngIf="dt.coBaoCao" class="btn btn-sm btn-success" (click)="openBaoCao(dt.id)">
                    <i class="bi bi-file-earmark-text"></i> Xem
                  </button>
                  <span *ngIf="!dt.coBaoCao" class="badge bg-secondary">
                    <i class="bi bi-hourglass-split"></i> Chưa nộp
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary" (click)="openChiTiet(dt)">
                    <i class="bi bi-eye"></i> Xem
                  </button>
                </td>
              </tr>
              <tr *ngIf="deTaiDangThucHien.length === 0">
                <td colspan="6" class="text-center text-muted py-4">Không có đề tài nào</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Hoàn thành -->
    <div *ngIf="activeTab === 'hoan-thanh'" class="card">
      <div class="card-header bg-success text-white">
        <i class="bi bi-check-circle me-2"></i>Đề tài đã hoàn thành
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th>Trạng thái</th>
                <th>Báo cáo</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of deTaiHoanThanh; let i = index">
                <td>{{ i + 1 }}</td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong><br>
                  <small class="text-muted">{{ dt.maSinhVien }}</small>
                </td>
                <td>{{ dt.tenDeTai }}</td>
                <td>
                  <span class="badge bg-success">Hoàn thành</span>
                </td>
                <td>
                  <button *ngIf="dt.coBaoCao" class="btn btn-sm btn-success" (click)="openBaoCao(dt.id)">
                    <i class="bi bi-file-earmark-text"></i> Xem
                  </button>
                  <span *ngIf="!dt.coBaoCao" class="badge bg-secondary">
                    <i class="bi bi-hourglass-split"></i> Chưa nộp
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-success" (click)="openChiTiet(dt)">
                    <i class="bi bi-eye"></i> Xem
                  </button>
                </td>
              </tr>
              <tr *ngIf="deTaiHoanThanh.length === 0">
                <td colspan="6" class="text-center text-muted py-4">Không có đề tài nào</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Không đạt -->
    <div *ngIf="activeTab === 'khong-dat'" class="card">
      <div class="card-header bg-danger text-white">
        <i class="bi bi-x-circle me-2"></i>Sinh viên không đạt
      </div>
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sinh viên</th>
                <th>Tên đề tài</th>
                <th>Trạng thái</th>
                <th>Báo cáo</th>
                <th>Chi tiết</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dt of deTaiKhongDat; let i = index">
                <td>{{ i + 1 }}</td>
                <td>
                  <strong>{{ dt.hoTenSinhVien }}</strong><br>
                  <small class="text-muted">{{ dt.maSinhVien }}</small>
                </td>
                <td>{{ dt.tenDeTai }}</td>
                <td>
                  <span [class]="getStatusClass(dt.trangThai)" class="badge">
                    {{ getStatusText(dt.trangThai) }}
                  </span>
                </td>
                <td>
                  <button *ngIf="dt.coBaoCao" class="btn btn-sm btn-success" (click)="openBaoCao(dt.id)">
                    <i class="bi bi-file-earmark-text"></i> Xem
                  </button>
                  <span *ngIf="!dt.coBaoCao" class="badge bg-secondary">
                    <i class="bi bi-hourglass-split"></i> Chưa nộp
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-danger" (click)="openChiTiet(dt)">
                    <i class="bi bi-eye"></i> Xem
                  </button>
                </td>
              </tr>
              <tr *ngIf="deTaiKhongDat.length === 0">
                <td colspan="6" class="text-center text-muted py-4">Không có sinh viên nào không đạt</td>
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
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title">
              <i class="bi bi-info-circle me-2"></i>Chi tiết đề tài
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-12">
                <label class="fw-bold text-primary">Tên đề tài</label>
                <p class="mb-2">{{ chiTietDeTai.tenDeTai }}</p>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label class="fw-bold text-primary">Sinh viên</label>
                <p class="mb-1">{{ chiTietDeTai.hoTenSinhVien }}</p>
                <small class="text-muted">{{ chiTietDeTai.maSinhVien }}</small>
              </div>
              <div class="col-md-6">
                <label class="fw-bold text-primary">Trạng thái</label>
                <p class="mb-0">
                  <span [class]="getStatusClass(chiTietDeTai.trangThai)" class="badge">
                    {{ getStatusText(chiTietDeTai.trangThai) }}
                  </span>
                </p>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-12">
                <label class="fw-bold text-primary">Nội dung đề tài</label>
                <p class="mb-0" style="white-space: pre-line;">{{ chiTietDeTai.noiDungDuKien || 'Chưa có nội dung' }}</p>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-12">
                <label class="fw-bold text-primary">Công nghệ sử dụng</label>
                <p class="mb-0">{{ chiTietDeTai.congNgheSuDung || 'Chưa có thông tin' }}</p>
              </div>
            </div>

            <hr>
            <h6 class="text-primary mb-3"><i class="bi bi-people me-1"></i>Giảng viên &amp; Điểm</h6>

            <div class="row">
              <!-- GV Hướng dẫn -->
              <div class="col-md-4 mb-3">
                <div class="card h-100 border-start border-4 border-primary">
                  <div class="card-body">
                    <h6 class="card-title text-primary">
                      <i class="bi bi-person-check me-1"></i>GV Hướng dẫn
                    </h6>
                    <p class="card-text mb-1">{{ chiTietDeTai.hoTenGiangVienHuongDan || 'Chưa phân công' }}</p>
                    <div class="mt-2">
                      <span class="fw-bold">Điểm:</span>
                      <span *ngIf="chiTietDeTai.diemHuongDan != null" class="badge bg-primary ms-1">
                        {{ chiTietDeTai.diemHuongDan }}/10
                      </span>
                      <span *ngIf="chiTietDeTai.diemHuongDan == null" class="badge bg-secondary ms-1">
                        Chưa chấm
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- GV Phản biện -->
              <div class="col-md-4 mb-3">
                <div class="card h-100 border-start border-4 border-warning">
                  <div class="card-body">
                    <h6 class="card-title text-warning">
                      <i class="bi bi-person-dash me-1"></i>GV Phản biện
                    </h6>
                    <p class="card-text mb-1">{{ chiTietDeTai.hoTenGiangVienPhanBien || 'Chưa phân công' }}</p>
                    <div class="mt-2">
                      <span class="fw-bold">Điểm:</span>
                      <span *ngIf="chiTietDeTai.diemPhanBien != null" class="badge bg-warning text-dark ms-1">
                        {{ chiTietDeTai.diemPhanBien }}/10
                      </span>
                      <span *ngIf="chiTietDeTai.diemPhanBien == null" class="badge bg-secondary ms-1">
                        Chưa chấm
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- GV Hội đồng bảo vệ -->
              <div class="col-md-4 mb-3">
                <div class="card h-100 border-start border-4 border-success">
                  <div class="card-body">
                    <h6 class="card-title text-success">
                      <i class="bi bi-shield-check me-1"></i>GV Hội đồng
                    </h6>
                    <ul class="list-unstyled mb-1" *ngIf="chiTietDeTai.thanhVienHoiDongList?.length">
                      <li *ngFor="let tv of chiTietDeTai.thanhVienHoiDongList" class="mb-1">
                        <i class="bi bi-person-fill me-1"></i>{{ tv.hoTen }}
                        <span class="badge bg-success ms-1" style="font-size: 0.7rem;">{{ tv.vaiTro }}</span>
                        <span *ngIf="tv.diem != null" class="badge bg-warning text-dark ms-1" style="font-size: 0.65rem;">
                          {{ tv.diem }}/10
                        </span>
                      </li>
                    </ul>
                    <p class="card-text text-muted" *ngIf="!chiTietDeTai.thanhVienHoiDongList?.length">
                      Chưa có hội đồng
                    </p>
                    <div class="mt-2">
                      <span class="fw-bold">TB:</span>
                      <span *ngIf="chiTietDeTai.diemBaoVe != null" class="badge bg-success ms-1">
                        {{ chiTietDeTai.diemBaoVe }}/10
                      </span>
                      <span *ngIf="chiTietDeTai.diemBaoVe == null" class="badge bg-secondary ms-1">
                        Chưa chấm
                      </span>
                    </div>
                  </div>
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
            <h5 class="modal-title">
              <i class="bi bi-file-earmark-text me-2"></i>Báo cáo đề tài
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row mb-3">
              <div class="col-md-12">
                <label class="fw-bold text-primary">Tên đề tài</label>
                <p class="mb-2">{{ chiTietBaoCao.tenDeTai }}</p>
              </div>
            </div>

            <div class="row mb-3">
              <div class="col-md-6">
                <label class="fw-bold text-primary">Sinh viên</label>
                <p class="mb-1">{{ chiTietBaoCao.hoTenSinhVien }}</p>
                <small class="text-muted">{{ chiTietBaoCao.maSinhVien }}</small>
              </div>
              <div class="col-md-6">
                <label class="fw-bold text-primary">Ngày nộp</label>
                <p class="mb-0">{{ chiTietBaoCao.ngayNop | date:'dd/MM/yyyy HH:mm' }}</p>
              </div>
            </div>

            <hr>

            <div class="row">
              <!-- File Báo cáo -->
              <div class="col-md-6 mb-3">
                <div class="card h-100 border-start border-4 border-primary">
                  <div class="card-body text-center">
                    <h6 class="card-title text-primary">
                      <i class="bi bi-file-earmark-pdf me-1"></i>Báo cáo
                    </h6>
                    <div class="mb-3">
                      <i class="bi bi-file-earmark-text" style="font-size: 3rem; color: #dc3545;"></i>
                    </div>
                    <button *ngIf="chiTietBaoCao.fileBaoCao" 
                            class="btn btn-primary" 
                            (click)="downloadFile(chiTietBaoCao.fileBaoCao)">
                      <i class="bi bi-download me-1"></i>Tải xuống
                    </button>
                    <p *ngIf="!chiTietBaoCao.fileBaoCao" class="text-muted mb-0">Chưa có file</p>
                  </div>
                </div>
              </div>

              <!-- File Source Code -->
              <div class="col-md-6 mb-3">
                <div class="card h-100 border-start border-4 border-warning">
                  <div class="card-body text-center">
                    <h6 class="card-title text-warning">
                      <i class="bi bi-code-slash me-1"></i>Source Code
                    </h6>
                    <div class="mb-3">
                      <i class="bi bi-folder2-open" style="font-size: 3rem; color: #ffc107;"></i>
                    </div>
                    <button *ngIf="chiTietBaoCao.fileSourceCode" 
                            class="btn btn-warning" 
                            (click)="downloadFile(chiTietBaoCao.fileSourceCode)">
                      <i class="bi bi-download me-1"></i>Tải xuống
                    </button>
                    <p *ngIf="!chiTietBaoCao.fileSourceCode" class="text-muted mb-0">Chưa có file</p>
                  </div>
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
    this.boMonService.getDeTai('CHO_GV_PB_DUYET').subscribe({
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
    this.boMonService.getDeTai('CHO_HOI_DONG').subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiDangThucHien = [...this.deTaiDangThucHien, ...res.data];
        }
      }
    });
    this.boMonService.getDeTai('DA_GAP_HOI_DONG').subscribe({
      next: (res) => {
        if (res.success) {
          this.deTaiDangThucHien = [...this.deTaiDangThucHien, ...res.data];
        }
      }
    });

    // Load đề tài hoàn thành (HOAN_THANH)
    this.boMonService.getDeTai('HOAN_THANH').subscribe({
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
      baoVe: safe(this.boMonService.getDeTai('KHONG_DAT'))
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
      'CHO_GV_DUYET': 'bg-warning',
      'DANG_THUC_HIEN': 'bg-info',
      'DA_NOP_BAO_CAO': 'bg-primary',
      'DAT_GVHD': 'bg-success',
      'KHONG_DAT_GVHD': 'bg-danger',
      'CHO_PHAN_BIEN': 'bg-secondary',
      'CHO_GV_PB_DUYET': 'bg-warning',
      'DAT_PHAN_BIEN': 'bg-success',
      'KHONG_DAT_PHAN_BIEN': 'bg-danger',
      'CHO_HOI_DONG': 'bg-secondary',
      'DA_GAP_HOI_DONG': 'bg-primary',
      'KHONG_DAT': 'bg-danger'
    };
    return map[status] || 'bg-secondary';
  }

  getStatusText(status: string): string {
    const map: any = {
      'CHO_GV_DUYET': 'Chờ GV duyệt',
      'DANG_THUC_HIEN': 'Đang thực hiện',
      'DA_NOP_BAO_CAO': 'Đã nộp báo cáo',
      'DAT_GVHD': 'Đạt GVHD',
      'KHONG_DAT_GVHD': 'Không đạt GVHD',
      'CHO_PHAN_BIEN': 'Chờ phản biện',
      'CHO_GV_PB_DUYET': 'Chờ GV PB duyệt',
      'DAT_PHAN_BIEN': 'Đạt phản biện',
      'KHONG_DAT_PHAN_BIEN': 'Không đạt phản biện',
      'CHO_HOI_DONG': 'Chờ hội đồng',
      'DA_GAP_HOI_DONG': 'Đã gặp hội đồng',
      'KHONG_DAT': 'Không đạt bảo vệ'
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

  /** Tải file báo cáo/source code */
  downloadFile(filePath: string): void {
    if (!filePath) {
      this.toastr.warning('Không có file để tải');
      return;
    }
    const encodedPath = encodeURIComponent(filePath);
    window.open(`http://localhost:8080/api/files/download?path=${encodedPath}`, '_blank');
  }
}

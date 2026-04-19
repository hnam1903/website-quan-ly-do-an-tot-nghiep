import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { DotBaoCaoTienDoResponse, BaoCaoTienDoResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

interface SinhVienBaoCao {
  sinhVien: any;
  dots: {
    dot: DotBaoCaoTienDoResponse;
    baoCao?: BaoCaoTienDoResponse;
  }[];
  expanded: boolean;
}

@Component({
  selector: 'app-bao-cao-tien-do',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- TRANG TẠO ĐỢT BÁO CÁO -->
    <div *ngIf="isTaoDot" class="page-header">
      <h2>Tạo đợt báo cáo tiến độ</h2>
    </div>

    <div *ngIf="isTaoDot" class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="fas fa-list me-2"></i>Danh sách đợt báo cáo</h5>
        <button class="btn btn-sm btn-primary" (click)="hienThiTaoDot()">
          <i class="fas fa-plus me-1"></i> Tạo đợt mới
        </button>
      </div>
      <div class="card-body">
        <div *ngIf="dots.length === 0 && !isLoading" class="alert alert-info mb-0">
          <i class="fas fa-info-circle me-2"></i>Chưa có đợt báo cáo nào.
        </div>
        <div *ngIf="isLoading" class="text-center py-3">
          <i class="fas fa-spinner fa-spin"></i> Đang tải...
        </div>
        <div class="table-responsive" *ngIf="dots.length > 0">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th width="5%" class="text-center">STT</th>
                <th width="30%">Tên đợt</th>
                <th width="20%">Ngày bắt đầu</th>
                <th width="20%">Hạn nộp</th>
                <th width="15%">Trạng thái</th>
                <th width="10%" class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let dot of dots; let i = index">
                <td class="text-center">{{ i + 1 }}</td>
                <td><strong>{{ dot.tenDot }}</strong></td>
                <td>{{ dot.ngayBatDau | date:'dd/MM/yyyy HH:mm' }}</td>
                <td [class.text-danger]="isQuaHan(dot)">
                  <i class="fas fa-clock me-1"></i>{{ dot.ngayKetThuc | date:'dd/MM/yyyy HH:mm' }}
                </td>
                <td>
                  <span [class]="isDong(dot) ? 'badge bg-secondary' : 'badge bg-success'">
                    {{ isDong(dot) ? 'Đã đóng' : 'Đang mở' }}
                  </span>
                </td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn" 
                            [class.btn-success]="!isDong(dot)"
                            [class.btn-warning]="isDong(dot)"
                            (click)="dongMoDot(dot)">
                      <i class="fas" [class.fa-lock-open]="!isDong(dot)" 
                         [class.fa-lock]="isDong(dot)"></i>
                      {{ isDong(dot) ? 'Mở' : 'Đóng' }}
                    </button>
                    <button class="btn btn-danger" (click)="xoaDot(dot)">
                      <i class="fas fa-trash"></i> Xóa
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- TRANG DUYỆT BÁO CÁO SINH VIÊN -->
    <div *ngIf="!isTaoDot" class="page-header">
      <h2>Duyệt báo cáo tiến độ</h2>
    </div>

    <div *ngIf="!isTaoDot" class="card">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h5 class="mb-0"><i class="fas fa-users me-2"></i>Sinh viên hướng dẫn</h5>
        <button class="btn btn-sm btn-outline-primary" (click)="loadData()">
          <i class="fas fa-sync-alt"></i> Làm mới
        </button>
      </div>
      <div class="card-body">
        <div *ngIf="sinhVienBaoCaos.length === 0 && !isLoading" class="alert alert-info">
          <i class="fas fa-info-circle me-2"></i>Bạn chưa hướng dẫn sinh viên nào hoặc chưa có đợt báo cáo nào.
        </div>

        <div *ngIf="isLoading" class="text-center py-4">
          <i class="fas fa-spinner fa-spin fa-2x"></i>
          <p class="mt-2">Đang tải dữ liệu...</p>
        </div>

        <!-- Accordion theo sinh viên -->
        <div class="accordion" id="sinhVienAccordion">
          <div class="accordion-item" *ngFor="let item of sinhVienBaoCaos; let i = index">
            <h2 class="accordion-header">
              <button class="accordion-button" [class.collapsed]="!item.expanded" 
                      type="button" (click)="toggleSinhVien(i)">
                <div class="d-flex w-100 justify-content-between align-items-center pe-3">
                  <div>
                    <strong>{{ item.sinhVien.hoTen }}</strong>
                    <span class="text-muted ms-2">({{ item.sinhVien.maSinhVien }})</span>
                    <span class="text-muted ms-2">- Lớp: {{ item.sinhVien.lop }}</span>
                    <br><small class="text-primary">{{ item.sinhVien.tenDeTai }}</small>
                    <span class="badge bg-primary ms-2">{{ item.dots.length }} đợt</span>
                  </div>
                  <div class="text-end">
                    <span class="badge" [class.bg-success]="getTongDaNop(item) === item.dots.length" 
                          [class.bg-warning]="getTongDaNop(item) < item.dots.length && getTongDaNop(item) > 0"
                          [class.bg-secondary]="getTongDaNop(item) === 0">
                      {{ getTongDaNop(item) }}/{{ item.dots.length }} đã nộp
                    </span>
                  </div>
                </div>
              </button>
            </h2>
            <div class="accordion-collapse collapse" [class.show]="item.expanded">
              <div class="accordion-body p-0">
                <table class="table table-hover mb-0">
                  <thead class="table-light">
                    <tr>
                      <th width="5%" class="text-center">STT</th>
                      <th width="20%">Đợt báo cáo</th>
                      <th width="15%">Hạn nộp</th>
                      <th width="15%">Ngày nộp</th>
                      <th width="15%">Trạng thái</th>
                      <th width="30%">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let dot of item.dots; let j = index">
                      <td class="text-center">{{ j + 1 }}</td>
                      <td>
                        <strong>{{ dot.dot.tenDot }}</strong>
                        <br><small class="text-muted">{{ dot.dot.ngayBatDau | date:'dd/MM/yyyy' }}</small>
                      </td>
                      <td>
                        <span [class.text-danger]="isQuaHan(dot.dot)">
                          <i class="fas fa-clock me-1"></i>{{ dot.dot.ngayKetThuc | date:'dd/MM/yyyy HH:mm' }}
                        </span>
                      </td>
                      <td>
                        <span *ngIf="dot.baoCao" class="text-success">
                          <i class="fas fa-check-circle me-1"></i>{{ dot.baoCao.ngayNop | date:'dd/MM/yyyy HH:mm' }}
                        </span>
                        <span *ngIf="!dot.baoCao" class="text-muted">
                          <i class="fas fa-minus-circle me-1"></i>Chưa nộp
                        </span>
                      </td>
                      <td>
                        <span *ngIf="!dot.baoCao" class="badge bg-secondary">Chưa nộp</span>
                        <span *ngIf="dot.baoCao" [class]="getTrangThaiClass(dot.baoCao.trangThai)">
                          {{ getTrangThaiText(dot.baoCao.trangThai) }}
                        </span>
                      </td>
                      <td>
                        <ng-container *ngIf="dot.baoCao">
                          <div class="btn-group btn-group-sm">
                            <button class="btn btn-primary" (click)="xemChiTiet(dot.baoCao)">
                              <i class="fas fa-eye"></i> Chi tiết
                            </button>
                          </div>
                        </ng-container>
                        <span *ngIf="!dot.baoCao" class="text-muted">
                          <i class="fas fa-hourglass-half me-1"></i>Chờ nộp
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
    </div>

    <!-- Modal Tạo đợt báo cáo -->
    <div class="modal fade" id="modalTaoDot" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Tạo đợt báo cáo tiến độ mới</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Tên đợt báo cáo *</label>
              <input type="text" class="form-control" [(ngModel)]="dotMoi.tenDot" placeholder="Nhập tên đợt báo cáo">
            </div>
            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Ngày bắt đầu *</label>
                <input type="datetime-local" class="form-control" [(ngModel)]="dotMoi.ngayBatDau">
              </div>
              <div class="col-md-6 mb-3">
                <label class="form-label">Hạn nộp *</label>
                <input type="datetime-local" class="form-control" [(ngModel)]="dotMoi.ngayKetThuc">
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" (click)="taoDot()" [disabled]="!dotMoi.tenDot || !dotMoi.ngayBatDau || !dotMoi.ngayKetThuc || isSubmitting">
              <span *ngIf="isSubmitting"><i class="fas fa-spinner fa-spin me-1"></i> Đang tạo...</span>
              <span *ngIf="!isSubmitting"><i class="fas fa-plus me-1"></i> Tạo đợt báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Nhận xét -->
    <div class="modal fade" id="modalNhanXet" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nhận xét báo cáo tiến độ</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Sinh viên:</label>
              <p><strong>{{ baoCaoChon?.hoTenSinhVien }}</strong> - {{ baoCaoChon?.maSinhVien }}</p>
            </div>
            <div class="mb-3">
              <label class="form-label">Đề tài:</label>
              <p>{{ baoCaoChon?.tenDeTai }}</p>
            </div>
            <div class="mb-3">
              <label class="form-label">Nội dung SV nộp:</label>
              <p>{{ baoCaoChon?.noiDung || 'Không có' }}</p>
            </div>
            <div class="mb-3">
              <label class="form-label">File báo cáo:</label>
              <a *ngIf="baoCaoChon?.fileBaoCao" [href]="getDownloadUrl(baoCaoChon?.fileBaoCao)" 
                 class="btn btn-sm btn-outline-primary" target="_blank">
                <i class="fas fa-download"></i> Tải file
              </a>
              <span *ngIf="!baoCaoChon?.fileBaoCao" class="text-muted">Không có file</span>
            </div>
            <hr>
            <div class="mb-3">
              <label class="form-label">Nhận xét *</label>
              <textarea class="form-control" [(ngModel)]="nhanXetMoi.nhanXet" rows="4"
                        placeholder="Nhập nhận xét để cập nhật trạng thái báo cáo thành Đã nhận xét..."></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" (click)="luuNhanXet()" [disabled]="!nhanXetMoi.nhanXet">
              <span *ngIf="isSubmittingNhanXet">Đang lưu...</span>
              <span *ngIf="!isSubmittingNhanXet">Lưu nhận xét</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BaoCaoTienDoComponent implements OnInit {
  dots: DotBaoCaoTienDoResponse[] = [];
  sinhVienBaoCaos: SinhVienBaoCao[] = [];
  baoCaoChon: BaoCaoTienDoResponse | null = null;
  isTaoDot = false;
  isLoading = false;

  dotMoi: any = {};
  nhanXetMoi: any = { trangThai: 'DA_NHAN_XET' };
  isSubmitting = false;
  isSubmittingNhanXet = false;

  constructor(
    private gvService: GiangVienService,
    private toastr: ToastrService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.url.subscribe(url => {
      const path = url.length > 0 ? url[0].path : '';
      this.isTaoDot = path === 'tao-dot';
      if (this.isTaoDot) {
        this.loadDots();
      } else {
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.isLoading = true;
    this.loadDots();
    this.loadSinhVienHuongDan();
  }

  loadDots(): void {
    this.gvService.getDotBaoCaoTienDo().subscribe({
      next: (res) => {
        if (res.success) {
          this.dots = res.data || [];
        }
      },
      error: () => {
        this.toastr.error('Lỗi khi tải đợt báo cáo');
      }
    });
  }

  loadSinhVienHuongDan(): void {
    this.gvService.getSinhVienHuongDan().subscribe({
      next: (res) => {
        if (res.success) {
          const sinhViens: any[] = res.data || [];
          this.sinhVienBaoCaos = [];
          
          sinhViens.forEach(sv => {
            const dotData: { dot: DotBaoCaoTienDoResponse; baoCao?: BaoCaoTienDoResponse }[] = [];
            
            this.dots.forEach(dot => {
              dotData.push({ dot: dot });
            });
            
            this.sinhVienBaoCaos.push({
              sinhVien: sv,
              dots: dotData,
              expanded: false
            });
          });
          
          this.loadBaoCaoForSinhVien(0);
        }
        this.isLoading = false;
      },
      error: () => {
        this.toastr.error('Lỗi khi tải danh sách sinh viên');
        this.isLoading = false;
      }
    });
  }

  loadBaoCaoForSinhVien(index: number): void {
    if (index >= this.sinhVienBaoCaos.length) {
      this.isLoading = false;
      return;
    }

    const item = this.sinhVienBaoCaos[index];
    
    this.gvService.getBaoCaoTienDoBySinhVien(item.sinhVien.id).subscribe({
      next: (res) => {
        if (res.success) {
          const baoCaos: BaoCaoTienDoResponse[] = res.data || [];
          
          item.dots.forEach(dotItem => {
            const baoCao = baoCaos.find(bc => bc.dotBaoCaoTienDoId === dotItem.dot.id);
            if (baoCao) {
              dotItem.baoCao = baoCao;
            }
          });
        }
        this.loadBaoCaoForSinhVien(index + 1);
      },
      error: () => {
        this.loadBaoCaoForSinhVien(index + 1);
      }
    });
  }

  hienThiTaoDot(): void {
    this.dotMoi = {};
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalTaoDot'));
    modal.show();
  }

  dongMoDot(dot: DotBaoCaoTienDoResponse): void {
    const trangThaiMoi = (!dot.trangThai || dot.trangThai === 'DONG') ? 'MO' : 'DONG';
    const action = trangThaiMoi === 'MO' ? 'mở' : 'đóng';
    
    if (confirm(`Bạn có chắc muốn ${action} đợt "${dot.tenDot}"?`)) {
      this.gvService.capNhatTrangThaiDot(dot.id, trangThaiMoi).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success(`${action.charAt(0).toUpperCase() + action.slice(1)} đợt báo cáo thành công`);
            this.loadDots();
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.message || `Lỗi khi ${action} đợt báo cáo`);
        }
      });
    }
  }

  xoaDot(dot: DotBaoCaoTienDoResponse): void {
    if (confirm(`Bạn có chắc muốn xóa đợt "${dot.tenDot}"?`)) {
      this.gvService.xoaDotBaoCaoTienDo(dot.id).subscribe({
        next: (res) => {
          if (res.success) {
            this.toastr.success('Xóa đợt báo cáo thành công');
            this.loadDots();
          }
        },
        error: (err) => {
          this.toastr.error(err.error?.message || 'Lỗi khi xóa đợt báo cáo');
        }
      });
    }
  }

  isDong(dot: DotBaoCaoTienDoResponse): boolean {
    return dot.trangThai === 'DONG';
  }

  toggleSinhVien(index: number): void {
    this.sinhVienBaoCaos[index].expanded = !this.sinhVienBaoCaos[index].expanded;
  }

  getTongDaNop(item: SinhVienBaoCao): number {
    return item.dots.filter(d => d.baoCao).length;
  }

  isQuaHan(dot: DotBaoCaoTienDoResponse): boolean {
    return new Date(dot.ngayKetThuc) < new Date();
  }

  taoDot(): void {
    if (!this.dotMoi.tenDot || !this.dotMoi.ngayBatDau || !this.dotMoi.ngayKetThuc) {
      this.toastr.warning('Vui lòng điền đầy đủ thông tin');
      return;
    }
    this.isSubmitting = true;
    this.gvService.taoDotBaoCaoTienDo(this.dotMoi).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Tạo đợt báo cáo thành công');
          this.dotMoi = {};
          (window as any).bootstrap.Modal.getInstance(document.getElementById('modalTaoDot'))?.hide();
          this.isSubmitting = false;
          this.loadDots();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Lỗi khi tạo đợt báo cáo');
        this.isSubmitting = false;
      }
    });
  }

  xemChiTiet(bc: BaoCaoTienDoResponse): void {
    this.baoCaoChon = bc;
    this.nhanXetMoi = { trangThai: 'DA_NHAN_XET', nhanXet: bc.nhanXet };
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalNhanXet'));
    modal.show();
  }

  luuNhanXet(): void {
    if (!this.nhanXetMoi.nhanXet) {
      this.toastr.warning('Vui lòng nhập nhận xét');
      return;
    }
    this.isSubmittingNhanXet = true;
    const data = {
      baoCaoTienDoId: this.baoCaoChon?.id,
      nhanXet: this.nhanXetMoi.nhanXet,
      trangThai: 'DA_NHAN_XET'
    };
    this.gvService.nhanXetBaoCaoTienDo(data).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Lưu nhận xét thành công');
          this.isSubmittingNhanXet = false;
          (window as any).bootstrap.Modal.getInstance(document.getElementById('modalNhanXet'))?.hide();
          this.loadData();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Lỗi khi lưu nhận xét');
        this.isSubmittingNhanXet = false;
      }
    });
  }

  getTrangThaiClass(trangThai: string): string {
    switch (trangThai) {
      case 'DA_NHAN_XET': return 'badge bg-success';
      case 'BI_TU_CHOI': return 'badge bg-danger';
      default: return 'badge bg-warning';
    }
  }

  getTrangThaiText(trangThai: string): string {
    switch (trangThai) {
      case 'CHO_NHAN_XET': return 'Chờ nhận xét';
      case 'DA_NHAN_XET': return 'Đã nhận xét';
      case 'BI_TU_CHOI': return 'Từ chối';
      default: return trangThai;
    }
  }

  getDownloadUrl(filePath: string | undefined | null): string {
    if (!filePath) return '';
    return `http://localhost:8080/api/files/download?path=${encodeURIComponent(filePath)}`;
  }
}

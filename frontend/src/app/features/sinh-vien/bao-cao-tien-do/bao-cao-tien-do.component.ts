import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SinhVienService } from '../../../core/services/sinh-vien.service';
import { DotBaoCaoTienDoResponse, BaoCaoTienDoResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-bao-cao-tien-do-sv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Báo cáo tiến độ</h2>
    </div>

    <!-- Đợt báo cáo đang mở -->
    <div class="card mb-4" *ngIf="dotDangMos.length > 0">
      <div class="card-header bg-primary text-white">
        <h5 class="mb-0"><i class="fas fa-clock me-2"></i>Đợt báo cáo đang mở</h5>
      </div>
      <div class="card-body">
        <div class="alert alert-warning">
          <i class="fas fa-exclamation-triangle me-2"></i>
          <strong>Lưu ý:</strong> Bạn chỉ được nộp báo cáo một lần cho mỗi đợt. Vui lòng kiểm tra kỹ trước khi nộp.
        </div>

        <div class="row">
          <div class="col-md-6 mb-3" *ngFor="let dot of dotDangMos">
            <div class="card h-100 border-primary">
              <div class="card-header bg-primary text-white">
                <strong>{{ dot.tenDot }}</strong>
              </div>
              <div class="card-body">
                <p><strong>Hạn nộp:</strong> {{ dot.ngayKetThuc | date:'dd/MM/yyyy HH:mm' }}</p>
                <p><strong>GVHD:</strong> {{ dot.hoTenGiangVien }}</p>

                <!-- Kiểm tra đã nộp chưa -->
                <div *ngIf="daNopMap[dot.id]" class="alert alert-success mt-2 mb-0">
                  <i class="fas fa-check-circle me-1"></i> Bạn đã nộp báo cáo cho đợt này
                </div>
                <div *ngIf="!daNopMap[dot.id]" class="mt-2">
                  <button class="btn btn-primary w-100" (click)="openModalNop(dot)">
                    <i class="fas fa-upload me-1"></i> Nộp báo cáo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Đợt báo cáo đã đóng hoặc chưa có -->
    <div class="alert alert-info mb-4" *ngIf="dotDangMos.length === 0">
      <i class="fas fa-info-circle me-2"></i>
      Hiện không có đợt báo cáo tiến độ nào đang mở. Vui lòng chờ GVHD tạo đợt báo cáo mới.
      <br>
      <small class="text-muted"><em>(Chỉ hiển thị khi đề tài đã được GVHD duyệt)</em></small>
    </div>

    <!-- Lịch sử báo cáo tiến độ -->
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Lịch sử báo cáo tiến độ</h5>
      </div>
      <div class="card-body">
        <div *ngIf="lichSuBaoCaos.length === 0" class="alert alert-secondary">
          Chưa có báo cáo tiến độ nào.
        </div>

        <div class="table-responsive" *ngIf="lichSuBaoCaos.length > 0">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Đợt báo cáo</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
                <th>Nhận xét</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let bc of lichSuBaoCaos; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ bc.tenDotBaoCao }}</td>
                <td>{{ bc.ngayNop | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <span [class]="getTrangThaiClass(bc.trangThai)">
                    {{ getTrangThaiText(bc.trangThai) }}
                  </span>
                </td>
                <td>
                  <span *ngIf="bc.nhanXet" class="text-truncate d-inline-block" style="max-width: 200px;" 
                        [title]="bc.nhanXet">
                    {{ bc.nhanXet }}
                  </span>
                  <span *ngIf="!bc.nhanXet" class="text-muted">Chưa có</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-primary" (click)="xemChiTiet(bc)">
                    <i class="fas fa-eye"></i> Chi tiết
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Nộp báo cáo -->
    <div class="modal fade" id="modalNopBaoCao" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Nộp báo cáo tiến độ</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="alert alert-info mb-3">
              <strong>Đợt:</strong> {{ dotDangChon?.tenDot }}<br>
              <strong>Hạn nộp:</strong> {{ dotDangChon?.ngayKetThuc | date:'dd/MM/yyyy HH:mm' }}
            </div>

            <div class="mb-3">
              <label class="form-label">Nội dung báo cáo *</label>
              <textarea class="form-control" [(ngModel)]="noiDungNop" rows="4" 
                        placeholder="Mô tả ngắn nội dung báo cáo..."></textarea>
            </div>

            <div class="mb-3">
              <label class="form-label">File báo cáo</label>
              <input type="file" class="form-control" (change)="onFileChange($event)" accept=".doc,.docx,.pdf">
              <small class="text-muted">Chấp nhận file .doc, .docx, .pdf</small>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Hủy</button>
            <button type="button" class="btn btn-primary" (click)="nopBaoCao()" 
                    [disabled]="!noiDungNop || !fileNop || isSubmitting">
              <span *ngIf="isSubmitting">Đang nộp...</span>
              <span *ngIf="!isSubmitting">Nộp báo cáo</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết -->
    <div class="modal fade" id="modalChiTiet" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết báo cáo tiến độ</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <table class="table table-borderless">
              <tr>
                <th width="40%">Đợt báo cáo:</th>
                <td>{{ chiTietBaoCao?.tenDotBaoCao }}</td>
              </tr>
              <tr>
                <th>Ngày nộp:</th>
                <td>{{ chiTietBaoCao?.ngayNop | date:'dd/MM/yyyy HH:mm' }}</td>
              </tr>
              <tr>
                <th>Trạng thái:</th>
                <td>
                  <span [class]="getTrangThaiClass(chiTietBaoCao?.trangThai || '')">
                    {{ getTrangThaiText(chiTietBaoCao?.trangThai || '') }}
                  </span>
                </td>
              </tr>
              <tr>
                <th>Nội dung:</th>
                <td>{{ chiTietBaoCao?.noiDung || 'Không có' }}</td>
              </tr>
              <tr>
                <th>Nhận xét của GVHD:</th>
                <td>
                  <div *ngIf="chiTietBaoCao?.nhanXet" class="alert alert-light">
                    {{ chiTietBaoCao?.nhanXet }}
                  </div>
                  <div *ngIf="!chiTietBaoCao?.nhanXet" class="text-muted">Chưa có nhận xét</div>
                </td>
              </tr>
            </table>

            <div *ngIf="chiTietBaoCao?.fileBaoCao" class="mt-3">
              <button class="btn btn-outline-primary" (click)="downloadFile(chiTietBaoCao?.fileBaoCao)">
                <i class="fas fa-download me-1"></i> Tải file báo cáo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class BaoCaoTienDoSvComponent implements OnInit {
  dotDangMos: DotBaoCaoTienDoResponse[] = [];
  lichSuBaoCaos: BaoCaoTienDoResponse[] = [];
  daNopMap: { [key: number]: boolean } = {};

  dotDangChon: DotBaoCaoTienDoResponse | null = null;
  chiTietBaoCao: BaoCaoTienDoResponse | null = null;
  noiDungNop = '';
  fileNop: File | null = null;
  isSubmitting = false;

  constructor(
    private svService: SinhVienService,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    // Load đợt đang mở
    this.svService.getDotBaoCaoTienDo().subscribe({
      next: (res) => {
        if (res.success) {
          this.dotDangMos = res.data || [];
        }
      }
    });

    // Load lịch sử báo cáo
    this.svService.getBaoCaoTienDoCuaToi().subscribe({
      next: (res) => {
        if (res.success) {
          this.lichSuBaoCaos = res.data || [];
          // Build map đã nộp
          this.daNopMap = {};
          this.lichSuBaoCaos.forEach(bc => {
            this.daNopMap[bc.dotBaoCaoTienDoId] = true;
          });
        }
      }
    });
  }

  openModalNop(dot: DotBaoCaoTienDoResponse): void {
    this.dotDangChon = dot;
    this.noiDungNop = '';
    this.fileNop = null;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalNopBaoCao'));
    modal.show();
  }

  onFileChange(event: any): void {
    this.fileNop = event.target.files[0];
  }

  nopBaoCao(): void {
    if (!this.noiDungNop) {
      this.toastr.warning('Vui lòng nhập nội dung báo cáo');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('dotBaoCaoTienDoId', this.dotDangChon?.id?.toString() || '');
    formData.append('noiDung', this.noiDungNop);
    if (this.fileNop) {
      formData.append('fileBaoCao', this.fileNop);
    }

    this.svService.nopBaoCaoTienDo(formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Nộp báo cáo tiến độ thành công!');
          this.isSubmitting = false;
          (window as any).bootstrap.Modal.getInstance(document.getElementById('modalNopBaoCao'))?.hide();
          this.loadData();
        }
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
        this.isSubmitting = false;
      }
    });
  }

  xemChiTiet(bc: BaoCaoTienDoResponse): void {
    this.chiTietBaoCao = bc;
    const modal = new (window as any).bootstrap.Modal(document.getElementById('modalChiTiet'));
    modal.show();
  }

  getTrangThaiClass(trangThai: string): string {
    switch (trangThai) {
      case 'DA_NHAN_XET': return 'badge bg-success';
      case 'BI_TU_CHOI': return 'badge bg-danger';
      case 'CHO_NHAN_XET': return 'badge bg-warning';
      default: return 'badge bg-secondary';
    }
  }

  getTrangThaiText(trangThai: string): string {
    switch (trangThai) {
      case 'CHO_NHAN_XET': return 'Chờ nhận xét';
      case 'DA_NHAN_XET': return 'Đã nhận xét';
      case 'BI_TU_CHOI': return 'Từ chối - Cần sửa';
      default: return trangThai;
    }
  }

  getDownloadUrl(filePath: string | undefined | null): string {
    if (!filePath) return '';
    return `http://localhost:8080/api/files/download?path=${encodeURIComponent(filePath)}`;
  }

  downloadFile(filePath: string | undefined | null): void {
    if (!filePath) {
      this.toastr.error('Không có file để tải');
      return;
    }

    const token = this.authService.getToken();
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

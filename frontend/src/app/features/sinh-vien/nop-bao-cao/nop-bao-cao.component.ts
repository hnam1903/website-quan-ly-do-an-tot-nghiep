import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SinhVienService } from '../../../core/services/sinh-vien.service';
import { DeTaiResponse, BaoCaoResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-nop-bao-cao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-primary-subtle">
          <i class="bi bi-file-earmark-arrow-up text-primary"></i>
        </div>
        <div>
          <h2>Nộp báo cáo</h2>
          <p class="mb-0">Nộp báo cáo cuối kỳ cho đồ án</p>
        </div>
      </div>
    </div>

    <div *ngIf="!deTaiCuaToi" class="alert alert-warning">
      <i class="bi bi-exclamation-triangle me-2"></i>Bạn chưa đăng ký đề tài hoặc đề tài chưa được duyệt.
    </div>

    <div *ngIf="deTaiCuaToi" class="card">
      <div class="card-body">
        <div *ngIf="deTaiCuaToi && deTaiCuaToi.trangThai === 'DANG_THUC_HIEN' && !baoCao">
          <div class="alert alert-info mb-4">
            <i class="bi bi-info-circle me-2"></i>
            <strong>Lưu ý:</strong> Bạn chỉ được nộp báo cáo một lần duy nhất. Vui lòng kiểm tra kỹ trước khi nộp.
          </div>

          <form (ngSubmit)="nopBaoCao()">
            <div class="mb-4">
              <label class="form-label">File báo cáo (Word) <span class="text-danger">*</span></label>
              <input type="file" class="form-control" (change)="onFileChange($event)" accept=".doc,.docx" required>
              <small class="text-muted d-block mt-1">Chấp nhận file .doc, .docx</small>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="!fileBaoCao || isSubmitting">
              <i class="bi bi-upload me-2"></i>
              <span *ngIf="isSubmitting">Đang nộp...</span>
              <span *ngIf="!isSubmitting">Nộp báo cáo</span>
            </button>
          </form>
        </div>

        <div *ngIf="deTaiCuaToi && deTaiCuaToi.trangThai === 'DA_NOP_BAO_CAO' && baoCao" class="alert alert-success">
          <i class="bi bi-check-circle-fill me-2"></i>
          <strong>Đã nộp báo cáo!</strong> File của bạn đã được nộp thành công. Vui lòng chờ GVHD chấm điểm.
        </div>

        <div *ngIf="baoCao" class="mt-4">
          <h5 class="mb-4"><i class="bi bi-file-earmark-text me-2"></i>Thông tin báo cáo đã nộp</h5>
          <table class="table table-bordered">
            <tbody>
              <tr>
                <th width="30%" class="bg-light">Ngày nộp:</th>
                <td>{{ baoCao.ngayNop | date:'dd/MM/yyyy HH:mm' }}</td>
              </tr>
              <tr>
                <th class="bg-light">Trạng thái:</th>
                <td><span class="badge badge-success">Đã nộp</span></td>
              </tr>
              <tr>
                <th class="bg-light">Tên đề tài:</th>
                <td>{{ baoCao.tenDeTai }}</td>
              </tr>
            </tbody>
          </table>

          <div class="mt-4" *ngIf="baoCao.fileBaoCao">
            <h6 class="mb-3"><i class="bi bi-paperclip me-2"></i>Tài liệu đã nộp:</h6>
            <button (click)="downloadFile(baoCao.fileBaoCao)" class="btn btn-outline-primary">
              <i class="fas fa-download me-2"></i>Tải báo cáo
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class NopBaoCaoComponent implements OnInit {
  deTaiCuaToi: DeTaiResponse | null = null;
  baoCao: BaoCaoResponse | null = null;
  fileBaoCao: File | null = null;
  isSubmitting = false;

  constructor(
    private svService: SinhVienService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

  getDownloadUrl(filePath: string): string {
    return `http://localhost:8080/api/files/download?path=${encodeURIComponent(filePath)}`;
  }

  downloadFile(filePath: string): void {
    const token = this.authService.getToken();
    const user = this.authService.getCurrentUser();
    const hoTen = user?.hoTen?.replace(/\s+/g, '-').toLowerCase() || 'user';
    const maSV = user?.maSinhVien || '';
    const fileName = `bao-cao-${hoTen}-${maSV}.docx`;

    fetch(this.getDownloadUrl(filePath), {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Không thể tải file');
      return res.blob();
    })
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(err => {
      this.toastr.error('Không thể tải file');
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.svService.getDeTaiCuaToi().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.deTaiCuaToi = res.data;
        }
      }
    });

    this.svService.getBaoCaoCuaToi().subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.baoCao = res.data;
        }
      }
    });
  }

  onFileChange(event: any): void {
    this.fileBaoCao = event.target.files[0];
  }

  nopBaoCao(): void {
    if (!this.fileBaoCao) {
      this.toastr.warning('Vui lòng chọn file báo cáo');
      return;
    }

    // Validate file type
    const fileName = this.fileBaoCao.name.toLowerCase();
    if (!fileName.endsWith('.doc') && !fileName.endsWith('.docx')) {
      this.toastr.warning('File báo cáo phải là file Word (.doc hoặc .docx)');
      return;
    }

    this.isSubmitting = true;
    const formData = new FormData();
    formData.append('deTaiId', this.deTaiCuaToi?.id?.toString() || '');
    formData.append('fileBaoCao', this.fileBaoCao!);

    this.svService.nopBaoCao(formData).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Nộp báo cáo thành công!');
          this.loadData();
        }
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastr.error(err.error?.message || 'Có lỗi xảy ra');
      }
    });
  }
}

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
    <div class="container-fluid py-4">
      <!-- Header -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="mb-1">
            <span class="material-symbols-outlined me-2">upload_file</span>
            Nộp báo cáo
          </h2>
          <p class="text-muted mb-0 small">Nộp báo cáo cuối kỳ cho đồ án</p>
        </div>
      </div>

      <!-- Alert: Chưa đăng ký đề tài -->
      <div class="alert alert-warning" *ngIf="!deTaiCuaToi">
        <span class="material-symbols-outlined me-2">warning</span>
        Bạn chưa đăng ký đề tài hoặc đề tài chưa được duyệt.
      </div>

      <!-- Main Card -->
      <div class="card shadow-sm" *ngIf="deTaiCuaToi">
        <div class="card-body">
          <!-- Form Upload (chưa nộp) -->
          <div *ngIf="deTaiCuaToi.trangThai === 'DANG_THUC_HIEN' && !baoCao">
            <div class="alert alert-info mb-4">
              <span class="material-symbols-outlined me-2">info</span>
              <strong>Lưu ý:</strong> Bạn chỉ được nộp báo cáo một lần duy nhất. Vui lòng kiểm tra kỹ trước khi nộp.
            </div>

            <div class="nbc-upload-area mb-4" (click)="triggerFileInput()"
                 [class.nbc-dragover]="isDragover"
                 (dragover)="onDragOver($event)"
                 (dragleave)="onDragLeave($event)"
                 (drop)="onDrop($event)">
              <input type="file" #fileInput (change)="onFileChange($event)" accept=".doc,.docx" hidden>
              <div class="nbc-upload-icon">
                <span class="material-symbols-outlined">cloud_upload</span>
              </div>
              <div class="nbc-upload-text">
                <span *ngIf="!fileBaoCao">Kéo thả file vào đây hoặc <strong>chọn file</strong></span>
                <span *ngIf="fileBaoCao" class="nbc-file-name">
                  <span class="material-symbols-outlined">description</span> {{ fileBaoCao.name }}
                </span>
              </div>
              <small class="nbc-upload-hint">Chấp nhận file .doc, .docx</small>
            </div>

            <button class="btn btn-success w-100" (click)="nopBaoCao()"
                    [disabled]="!fileBaoCao || isSubmitting">
              <span *ngIf="isSubmitting">
                <span class="material-symbols-outlined me-2 spin">sync</span>Đang nộp...
              </span>
              <span *ngIf="!isSubmitting">
                <span class="material-symbols-outlined me-2">upload</span>Nộp báo cáo
              </span>
            </button>
          </div>

          <!-- Alert: Đã nộp -->
          <div class="alert alert-success" *ngIf="deTaiCuaToi.trangThai === 'DA_NOP_BAO_CAO' && baoCao">
            <span class="material-symbols-outlined me-2">check_circle</span>
            <strong>Đã nộp báo cáo!</strong> File của bạn đã được nộp thành công. Vui lòng chờ GVHD chấm điểm.
          </div>

          <!-- Thông tin báo cáo đã nộp -->
          <div *ngIf="baoCao">
            <h5 class="mb-4">
              <span class="material-symbols-outlined me-2">info</span>Thông tin báo cáo đã nộp
            </h5>
            <table >
              <tbody>
                <tr>
                  <th width="30%" class="bg-light">Ngày nộp:</th>
                  <td>{{ baoCao.ngayNop | date:'dd/MM/yyyy HH:mm' }}</td>
                </tr>
                <tr>
                  <th class="bg-light">Trạng thái:</th>
                  <td><span class="badge bg-success">Đã nộp</span></td>
                </tr>
                <tr>
                  <th class="bg-light">Tên đề tài:</th>
                  <td>{{ baoCao.tenDeTai }}</td>
                </tr>
              </tbody>
            </table>

            <div class="mt-4" *ngIf="baoCao.fileBaoCao">
              <h6 class="mb-3">
                <span class="material-symbols-outlined me-2">attach_file</span>Tài liệu đã nộp:
              </h6>
              <button class="btn btn-outline-primary" (click)="downloadFile(baoCao.fileBaoCao)">
                <span class="material-symbols-outlined me-2">download</span>Tải báo cáo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .nbc-upload-area {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      background: #f8f9fa;
      border: 2px dashed #dee2e6;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      text-align: center;
    }
    .nbc-upload-area:hover,
    .nbc-dragover {
      border-color: #198754;
      background: #f0fff4;
    }
    .nbc-upload-icon {
      width: 72px;
      height: 72px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #198754;
      border-radius: 50%;
      margin-bottom: 16px;
      font-size: 32px;
      color: white;
    }
    .nbc-upload-text {
      font-size: 15px;
      color: #495057;
      margin-bottom: 8px;
    }
    .nbc-upload-text strong {
      color: #198754;
    }
    .nbc-upload-hint {
      font-size: 13px;
      color: #adb5bd;
    }
    .nbc-file-name {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #198754;
      font-weight: 500;
    }
    .nbc-file-name i {
      font-size: 20px;
    }
    .spin {
      animation: spin 1s linear infinite;
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
  `]
})
export class NopBaoCaoComponent implements OnInit {
  deTaiCuaToi: DeTaiResponse | null = null;
  baoCao: BaoCaoResponse | null = null;
  fileBaoCao: File | null = null;
  isSubmitting = false;
  isDragover = false;

  constructor(
    private svService: SinhVienService,
    private toastr: ToastrService,
    private authService: AuthService
  ) {}

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

  triggerFileInput(): void {
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    input?.click();
  }

  onFileChange(event: any): void {
    this.fileBaoCao = event.target.files[0];
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragover = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragover = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragover = false;
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.fileBaoCao = files[0];
    }
  }

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

  nopBaoCao(): void {
    if (!this.fileBaoCao) {
      this.toastr.warning('Vui lòng chọn file báo cáo');
      return;
    }

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

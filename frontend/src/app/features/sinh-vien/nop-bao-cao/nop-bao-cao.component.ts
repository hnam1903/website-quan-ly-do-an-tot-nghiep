import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SinhVienService } from '../../../core/services/sinh-vien.service';
import { DeTaiResponse, BaoCaoResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-nop-bao-cao',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <h2>Nộp báo cáo</h2>
      <p class="text-muted mb-0">Nộp báo cáo và source code đồ án</p>
    </div>

    <div *ngIf="!deTaiCuaToi" class="alert alert-warning">
      Bạn chưa đăng ký đề tài hoặc đề tài chưa được duyệt.
    </div>

    <div *ngIf="deTaiCuaToi" class="card">
      <div class="card-body">
        <div *ngIf="deTaiCuaToi.trangThai !== 'DANG_THUC_HIEN'" class="alert alert-info">
          Đề tài chưa trong giai đoạn thực hiện. Trạng thái hiện tại:
          <strong>{{ deTaiCuaToi.trangThai }}</strong>
        </div>

        <div *ngIf="deTaiCuaToi.trangThai === 'DANG_THUC_HIEN'">
          <div *ngIf="!baoCao" class="alert alert-warning">
            <strong>Lưu ý:</strong> Bạn chỉ được nộp báo cáo <strong>1 lần duy nhất</strong>. Vui lòng kiểm tra kỹ trước khi nộp.
          </div>

          <form (ngSubmit)="nopBaoCao()">
            <div class="mb-3">
              <label class="form-label">File báo cáo (Word) *</label>
              <input type="file" class="form-control" (change)="onFileChange($event, 'baoCao')" accept=".doc,.docx" required>
              <small class="text-muted">Chấp nhận file .doc, .docx</small>
            </div>
            <div class="mb-3">
              <label class="form-label">Source code (ZIP/RAR)</label>
              <input type="file" class="form-control" (change)="onFileChange($event, 'source')" accept=".zip,.rar,.7z">
              <small class="text-muted">Chấp nhận file .zip, .rar, .7z</small>
            </div>
            <button type="submit" class="btn btn-primary" [disabled]="!fileBaoCao || isSubmitting">
              <span *ngIf="isSubmitting">Đang nộp...</span>
              <span *ngIf="!isSubmitting">Nộp báo cáo</span>
            </button>
          </form>
        </div>

        <div *ngIf="baoCao" class="mt-4">
          <h5>Thông tin báo cáo đã nộp</h5>
          <table class="table table-bordered">
            <tr>
              <th width="30%">Ngày nộp:</th>
              <td>{{ baoCao.ngayNop | date:'dd/MM/yyyy HH:mm' }}</td>
            </tr>
            <tr>
              <th>Trạng thái:</th>
              <td><span class="badge bg-success">Đã nộp</span></td>
            </tr>
            <tr>
              <th>Tên đề tài:</th>
              <td>{{ baoCao.tenDeTai }}</td>
            </tr>
          </table>
          <div class="alert alert-info mt-3">
            <i class="fas fa-info-circle"></i> Báo cáo đã được gửi cho giảng viên hướng dẫn xem xét.
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
  fileSource: File | null = null;
  isSubmitting = false;

  constructor(
    private svService: SinhVienService,
    private toastr: ToastrService
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

  onFileChange(event: any, type: string): void {
    if (type === 'baoCao') {
      this.fileBaoCao = event.target.files[0];
    } else {
      this.fileSource = event.target.files[0];
    }
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
    if (this.fileSource) {
      formData.append('fileSourceCode', this.fileSource!);
    }

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

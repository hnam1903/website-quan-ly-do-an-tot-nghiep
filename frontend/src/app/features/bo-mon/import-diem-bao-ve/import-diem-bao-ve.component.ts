import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-import-diem-bao-ve',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-success-subtle">
          <span class="material-symbols-outlined text-success">upload_file</span>
        </div>
        <div>
          <h2>Import điểm bảo vệ từ Excel</h2>
          <p class="mb-0">Upload file Excel để nhập điểm bảo vệ cho các hội đồng</p>
        </div>
      </div>
    </div>

    <div class="row g-4">
      <div class="col-lg-4">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="mb-4"><span class="material-symbols-outlined me-2 text-success">download</span>Tải template</h5>
            <button class="btn btn-success w-100" (click)="downloadTemplate()">
              <span class="material-symbols-outlined me-2">table</span>Tải file template Excel
            </button>
          </div>
        </div>
      </div>
      <div class="col-lg-8">
        <div class="card h-100">
          <div class="card-body">
            <h5 class="mb-4"><span class="material-symbols-outlined me-2 text-primary">upload</span>Upload file điểm</h5>
            <div class="alert alert-info mb-4">
              <strong><span class="material-symbols-outlined me-2">info</span>Hướng dẫn:</strong>
              <ul class="mb-0 mt-2">
                <li>Tải template Excel về máy</li>
                <li>Điền thông tin điểm bảo vệ theo đúng định dạng</li>
                <li>Upload file đã điền lên hệ thống</li>
              </ul>
            </div>

            <label class="btn btn-primary">
              <span class="material-symbols-outlined me-2">upload</span>Chọn file Excel
              <input type="file" accept=".xlsx,.xls" (change)="onFileSelected($event)" style="display: none;">
            </label>
            <span class="ms-3 text-muted" *ngIf="selectedFile">
              <span class="material-symbols-outlined text-success me-1">check_circle</span>{{ selectedFile.name }}
            </span>

            <div *ngIf="message" class="alert mt-3" [ngClass]="success ? 'alert-success' : 'alert-danger'">
              <span class="material-symbols-outlined me-2">{{ success ? 'check_circle' : 'error' }}</span>
              {{ message }}
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ImportDiemBaoVeComponent implements OnInit {
  selectedFile: File | null = null;
  message = '';
  success = false;

  constructor(
    private boMonService: BoMonService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {}

  downloadTemplate(): void {
    this.boMonService.downloadDiemBaoVeTemplate().subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'template_diem_bao_ve.xlsx';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.toastr.error('Không thể tải template');
      }
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;
    this.message = '';

    this.boMonService.importDiemExcel(file).subscribe({
      next: (res) => {
        this.success = true;
        this.message = res.message || 'Import thành công!';
        this.selectedFile = null;
      },
      error: (err) => {
        this.success = false;
        this.message = err.error?.message || 'Import thất bại!';
      }
    });

    event.target.value = '';
  }
}

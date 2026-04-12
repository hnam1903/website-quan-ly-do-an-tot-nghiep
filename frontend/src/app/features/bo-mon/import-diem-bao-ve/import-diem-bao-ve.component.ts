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
      <div>
        <h2>Import điểm bảo vệ từ Excel</h2>
        <p class="text-muted mb-0">Upload file Excel để nhập điểm bảo vệ cho các hội đồng</p>
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="mb-4">
          <button class="btn btn-success me-2" (click)="downloadTemplate()">
            <i class="bi bi-download"></i> Tải template
          </button>
        </div>

        <div class="alert alert-info">
          <strong>Hướng dẫn:</strong>
          <ul class="mb-0 mt-2">
            <li>Tải template Excel về máy</li>
            <li>Điền thông tin điểm bảo vệ theo đúng định dạng</li>
            <li>Upload file đã điền lên hệ thống</li>
          </ul>
        </div>

        <div class="mt-4">
          <label class="btn btn-primary">
            <i class="bi bi-upload"></i> Chọn file Excel
            <input type="file" accept=".xlsx,.xls" (change)="onFileSelected($event)" style="display: none;">
          </label>
          <span class="ms-3" *ngIf="selectedFile">{{ selectedFile.name }}</span>
        </div>

        <div *ngIf="message" class="alert mt-3" [ngClass]="success ? 'alert-success' : 'alert-danger'">
          {{ message }}
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

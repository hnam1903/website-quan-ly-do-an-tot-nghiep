import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { BaoCaoResponse, DotDangKyResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bao-cao-gv',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-primary-subtle">
          <span class="material-symbols-outlined text-primary">assignment</span>
        </div>
        <div>
          <h2>Báo cáo sinh viên</h2>
        </div>
      </div>
      <div class="d-flex align-items-center gap-3">
        <select class="form-select" [(ngModel)]="dotDangKyId" (change)="onDotChange()" style="width: 220px;">
          <option [ngValue]="null">Tất cả các đợt</option>
          <option *ngFor="let dot of dotDangKys" [ngValue]="dot.id">{{ dot.tenDot }}</option>
        </select>
        <span class="badge bg-primary">{{ filteredList.length }} báo cáo</span>
      </div>
    </div>

    <div class="card">
      <div class="card-body p-0">
        <div class="table-responsive" *ngIf="filteredList.length > 0">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th style="width: 120px">Mã SV</th>
                <th style="width: 160px">Họ tên SV</th>
                <th>Tên đề tài</th>
                <th style="width: 140px">Ngày nộp</th>
                <th style="width: 100px" class="text-center">Trạng thái</th>
                <th style="width: 120px" class="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let bc of filteredList; let i = index" class="align-middle">
                <td class="text-center">
                  <span class="stt-badge">{{ i + 1 }}</span>
                </td>
                <td><code>{{ bc.maSinhVien || '-' }}</code></td>
                <td><strong>{{ bc.hoTenSinhVien || '-' }}</strong></td>
                <td>
                  <span class="text-truncate d-inline-block" style="max-width: 280px">{{ bc.tenDeTai }}</span>
                </td>
                <td>{{ bc.ngayNop | date:'dd/MM/yyyy HH:mm' }}</td>
                <td class="text-center">
                  <span class="badge" [class.bg-success]="bc.trangThai === 'DA_NOP'" [class.bg-secondary]="bc.trangThai !== 'DA_NOP'">
                    {{ bc.trangThai === 'DA_NOP' ? 'Đã nộp' : 'Chưa nộp' }}
                  </span>
                </td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary btn-icon" (click)="xemChiTiet(bc)" title="Xem chi tiết">
                    <span class="material-symbols-outlined">visibility</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div *ngIf="filteredList.length === 0" class="text-center py-5">
          <div class="empty-state">
            <span class="material-symbols-outlined fs-2 d-block mb-3" style="color: #ccc;">inbox</span>
            <p class="mb-1 fw-semibold">Chưa có báo cáo nào được nộp cho bạn</p>
            <small class="text-muted">Danh sách báo cáo sẽ được cập nhật khi có sinh viên nộp</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết báo cáo -->
    <div class="modal fade" id="chiTietModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="baoCaoChon">
          <div class="modal-header">
            <h5 class="modal-title"><span class="material-symbols-outlined me-2">info</span>Chi tiết báo cáo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <div class="row g-4">
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Sinh viên</label>
                  <p class="info-value">{{ baoCaoChon.hoTenSinhVien }}</p>
                  <small class="text-muted">Mã SV: {{ baoCaoChon.maSinhVien }}</small>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Tên đề tài</label>
                  <p class="info-value">{{ baoCaoChon.tenDeTai }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group">
                  <label class="info-label">Ngày nộp</label>
                  <p class="info-value">{{ baoCaoChon.ngayNop | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
              </div>
              <div class="col-md-6">
                <div class="info-group mb-0">
                  <label class="info-label">Trạng thái</label>
                  <p class="info-value">
                    <span class="badge" [class.bg-success]="baoCaoChon.trangThai === 'DA_NOP'" [class.bg-secondary]="baoCaoChon.trangThai !== 'DA_NOP'">
                      {{ baoCaoChon.trangThai === 'DA_NOP' ? 'Đã nộp' : 'Chưa nộp' }}
                    </span>
                  </p>
                </div>
              </div>
              <div class="col-12">
                <div class="info-group mb-0">
                  <label class="info-label">File báo cáo</label>
                  <p class="info-value">
                    <button *ngIf="baoCaoChon.fileBaoCao" class="btn btn-sm btn-success" (click)="taiFile(baoCaoChon.fileBaoCao, 'bao_cao')">
                      <span class="material-symbols-outlined me-1">download</span> Tải báo cáo
                    </button>
                    <span *ngIf="!baoCaoChon.fileBaoCao" class="text-muted">Chưa có file</span>
                  </p>
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
export class BaoCaoGvComponent implements OnInit {
  baoCaos: BaoCaoResponse[] = [];
  filteredList: BaoCaoResponse[] = [];
  baoCaoChon: BaoCaoResponse | null = null;
  dotDangKys: DotDangKyResponse[] = [];
  dotDangKyId: number | null = null;

  constructor(
    private gvService: GiangVienService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadDotDangKy();
  }

  loadDotDangKy(): void {
    this.gvService.getDotDangKy().subscribe({
      next: (res) => {
        if (res.success) {
          this.dotDangKys = res.data || [];
          if (this.dotDangKys.length > 0) {
            this.dotDangKyId = this.dotDangKys[0].id;
          }
        }
        this.loadBaoCao();
      },
      error: () => {
        this.dotDangKys = [];
        this.loadBaoCao();
      }
    });
  }

  onDotChange(): void {
    this.loadBaoCao();
  }

  loadBaoCao(): void {
    this.gvService.getBaoCaoSinhVien(this.dotDangKyId || undefined).subscribe({
      next: (res) => {
        if (res.success) {
          this.baoCaos = res.data || [];
          this.applyFilter();
        }
      },
      error: (err) => {
        this.toastr.error('Không thể tải danh sách báo cáo');
      }
    });
  }

  applyFilter(): void {
    this.filteredList = this.baoCaos;
  }

  xemChiTiet(bc: BaoCaoResponse): void {
    this.baoCaoChon = bc;
    // Open modal
    const modalEl = document.getElementById('chiTietModal');
    if (modalEl) {
      const modal = new (window as any).bootstrap.Modal(modalEl);
      modal.show();
    }
  }

  taiFile(filePath: string, type: string): void {
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
      const extension = this.getFileExtension(filePath);
      const downloadName = `file_${type}.${extension}`;
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = downloadName;
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

  private getFileExtension(filePath: string): string {
    if (!filePath) return 'pdf';
    const parts = filePath.split(/[/\\]/);
    const fileName = parts[parts.length - 1];
    const lastDot = fileName.lastIndexOf('.');
    return lastDot > 0 ? fileName.substring(lastDot + 1) : 'pdf';
  }
}

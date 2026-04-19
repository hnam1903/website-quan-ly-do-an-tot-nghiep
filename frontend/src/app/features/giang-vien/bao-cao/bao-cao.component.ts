import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { BaoCaoResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-bao-cao-gv',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>Báo cáo sinh viên</h2>
     
    </div>

    <div class="card">
      <div class="card-body">
        <div *ngIf="baoCaos.length === 0" class="alert alert-info">
          Chưa có báo cáo nào được nộp cho bạn.
        </div>

        <div class="table-responsive" *ngIf="baoCaos.length > 0">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>STT</th>
                <th>Sinh viên</th>
                <th>Mã SV</th>
                <th>Tên đề tài</th>
                <th>Ngày nộp</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let bc of baoCaos; let i = index">
                <td>{{ i + 1 }}</td>
                <td>{{ bc.hoTenSinhVien }}</td>
                <td>{{ bc.maSinhVien }}</td>
                <td>{{ bc.tenDeTai }}</td>
                <td>{{ bc.ngayNop | date:'dd/MM/yyyy HH:mm' }}</td>
                <td>
                  <span class="badge bg-success">{{ bc.trangThai === 'DA_NOP' ? 'Đã nộp' : 'Chưa nộp' }}</span>
                </td>
                <td>
                  <button class="btn btn-sm btn-primary me-1" (click)="xemChiTiet(bc)">
                    <i class="fas fa-eye"></i> Xem
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Chi tiết báo cáo -->
    <div class="modal fade" id="chiTietModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content" *ngIf="baoCaoChon">
          <div class="modal-header">
            <h5 class="modal-title">Chi tiết báo cáo</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">
            <table class="table table-bordered">
              <tr>
                <th width="30%">Sinh viên:</th>
                <td>{{ baoCaoChon.hoTenSinhVien }}</td>
              </tr>
              <tr>
                <th>Mã sinh viên:</th>
                <td>{{ baoCaoChon.maSinhVien }}</td>
              </tr>
              <tr>
                <th>Tên đề tài:</th>
                <td>{{ baoCaoChon.tenDeTai }}</td>
              </tr>
              <tr>
                <th>Ngày nộp:</th>
                <td>{{ baoCaoChon.ngayNop | date:'dd/MM/yyyy HH:mm' }}</td>
              </tr>
              <tr>
                <th>File báo cáo:</th>
                <td>
                  <button *ngIf="baoCaoChon.fileBaoCao" class="btn btn-sm btn-success" (click)="taiFile(baoCaoChon.fileBaoCao, 'bao_cao')">
                    <i class="fas fa-download"></i> Tải báo cáo
                  </button>
                  <span *ngIf="!baoCaoChon.fileBaoCao" class="text-muted">Chưa có file</span>
                </td>
              </tr>
            </table>
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
  baoCaoChon: BaoCaoResponse | null = null;

  constructor(
    private gvService: GiangVienService,
    private http: HttpClient,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadBaoCao();
  }

  loadBaoCao(): void {
    this.gvService.getBaoCaoSinhVien().subscribe({
      next: (res) => {
        if (res.success) {
          this.baoCaos = res.data || [];
        }
      },
      error: (err) => {
        this.toastr.error('Không thể tải danh sách báo cáo');
      }
    });
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
    // Tạo link download trực tiếp
    const url = `http://localhost:8080/api/files/download?path=${encodeURIComponent(filePath)}`;
    window.open(url, '_blank');
  }
}

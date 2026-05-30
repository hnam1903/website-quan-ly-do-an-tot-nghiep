import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { GiangVienResponse } from '../../../core/models/models';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-giang-vien-bo-mon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-header">
      <div class="d-flex align-items-center gap-3">
        <div class="page-icon bg-primary-subtle">
          <span class="material-symbols-outlined text-primary">badge</span>
        </div>
        <div>
          <h2>Quản lý Giảng viên</h2>
          <p class="mb-0">Xem danh sách giảng viên theo bộ môn</p>
        </div>
      </div>
      <span class="badge bg-primary">{{ filteredGiangVienList.length }} giảng viên</span>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <input type="text" class="form-control" placeholder="Tìm kiếm theo tên, email..."
                   [(ngModel)]="searchText" (input)="filterGiangVien()">
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th class="text-center" style="width: 60px">STT</th>
                <th>Họ tên</th>
                <th style="width: 80px">Học vị</th>
                <th>Email</th>
                <th style="width: 100px">Vai trò</th>
                <th class="text-center" style="width: 100px">Đang HD</th>
                <th class="text-center" style="width: 110px">Tối đa</th>
                <th class="text-center" style="width: 100px">Còn nhận</th>
                <th style="width: 100px">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let gv of filteredGiangVienList; let i = index" class="align-middle">
                <td class="text-center">
                  <span class="stt-badge">{{ i + 1 }}</span>
                </td>
                <td>
                  <strong>{{ gv.hoTen }}</strong>
                </td>
                <td>{{ gv.hocVi || '-' }}</td>
                <td class="text-muted">{{ gv.email }}</td>
                <td>
                  <span *ngIf="gv.laLanhDao" class="badge bg-warning text-dark">Lãnh đạo BM</span>
                  <span *ngIf="!gv.laLanhDao" class="badge bg-secondary">Giảng viên</span>
                </td>
                <td class="text-center">
                  <span class="badge" [class.bg-success]="(gv.soDeTaiDangHuongDan || 0) < (gv.soDeTaiToiDa || 5)"
                        [class.bg-danger]="(gv.soDeTaiDangHuongDan || 0) >= (gv.soDeTaiToiDa || 5)">
                    {{ gv.soDeTaiDangHuongDan || 0 }}
                  </span>
                </td>
                <td class="text-center">
                  <input type="number"
                         class="form-control form-control-sm text-center"
                         style="width: 70px; margin: 0 auto;"
                         [value]="gv.soDeTaiToiDa || 5"
                         (change)="onSoDeTaiToiDaChange(gv, $event)"
                         min="1"
                         max="20">
                </td>
                <td class="text-center">
                  <span class="badge" [class.bg-info]="(gv.soDeTaiConLai || 0) > 0"
                        [class.bg-secondary]="(gv.soDeTaiConLai || 0) <= 0">
                    {{ gv.soDeTaiConLai || 0 }}
                  </span>
                </td>
                <td>
                  <button class="btn btn-sm btn-outline-primary"
                          (click)="luuGioiHan(gv)"
                          [disabled]="savingId === gv.id">
                    <span *ngIf="savingId === gv.id" class="spinner-border spinner-border-sm me-1"></span>
                    <span *ngIf="savingId !== gv.id" class="material-symbols-outlined" style="font-size: 16px;">save</span>
                  </button>
                </td>
              </tr>
              <tr *ngIf="filteredGiangVienList.length === 0">
                <td colspan="9" class="text-center py-5">
                  <div class="empty-state">
                    <span class="material-symbols-outlined fs-2 d-block mb-3" style="color: #ccc;">badge</span>
                    <p class="mb-1 fw-semibold">Không có giảng viên nào</p>
                    <small class="text-muted">Thử thay đổi bộ lọc</small>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .badge { font-size: 0.8rem; }
  `]
})
export class GiangVienBoMonComponent implements OnInit {
  giangVienList: GiangVienResponse[] = [];
  filteredGiangVienList: GiangVienResponse[] = [];
  searchText = '';
  savingId: number | null = null;

  constructor(
    private boMonService: BoMonService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadGiangVien();
  }

  loadGiangVien(): void {
    this.boMonService.getGiangVien().subscribe({
      next: (res) => {
        if (res.success) {
          this.giangVienList = res.data;
          this.filterGiangVien();
        }
      },
      error: (err) => {
        this.toastr.error('Không thể tải danh sách giảng viên');
      }
    });
  }

  filterGiangVien(): void {
    if (!this.searchText) {
      this.filteredGiangVienList = this.giangVienList;
    } else {
      const lower = this.searchText.toLowerCase();
      this.filteredGiangVienList = this.giangVienList.filter(gv =>
        gv.hoTen?.toLowerCase().includes(lower) ||
        gv.email?.toLowerCase().includes(lower) ||
        gv.hocVi?.toLowerCase().includes(lower)
      );
    }
  }

  onSoDeTaiToiDaChange(gv: GiangVienResponse, event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = parseInt(input.value, 10);

    // Validate
    if (value < 1) value = 1;
    if (value > 20) value = 20;

    input.value = value.toString();
    gv.soDeTaiToiDa = value;
    gv.soDeTaiConLai = Math.max(0, value - (gv.soDeTaiDangHuongDan || 0));
  }

  luuGioiHan(gv: GiangVienResponse): void {
    if (!gv.soDeTaiToiDa || gv.soDeTaiToiDa < 1) {
      this.toastr.warning('Số đề tài tối đa phải từ 1 đến 20');
      return;
    }

    this.savingId = gv.id;

    this.boMonService.capNhatGioiHanDeTai(gv.id, gv.soDeTaiToiDa).subscribe({
      next: (res) => {
        if (res.success) {
          this.toastr.success('Cập nhật thành công');
          // Cập nhật lại dữ liệu từ server
          const index = this.giangVienList.findIndex(x => x.id === gv.id);
          if (index !== -1 && res.data) {
            this.giangVienList[index] = res.data;
          }
          this.filterGiangVien();
        }
        this.savingId = null;
      },
      error: (err) => {
        this.toastr.error(err.error?.message || 'Cập nhật thất bại');
        this.savingId = null;
      }
    });
  }
}

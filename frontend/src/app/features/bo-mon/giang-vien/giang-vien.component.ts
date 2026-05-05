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
          <i class="bi bi-person-badge text-primary"></i>
        </div>
        <div>
          <h2>Quản lý Giảng viên</h2>
          <p class="mb-0">Xem danh sách giảng viên theo bộ môn</p>
        </div>
      </div>
      <span class="badge bg-primary">{{ giangVienList.length }} giảng viên</span>
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
                <th style="width: 100px">Học vị</th>
                <th style="width: 160px">Bộ môn</th>
                <th>Email</th>
                <th style="width: 120px">Vai trò</th>
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
                <td><span >{{ gv.tenBoMon || '-' }}</span></td>
                <td class="text-muted">{{ gv.email }}</td>
                <td>
                  <span *ngIf="gv.laLanhDao" >Lãnh đạo BM</span>
                  <span *ngIf="!gv.laLanhDao" >Giảng viên</span>
                </td>
              </tr>
              <tr *ngIf="filteredGiangVienList.length === 0">
                <td colspan="6" class="text-center py-5">
                  <div class="empty-state">
                    <i class="bi bi-person-badge fs-1 d-block mb-3"></i>
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
  `
})
export class GiangVienBoMonComponent implements OnInit {
  giangVienList: GiangVienResponse[] = [];
  filteredGiangVienList: GiangVienResponse[] = [];
  searchText = '';

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
}

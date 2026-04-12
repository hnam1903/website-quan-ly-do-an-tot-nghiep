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
    <div class="page-header d-flex justify-content-between align-items-center">
      <div>
        <h2>Quản lý Giảng viên</h2>
       
      </div>
      <div class="d-flex align-items-center">
        <span class="badge bg-primary me-3">{{ giangVienList.length }} giảng viên</span>
        
      </div>
    </div>

    <div class="card">
      <div class="card-body">
        <div class="row mb-3">
          <div class="col-md-4">
            <input type="text" class="form-control" placeholder="Tìm kiếm theo tên, email..."
                   [(ngModel)]="searchText" (input)="filterGiangVien()">
          </div>
        </div>
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>STT</th>
                <th>Họ tên</th>
                <th>Học vị</th>
                <th>Email</th>
                <th>Vai trò</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let gv of filteredGiangVienList; let i = index">
                <td>{{ i + 1 }}</td>
                <td>
                  <strong>{{ gv.hoTen }}</strong>
                </td>
                <td>{{ gv.hocVi || '-' }}</td>
                <td>{{ gv.email }}</td>
                <td>
                  <span *ngIf="gv.laLanhDao" class="badge bg-danger">Lãnh đạo BM</span>
                  <span *ngIf="!gv.laLanhDao" class="badge bg-secondary">Giảng viên</span>
                </td>
              </tr>
              <tr *ngIf="filteredGiangVienList.length === 0">
                <td colspan="5" class="text-center text-muted py-4">
                  <i class="bi bi-person-badge fs-1 d-block mb-2"></i>
                  Không có giảng viên nào
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

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { DashboardResponse } from '../../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page-header">
      <h2>Dashboard</h2>
      <p class="text-muted">Tổng quan hệ thống</p>
    </div>

    <div *ngIf="dashboard" class="row">
      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-body text-center">
            <h1 class="text-primary">{{ dashboard.tongSoGiangVien }}</h1>
            <p class="text-muted mb-0">Giảng viên</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-body text-center">
            <h1 class="text-success">{{ dashboard.tongSoSinhVien }}</h1>
            <p class="text-muted mb-0">Sinh viên</p>
          </div>
        </div>
      </div>
      
      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-body text-center">
            <h1 class="text-info">{{ dashboard.tongSoDeTai }}</h1>
            <p class="text-muted mb-0">Đề tài</p>
          </div>
        </div>
      </div>
      


      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">Đang thực hiện</h5>
          </div>
          <div class="card-body text-center">
            <h2 class="text-primary">{{ dashboard.deTaiDangThucHien }}</h2>
            <p class="text-muted mb-0">đề tài</p>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">Hoàn thành</h5>
          </div>
          <div class="card-body text-center">
            <h2 class="text-success">{{ dashboard.deTaiHoanThanh }}</h2>
            <p class="text-muted mb-0">đề tài</p>
          </div>
        </div>
      </div>

      <div class="col-md-4 mb-4">
        <div class="card">
          <div class="card-header bg-danger text-white">
            <h5 class="mb-0">Không đạt</h5>
          </div>
          <div class="card-body text-center">
            <h2 class="text-danger">{{ dashboard.deTaiKhongDat }}</h2>
            <p class="text-muted mb-0">đề tài</p>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center mt-4" *ngIf="!dashboard">
      <p>Đang tải dữ liệu...</p>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  dashboard: DashboardResponse | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.adminService.getDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboard = res.data;
        }
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
      }
    });
  }
}

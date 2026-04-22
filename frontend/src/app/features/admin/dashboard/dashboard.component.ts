import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { AuthService } from '../../../core/services/auth.service';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DashboardResponse, BoMonResponse, UserResponse } from '../../../core/models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  currentUser: UserResponse | null = null;
  dashboard: DashboardResponse | null = null;
  boMons: BoMonResponse[] = [];
  loading = true;

  public trangThaiChartData: ChartData<'doughnut'> = {
    labels: ['Chờ duyệt', 'Đang thực hiện', 'Hoàn thành', 'Không đạt'],
    datasets: [{
      data: [0, 0, 0, 0],
      backgroundColor: [
        'rgba(255, 193, 7, 0.8)',
        'rgba(54, 162, 235, 0.8)',
        'rgba(40, 167, 69, 0.8)',
        'rgba(255, 99, 132, 0.8)'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  public trangThaiChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } },
      title: { display: true, text: 'Tỷ lệ đề tài theo trạng thái', font: { size: 14, weight: 'bold' } }
    }
  };

  public boMonChartData: ChartData<'bar'> = {
    labels: [],
    datasets: [
      { data: [], label: 'Đề tài', backgroundColor: 'rgba(54, 162, 235, 0.8)' },
      { data: [], label: 'Sinh viên', backgroundColor: 'rgba(75, 192, 192, 0.8)' },
      { data: [], label: 'Giảng viên', backgroundColor: 'rgba(153, 102, 255, 0.8)' }
    ]
  };

  public boMonChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { position: 'bottom', labels: { padding: 15, usePointStyle: true } },
      title: { display: true, text: 'Thống kê theo Bộ môn', font: { size: 14, weight: 'bold' } }
    },
    scales: {
      y: { beginAtZero: true, title: { display: true, text: 'Số lượng' } }
    }
  };

  constructor(
    private adminService: AdminService,
    private authService: AuthService
  ) {
    this.currentUser = this.authService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadDashboard();
    this.loadBoMon();
  }

  loadDashboard(): void {
    this.adminService.getDashboard().subscribe({
      next: (res) => {
        if (res.success) {
          this.dashboard = res.data;
          this.updateCharts();
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard:', err);
        this.loading = false;
      }
    });
  }

  loadBoMon(): void {
    this.adminService.getAllBoMon().subscribe({
      next: (res) => {
        if (res.success) {
          this.boMons = res.data || [];
          this.updateBoMonChart();
        }
      }
    });
  }

  refresh(): void {
    this.loadDashboard();
    this.loadBoMon();
  }

  updateCharts(): void {
    if (!this.dashboard) return;

    this.trangThaiChartData.datasets[0].data = [
      this.dashboard.deTaiChoDuyet,
      this.dashboard.deTaiDangThucHien,
      this.dashboard.deTaiHoanThanh,
      this.dashboard.deTaiKhongDat
    ];
  }

  updateBoMonChart(): void {
    if (this.boMons.length === 0) return;

    this.boMonChartData.labels = this.boMons.map(bm => bm.tenBoMon);
    this.boMonChartData.datasets[0].data = this.boMons.map(bm => bm.soLuongDeTai || 0);
    this.boMonChartData.datasets[1].data = this.boMons.map(bm => bm.soLuongSinhVien || 0);
    this.boMonChartData.datasets[2].data = this.boMons.map(bm => bm.soLuongGiangVien || 0);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiResponse, UserResponse, DeTaiResponse, SinhVienResponse, GiangVienResponse, ThongKePhanCongResponse } from '../../../core/models/models';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';

interface ThongKeDiem {
  tongDeTai: number;
  deTaiCoDiemHuongDan: number;
  deTaiCoDiemPhanBien: number;
  deTaiCoDiemBaoVe: number;
  deTaiHoanThanh: number;
  diemHuongDanTrungBinh: number;
  diemPhanBienTrungBinh: number;
  diemBaoVeTrungBinh: number;
  diemHuongDanCaoNhat: number;
  diemPhanBienCaoNhat: number;
  diemBaoVeCaoNhat: number;
  diemHuongDanThapNhat: number;
  diemPhanBienThapNhat: number;
  diemBaoVeThapNhat: number;
  // Điểm tổng bảo vệ
  diemTongBaoVeTrungBinh: number;
  diemTongBaoVeCaoNhat: number;
  diemTongBaoVeThapNhat: number;
}

@Component({
  selector: 'app-lanh-dao-bo-mon-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, NgChartsModule],
  templateUrl: './lanh-dao-bo-mon-dashboard.component.html',
  styleUrls: ['./lanh-dao-bo-mon-dashboard.component.scss']
})
export class LanhDaoBoMonDashboardComponent implements OnInit {

  userInfo: UserResponse | null = null;
  
  // Thống kê tổng quan
  tongDeTai: number = 0;
  tongGiangVien: number = 0;
  tongSinhVien: number = 0;
  
  // Đề tài theo trạng thái
  deTaiDangThucHien: number = 0;
  deTaiHoanThanh: number = 0;
  deTaiKhongDat: number = 0;
  
  // Hội đồng
  soHoiDong: number = 0;
  
  // Thống kê phân công
  thongKePhanCong: ThongKePhanCongResponse | null = null;
  
  // Thống kê điểm
  thongKeDiem: ThongKeDiem | null = null;
  
  // Chart: Bar điểm trung bình
  public diemChartData: ChartData<'bar'> = {
    labels: ['HD', 'PB', 'Tổng BV'],
    datasets: [
      { 
        data: [0, 0, 0], 
        label: 'Cao nhất',
        backgroundColor: 'rgba(40, 167, 69, 0.8)',
        borderColor: 'rgba(40, 167, 69, 1)',
        borderWidth: 1
      },
      { 
        data: [0, 0, 0], 
        label: 'Trung bình',
        backgroundColor: 'rgba(54, 162, 235, 0.8)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      },
      { 
        data: [0, 0, 0], 
        label: 'Thấp nhất',
        backgroundColor: 'rgba(255, 193, 7, 0.8)',
        borderColor: 'rgba(255, 193, 7, 1)',
        borderWidth: 1
      }
    ]
  };

  public diemChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { 
        position: 'bottom',
        labels: { padding: 20, usePointStyle: true }
      },
      title: { 
        display: true, 
        text: 'Biểu đồ điểm trung bình theo giai đoạn', 
        font: { size: 16, weight: 'bold' },
        padding: 15
      },
      tooltip: {
        callbacks: {
          afterLabel: (context) => {
            const labels = ['HD: Hướng dẫn', 'PB: Phản biện', 'BV: Bảo vệ'];
            return labels[context.dataIndex];
          }
        }
      }
    },
    scales: {
      y: { 
        min: 0, 
        max: 10, 
        title: { display: true, text: 'Điểm (thang 10)', font: { weight: 'bold' } },
        ticks: { stepSize: 1 }
      }
    }
  };

  // Chart: Tỷ lệ có điểm
  public tyLeChartData: ChartData<'doughnut'> = {
    labels: ['Có ĐH', 'Có PB', 'Có BV'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 99, 132, 0.7)']
    }]
  };

  public tyLeChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { position: 'bottom' },
      title: { display: true, text: 'Tỷ lệ SV có điểm' }
    }
  };
  
  loading = true;
  error: string | null = null;

  constructor(
    private boMonService: BoMonService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getCurrentUser();
    this.loadAllData();
  }

  private loadAllData(): void {
    this.loading = true;
    this.error = null;

    const boMonId = this.userInfo?.boMonId;

    // Load đề tài
    this.boMonService.getDeTai(undefined, boMonId).subscribe({
      next: (res: ApiResponse<DeTaiResponse[]>) => {
        const deTais = res.data || [];
        this.tongDeTai = deTais.length;
        
        this.deTaiDangThucHien = deTais.filter(dt => 
          dt.trangThai === 'DANG_THUC_HIEN' ||
          dt.trangThai === 'DA_NOP_BAO_CAO' ||
          dt.trangThai === 'DAT_GVHD' ||
          dt.trangThai === 'CHO_PHAN_BIEN' ||
          dt.trangThai === 'DAT_PHAN_BIEN' ||
          dt.trangThai === 'DANG_BAO_VE'
        ).length;
        
        this.deTaiHoanThanh = deTais.filter(dt => dt.trangThai === 'HOAN_THANH').length;
        
        this.deTaiKhongDat = deTais.filter(dt => 
          dt.trangThai === 'BI_TU_CHOI' ||
          dt.trangThai === 'KHONG_DAT_GVHD' ||
          dt.trangThai === 'KHONG_DAT_PHAN_BIEN' ||
          dt.trangThai === 'KHONG_DAT_BAO_VE'
        ).length;
      },
      error: () => {
        this.tongDeTai = 0;
        this.deTaiDangThucHien = 0;
        this.deTaiHoanThanh = 0;
        this.deTaiKhongDat = 0;
      }
    });

    // Load giảng viên
    this.boMonService.getGiangVien(boMonId).subscribe({
      next: (res: ApiResponse<GiangVienResponse[]>) => {
        this.tongGiangVien = res.data?.length || 0;
      },
      error: () => {
        this.tongGiangVien = 0;
      }
    });

    // Load sinh viên
    this.boMonService.getSinhVien(boMonId).subscribe({
      next: (res: ApiResponse<SinhVienResponse[]>) => {
        this.tongSinhVien = res.data?.length || 0;
      },
      error: () => {
        this.tongSinhVien = 0;
      }
    });

    // Load hội đồng
    this.boMonService.getHoiDongBaoVe().subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.soHoiDong = res.data?.length || 0;
      },
      error: () => {
        this.soHoiDong = 0;
      }
    });

    // Load thống kê điểm
    this.boMonService.getThongKeDiem().subscribe({
      next: (res: ApiResponse<any>) => {
        this.thongKeDiem = res.data;
        this.updateCharts();
      },
      error: () => {
        this.thongKeDiem = null;
      }
    });

    // Load thống kê phân công
    this.boMonService.getThongKePhanCong().subscribe({
      next: (res: ApiResponse<ThongKePhanCongResponse>) => {
        this.thongKePhanCong = res.data;
        this.loading = false;
      },
      error: () => {
        this.thongKePhanCong = null;
        this.loading = false;
      }
    });
  }

  private updateCharts(): void {
    if (!this.thongKeDiem) return;
    
    // Update bar chart
    this.diemChartData.datasets[0].data = [
      this.thongKeDiem.diemHuongDanCaoNhat,
      this.thongKeDiem.diemPhanBienCaoNhat,
      this.thongKeDiem.diemTongBaoVeCaoNhat
    ];
    this.diemChartData.datasets[1].data = [
      this.thongKeDiem.diemHuongDanTrungBinh,
      this.thongKeDiem.diemPhanBienTrungBinh,
      this.thongKeDiem.diemTongBaoVeTrungBinh
    ];
    this.diemChartData.datasets[2].data = [
      this.thongKeDiem.diemHuongDanThapNhat,
      this.thongKeDiem.diemPhanBienThapNhat,
      this.thongKeDiem.diemTongBaoVeThapNhat
    ];
  }

  refresh(): void {
    this.loadAllData();
  }
}

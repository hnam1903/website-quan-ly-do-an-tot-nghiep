import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiResponse, PhanCongHuongDanResponse, DeTaiResponse, DotBaoCaoTienDoResponse, UserResponse } from '../../../core/models/models';

@Component({
  selector: 'app-giang-vien-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './giang-vien-dashboard.component.html',
  styleUrls: ['./giang-vien-dashboard.component.scss']
})
export class GiangVienDashboardComponent implements OnInit {

  userInfo: UserResponse | null = null;
  danhSachChoDuyet: PhanCongHuongDanResponse[] = [];
  danhSachHuongDan: PhanCongHuongDanResponse[] = [];
  danhSachPhanBien: DeTaiResponse[] = [];
  danhSachDotBaoCao: DotBaoCaoTienDoResponse[] = [];
  danhSachHoiDong: any[] = [];

  loading = true;
  error: string | null = null;

  constructor(
    private gvService: GiangVienService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getCurrentUser();
    this.loadAllData();
  }

  private loadAllData(): void {
    this.loading = true;
    this.error = null;

    // Load SV chờ duyệt
    this.gvService.getDeTaiChoDuyet().subscribe({
      next: (res: ApiResponse<PhanCongHuongDanResponse[]>) => {
        this.danhSachChoDuyet = res.data || [];
      },
      error: () => {
        this.danhSachChoDuyet = [];
      }
    });

    // Load SV đang hướng dẫn
    this.gvService.getSinhVienHuongDan().subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.danhSachHuongDan = res.data || [];
      },
      error: () => {
        this.danhSachHuongDan = [];
      }
    });

    // Load SV phản biện
    this.gvService.getDeTaiPhanBien().subscribe({
      next: (res: ApiResponse<DeTaiResponse[]>) => {
        this.danhSachPhanBien = res.data || [];
      },
      error: () => {
        this.danhSachPhanBien = [];
      }
    });

    // Load đợt báo cáo tiến độ
    this.gvService.getDotBaoCaoTienDo().subscribe({
      next: (res: ApiResponse<DotBaoCaoTienDoResponse[]>) => {
        this.danhSachDotBaoCao = res.data || [];
        this.loading = false;
      },
      error: () => {
        this.danhSachDotBaoCao = [];
        this.loading = false;
      }
    });

    // Load hội đồng bảo vệ
    this.gvService.getHoiDongBaoVe().subscribe({
      next: (res: ApiResponse<any[]>) => {
        this.danhSachHoiDong = res.data || [];
      },
      error: () => {
        this.danhSachHoiDong = [];
      }
    });
  }

  // Computed properties
  get soSinhVienChoDuyet(): number {
    return this.danhSachChoDuyet.length;
  }

  get soSinhVienHuongDan(): number {
    return this.danhSachHuongDan.length;
  }

  get soSinhVienPhanBien(): number {
    return this.danhSachPhanBien.length;
  }

  get soHoiDong(): number {
    return this.danhSachHoiDong.length;
  }

  get soDeTaiChuaChamDiemHD(): number {
    return this.danhSachHuongDan.filter(sv => !sv.daChamDiem).length;
  }

  get soDeTaiChuaChamDiemPB(): number {
    return this.danhSachPhanBien.filter(dt => !dt.daChamDiemPB).length;
  }

  get dotBaoCaoHienTai(): DotBaoCaoTienDoResponse | null {
    return this.danhSachDotBaoCao.find(dot => dot.trangThai === 'MO') || null;
  }

  getDotTrangThaiClass(trangThai: string): string {
    const classMap: { [key: string]: string } = {
      'MO': 'bg-success',
      'DONG': 'bg-secondary',
      'DA_KET_THUC': 'bg-danger'
    };
    return classMap[trangThai] || 'bg-secondary';
  }

  getDotTrangThaiText(trangThai: string): string {
    const textMap: { [key: string]: string } = {
      'MO': 'Mở',
      'DONG': 'Đóng',
      'DA_KET_THUC': 'Đã kết thúc'
    };
    return textMap[trangThai] || trangThai;
  }

  refresh(): void {
    this.loadAllData();
  }
}

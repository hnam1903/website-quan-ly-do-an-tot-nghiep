import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SinhVienService } from '../../../core/services/sinh-vien.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeTaiResponse, ApiResponse, DiemHuongDanResponse, DiemPhanBienResponse, DotBaoCaoTienDoResponse, BaoCaoTienDoResponse, UserResponse } from '../../../core/models/models';

@Component({
  selector: 'app-sinh-vien-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sinh-vien-dashboard.component.html',
  styleUrls: ['./sinh-vien-dashboard.component.scss']
})
export class SinhVienDashboardComponent implements OnInit {

  userInfo: UserResponse | null = null;
  deTai: DeTaiResponse | null = null;
  ketQuaHD: DiemHuongDanResponse | null = null;
  ketQuaPB: DiemPhanBienResponse | null = null;
  ketQuaBV: DeTaiResponse | null = null;
  lichBaoVe: DeTaiResponse | null = null;
  danhSachBaoCaoTienDo: BaoCaoTienDoResponse[] = [];

  loading = true;
  error: string | null = null;

  constructor(
    private sinhVienService: SinhVienService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getCurrentUser();
    this.loadAllData();
  }

  private loadAllData(): void {
    this.loading = true;
    this.error = null;

    this.sinhVienService.getDeTaiCuaToi().subscribe({
      next: (res: ApiResponse<DeTaiResponse>) => {
        this.deTai = res.data;
        this.loading = false;
      },
      error: () => {
        this.deTai = null;
        this.loading = false;
      }
    });

    this.sinhVienService.getKetQuaHuongDan().subscribe({
      next: (res: ApiResponse<DiemHuongDanResponse>) => {
        this.ketQuaHD = res.data;
      },
      error: () => this.ketQuaHD = null
    });

    this.sinhVienService.getKetQuaPhanBien().subscribe({
      next: (res: ApiResponse<DiemPhanBienResponse>) => {
        this.ketQuaPB = res.data;
      },
      error: () => this.ketQuaPB = null
    });

    this.sinhVienService.getKetQuaBaoVe().subscribe({
      next: (res: ApiResponse<DeTaiResponse>) => {
        this.ketQuaBV = res.data;
      },
      error: () => this.ketQuaBV = null
    });

    this.sinhVienService.getLichBaoVe().subscribe({
      next: (res: ApiResponse<DeTaiResponse>) => {
        this.lichBaoVe = res.data;
      },
      error: () => this.lichBaoVe = null
    });

    this.sinhVienService.getBaoCaoTienDoCuaToi().subscribe({
      next: (res: ApiResponse<BaoCaoTienDoResponse[]>) => {
        this.danhSachBaoCaoTienDo = res.data || [];
      },
      error: () => this.danhSachBaoCaoTienDo = []
    });
  }

  getTrangThaiText(): string {
    if (!this.deTai?.trangThai) return 'Chưa đăng ký đề tài';
    const statusMap: { [key: string]: string } = {
      'CHO_DUYET': 'Chờ duyệt',
      'DA_GUI_BO_MON': 'Đã gửi BM',
      'BI_TU_CHOI': 'Bị từ chối',
      'CHO_BO_MON_DUYET': 'Chờ BM duyệt',
      'CHO_GV_DUYET': 'Chờ GV duyệt',
      'CHO_GV_DUYET_LAI': 'Chờ GV duyệt lại',
      'DANG_THUC_HIEN': 'Đang thực hiện',
      'DA_NOP_BAO_CAO': 'Đã nộp báo cáo',
      'DAT_GVHD': 'Đạt GVHD',
      'KHONG_DAT_GVHD': 'Không đạt GVHD',
      'CHO_PHAN_BIEN': 'Chờ phân công PB',
      'DAT_PHAN_BIEN': 'Đạt PB',
      'KHONG_DAT_PHAN_BIEN': 'Không đạt PB',
      'DANG_BAO_VE': 'Đang bảo vệ',
      'HOAN_THANH': 'Hoàn thành',
      'KHONG_DAT_BAO_VE': 'Không đạt bảo vệ'
    };
    return statusMap[this.deTai.trangThai] || this.deTai.trangThai;
  }

  getTrangThaiClass(): string {
    if (!this.deTai?.trangThai) return 'bg-secondary';
    const classMap: { [key: string]: string } = {
      'CHO_DUYET': 'bg-warning text-dark',
      'DA_GUI_BO_MON': 'bg-info',
      'BI_TU_CHOI': 'bg-danger',
      'CHO_BO_MON_DUYET': 'bg-warning text-dark',
      'CHO_GV_DUYET': 'bg-warning text-dark',
      'CHO_GV_DUYET_LAI': 'bg-warning text-dark',
      'DANG_THUC_HIEN': 'bg-primary',
      'DA_NOP_BAO_CAO': 'bg-info',
      'DAT_GVHD': 'bg-success',
      'KHONG_DAT_GVHD': 'bg-danger',
      'CHO_PHAN_BIEN': 'bg-warning text-dark',
      'DAT_PHAN_BIEN': 'bg-success',
      'KHONG_DAT_PHAN_BIEN': 'bg-danger',
      'DANG_BAO_VE': 'bg-primary',
      'HOAN_THANH': 'bg-success',
      'KHONG_DAT_BAO_VE': 'bg-danger'
    };
    return classMap[this.deTai.trangThai] || 'bg-secondary';
  }

  refresh(): void {
    this.loadAllData();
  }
}

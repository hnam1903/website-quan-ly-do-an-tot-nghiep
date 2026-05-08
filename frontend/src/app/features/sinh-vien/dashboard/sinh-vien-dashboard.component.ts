import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SinhVienService } from '../../../core/services/sinh-vien.service';
import { AuthService } from '../../../core/services/auth.service';
import { DeTaiResponse, ApiResponse, DiemHuongDanResponse, DiemPhanBienResponse, DotBaoCaoTienDoResponse, BaoCaoTienDoResponse, UserResponse } from '../../../core/models/models';

interface TimelineStep {
  key: string;
  label: string;
  icon: string;
  status: 'completed' | 'active' | 'pending';
  sublabel?: string;
  diem?: number;
}

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

  timelineSteps: TimelineStep[] = [];

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
        this.buildTimeline();
        this.loading = false;
      },
      error: () => {
        this.deTai = null;
        this.buildTimeline();
        this.loading = false;
      }
    });

    this.sinhVienService.getKetQuaHuongDan().subscribe({
      next: (res: ApiResponse<DiemHuongDanResponse>) => {
        this.ketQuaHD = res.data;
        this.buildTimeline();
      },
      error: () => this.ketQuaHD = null
    });

    this.sinhVienService.getKetQuaPhanBien().subscribe({
      next: (res: ApiResponse<DiemPhanBienResponse>) => {
        this.ketQuaPB = res.data;
        this.buildTimeline();
      },
      error: () => this.ketQuaPB = null
    });

    this.sinhVienService.getKetQuaBaoVe().subscribe({
      next: (res: ApiResponse<DeTaiResponse>) => {
        this.ketQuaBV = res.data;
        this.buildTimeline();
      },
      error: () => this.ketQuaBV = null
    });

    this.sinhVienService.getLichBaoVe().subscribe({
      next: (res: ApiResponse<DeTaiResponse>) => {
        this.lichBaoVe = res.data;
        this.buildTimeline();
      },
      error: () => this.lichBaoVe = null
    });

    this.sinhVienService.getBaoCaoTienDoCuaToi().subscribe({
      next: (res: ApiResponse<BaoCaoTienDoResponse[]>) => {
        this.danhSachBaoCaoTienDo = res.data || [];
        this.buildTimeline();
      },
      error: () => this.danhSachBaoCaoTienDo = []
    });
  }

  private buildTimeline(): void {
    const trangThai = this.deTai?.trangThai;
    const gvhd = this.deTai?.hoTenGiangVienHuongDan;
    const diemHD = this.ketQuaHD?.diem;
    const diemPB = this.ketQuaPB?.diem;

    // Xác định step nào completed dựa trên trạng thái đề tài
    const isCompleted = (statuses: string[]): boolean => {
      if (!trangThai) return false;
      if (trangThai === 'HOAN_THANH' || trangThai === 'KHONG_DAT_BAO_VE') return true;
      return statuses.includes(trangThai);
    };

    // Xác định index của bước active (bước đầu tiên chưa completed)
    const getActiveIndex = (): number => {
      if (!this.deTai) return -1; // Chưa đăng ký
      
      // Theo flow: DANG_KY -> BM_DUYET -> PHAN_CONG -> DANG_THUC_HIEN -> CHAM_HD -> PHAN_CONG_PB -> CHAM_PB -> BAO_VE -> HOAN_THANH
      if (!isCompleted(['CHO_BO_MON_DUYET', 'BI_TU_CHOI', 'CHO_GV_DUYET', 'GV_TU_CHOI', 'CHO_GV_PHAN_CONG', 'CHO_BO_MON_PHAN_CONG', 'DANG_THUC_HIEN', 'DA_NOP_BAO_CAO'])) {
        return 0; // Đăng ký
      }
      if (isCompleted(['CHO_BO_MON_DUYET']) && !isCompleted(['BI_TU_CHOI', 'CHO_GV_DUYET', 'GV_TU_CHOI', 'CHO_GV_PHAN_CONG', 'CHO_BO_MON_PHAN_CONG', 'DANG_THUC_HIEN', 'DA_NOP_BAO_CAO'])) {
        return 1; // BM Duyệt
      }
      if (isCompleted(['CHO_GV_PHAN_CONG', 'CHO_BO_MON_PHAN_CONG']) && !isCompleted(['DANG_THUC_HIEN', 'DA_NOP_BAO_CAO'])) {
        return 2; // Phân công GVHD
      }
      if (isCompleted(['DANG_THUC_HIEN', 'DA_NOP_BAO_CAO']) && !isCompleted(['DAT_GVHD', 'KHONG_DAT_GVHD'])) {
        return 3; // Đang thực hiện
      }
      if (isCompleted(['DAT_GVHD', 'KHONG_DAT_GVHD']) && !isCompleted(['CHO_PHAN_BIEN', 'DAT_PHAN_BIEN', 'KHONG_DAT_PHAN_BIEN'])) {
        return 4; // Chấm điểm HD
      }
      if (isCompleted(['CHO_PHAN_BIEN']) && !isCompleted(['DAT_PHAN_BIEN', 'KHONG_DAT_PHAN_BIEN'])) {
        return 5; // Phân công PB
      }
      if (isCompleted(['DAT_PHAN_BIEN', 'KHONG_DAT_PHAN_BIEN']) && !isCompleted(['DANG_BAO_VE', 'HOAN_THANH', 'KHONG_DAT_BAO_VE'])) {
        return 6; // Chấm điểm PB
      }
      if (isCompleted(['DANG_BAO_VE']) && !isCompleted(['HOAN_THANH', 'KHONG_DAT_BAO_VE'])) {
        return 7; // Bảo vệ
      }
      if (isCompleted(['HOAN_THANH', 'KHONG_DAT_BAO_VE'])) {
        return 8; // Hoàn thành
      }
      return 3; // Mặc định: đang thực hiện
    };

    const activeIndex = getActiveIndex();

    const steps: TimelineStep[] = [
      {
        key: 'DANG_KY',
        label: 'Đăng ký đề tài',
        icon: 'edit',
        status: activeIndex >= 0 ? 'completed' : 'pending',
        sublabel: this.deTai?.tenDeTai
      },
      {
        key: 'BM_DUYET',
        label: 'Bộ môn duyệt',
        icon: 'check_circle',
        status: activeIndex >= 1 ? 'completed' : activeIndex === 1 ? 'active' : 'pending'
      },
      {
        key: 'PHAN_CONG_GVHD',
        label: 'GV Hướng dẫn',
        icon: 'person_add',
        status: gvhd ? 'completed' : (activeIndex >= 2 ? 'completed' : (activeIndex === 2 ? 'active' : 'pending')),
        sublabel: gvhd || undefined
      },
      {
        key: 'DANG_THUC_HIEN',
        label: 'Đang thực hiện',
        icon: 'construction',
        status: activeIndex >= 3 ? 'completed' : (activeIndex === 3 ? 'active' : 'pending'),
        sublabel: this.danhSachBaoCaoTienDo.length > 0 
          ? 'Đã nộp báo cáo'
          : undefined
      },
      {
        key: 'CHAM_DIEM_HD',
        label: 'Chấm điểm HD',
        icon: 'grade',
        status: diemHD ? 'completed' : (activeIndex >= 4 ? 'completed' : (activeIndex === 4 ? 'active' : 'pending')),
        diem: diemHD || undefined,
        sublabel: diemHD ? `Điểm: ${diemHD}` : undefined
      },
      {
        key: 'PHAN_CONG_PB',
        label: 'GV Phản biện',
        icon: 'assignment_ind',
        status: this.deTai?.hoTenGiangVienPhanBien ? 'completed' : (activeIndex >= 5 ? 'completed' : (activeIndex === 5 ? 'active' : 'pending')),
        sublabel: this.deTai?.hoTenGiangVienPhanBien || undefined
      },
      {
        key: 'CHAM_DIEM_PB',
        label: 'Chấm điểm PB',
        icon: 'rate_review',
        status: diemPB ? 'completed' : (activeIndex >= 6 ? 'completed' : (activeIndex === 6 ? 'active' : 'pending')),
        diem: diemPB || undefined,
        sublabel: diemPB ? `Điểm: ${diemPB}` : undefined
      },
      {
        key: 'BAO_VE',
        label: 'Bảo vệ',
        icon: 'groups',
        status: activeIndex >= 7 ? 'completed' : (activeIndex === 7 ? 'active' : 'pending'),
        sublabel: this.lichBaoVe?.ngayBaoVe 
          ? `Ngày: ${this.formatDate(this.lichBaoVe.ngayBaoVe)}`
          : undefined
      },
      {
        key: 'HOAN_THANH',
        label: 'Hoàn thành',
        icon: 'emoji_events',
        status: trangThai === 'HOAN_THANH' ? 'completed' : 'pending',
        diem: this.deTai?.diemTongBaoVe || undefined,
        sublabel: this.deTai?.diemTongBaoVe 
          ? `Điểm bảo vệ: ${this.deTai.diemTongBaoVe}`
          : undefined
      }
    ];

    this.timelineSteps = steps;
  }

  private formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN');
  }

  getTrangThaiText(): string {
    if (!this.deTai?.trangThai) return 'Chưa đăng ký đề tài';
    const statusMap: { [key: string]: string } = {
      'BI_TU_CHOI': 'Bị từ chối',
      'CHO_BO_MON_DUYET': 'Chờ BM duyệt',
      'CHO_GV_DUYET': 'Chờ GV duyệt',
      'GV_TU_CHOI': 'GV từ chối',
      'CHO_GV_PHAN_CONG': 'Chờ phân công GVHD',
      'CHO_BO_MON_PHAN_CONG': 'Chờ BM xác nhận',
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
      'BI_TU_CHOI': 'bg-danger',
      'CHO_BO_MON_DUYET': 'bg-warning text-dark',
      'CHO_GV_DUYET': 'bg-warning text-dark',
      'GV_TU_CHOI': 'bg-warning text-dark',
      'CHO_GV_PHAN_CONG': 'bg-warning text-dark',
      'CHO_BO_MON_PHAN_CONG': 'bg-warning text-dark',
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

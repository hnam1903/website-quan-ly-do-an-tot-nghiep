import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { GiangVienService } from '../../../core/services/giang-vien.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiResponse, UserResponse, DeTaiResponse, PhanCongHuongDanResponse, HoiDongBaoVeResponse, DotDangKyResponse } from '../../../core/models/models';

interface TienTrinhGiaiDoan {
  ten: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  filterFn: (dt: DeTaiTienTrinh) => boolean;
  soLuong: number;
  daHoanThanh: number;
  dangXuLy: number;
}

interface DeTaiTienTrinh {
  id: number;
  tenDeTai: string;
  hoTenSinhVien: string;
  maSinhVien: string;
  lop: string;
  trangThai: string;
  dotDangKyId?: number;
  vaiTro: 'HUONG_DAN' | 'PHAN_BIEN' | 'HOI_DONG';
  diemHuongDan?: number;
  diemPhanBien?: number;
  diemBaoVe?: number;
  daChamDiemHD?: boolean;
  daChamDiemPB?: boolean;
  canChamDiemHD?: boolean;
  canChamDiemPB?: boolean;
}

@Component({
  selector: 'app-gv-theo-doi-tien-trinh',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './gv-theo-doi-tien-trinh.component.html',
  styleUrls: ['./gv-theo-doi-tien-trinh.component.scss']
})
export class GvTheoDoiTienTrinhComponent implements OnInit {
  userInfo: UserResponse | null = null;

  // Filter
  dotDangKyList: DotDangKyResponse[] = [];
  selectedDotId: number | null = null;

  // Data
  allDeTai: DeTaiTienTrinh[] = [];
  deTaiHuongDan: PhanCongHuongDanResponse[] = [];
  deTaiPhanBien: DeTaiResponse[] = [];
  deTaiHoiDong: HoiDongBaoVeResponse[] = [];

  // Cache filtered data by giaiDoan.ten
  private cachedDeTaiByGiaiDoan: Map<string, DeTaiTienTrinh[]> = new Map();
  private lastFilterDotId: number | null = null;
  
  // Giai đoạn tiến trình theo góc nhìn GV
  giaiDoans: TienTrinhGiaiDoan[] = [
    {
      ten: 'Đang hướng dẫn',
      icon: 'engineering',
      color: '#0d6efd',
      bgColor: 'rgba(13, 110, 253, 0.1)',
      borderColor: '#0d6efd',
      filterFn: (dt) => dt.trangThai === 'DANG_THUC_HIEN',
      soLuong: 0,
      daHoanThanh: 0,
      dangXuLy: 0
    },
    {
      ten: 'Chờ chấm hướng dẫn',
      icon: 'pending_actions',
      color: '#fd7e14',
      bgColor: 'rgba(253, 126, 20, 0.1)',
      borderColor: '#fd7e14',
      filterFn: (dt) => dt.trangThai === 'DA_NOP_BAO_CAO',
      soLuong: 0,
      daHoanThanh: 0,
      dangXuLy: 0
    },
    {
      ten: 'Chờ chấm phản biện',
      icon: 'rate_review',
      color: '#9333ea',
      bgColor: 'rgba(147, 51, 234, 0.1)',
      borderColor: '#9333ea',
      filterFn: (dt) => dt.trangThai === 'CHO_PHAN_BIEN',
      soLuong: 0,
      daHoanThanh: 0,
      dangXuLy: 0
    }
  ];
  
  // Tổng quan
  totalDeTai: number = 0;
  totalDaHoanThanh: number = 0;
  totalDangXuLy: number = 0;
  tiLeHoanThanh: number = 0;
  
  loading = true;
  error: string | null = null;

  constructor(
    private gvService: GiangVienService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getCurrentUser();
    this.loadDotList();
  }

  loadDotList(): void {
    this.gvService.getDotDangKy().subscribe({
      next: (res: any) => {
        if (res.success) {
          this.dotDangKyList = res.data || [];
          // Auto select first dot if none selected
          if (this.dotDangKyList.length > 0 && !this.selectedDotId) {
            this.selectedDotId = this.dotDangKyList[0].id;
          }
          this.loadData();
        }
      },
      error: () => {
        this.dotDangKyList = [];
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    const dotId = this.selectedDotId ?? undefined;

    this.gvService.getDeTaiHuongDan(dotId).subscribe({
      next: (res: ApiResponse<PhanCongHuongDanResponse[]>) => {
        this.deTaiHuongDan = res.data || [];
        
        this.gvService.getDeTaiPhanBien(dotId).subscribe({
          next: (resPB: ApiResponse<DeTaiResponse[]>) => {
            this.deTaiPhanBien = resPB.data || [];
            this.gvService.getHoiDongBaoVe(dotId).subscribe({
              next: (resHD: ApiResponse<HoiDongBaoVeResponse[]>) => {
                this.deTaiHoiDong = resHD.data || [];
                this.processData();
                this.loading = false;
              },
              error: () => {
                this.deTaiHoiDong = [];
                this.processData();
                this.loading = false;
              }
            });
          },
          error: () => {
            this.deTaiPhanBien = [];
            this.processData();
            this.loading = false;
          }
        });
      },
      error: (err) => {
        console.error('Error loading data:', err);
        this.deTaiHuongDan = [];
        this.loading = false;
        this.processData();
      }
    });
  }

  private processData(): void {
    this.allDeTai = [];
    
    // Thêm đề tài hướng dẫn
    this.deTaiHuongDan.forEach(dt => {
      let mappedTrangThai = dt.deTaiTrangThai || 'CHO_GV_DUYET';
      
      const canChamDiem = mappedTrangThai === 'DAT_GVHD' || mappedTrangThai === 'CHO_PHAN_BIEN' || mappedTrangThai === 'DAT_PHAN_BIEN';
      this.allDeTai.push({
        id: dt.deTaiId || 0,
        tenDeTai: dt.tenDeTai || '',
        hoTenSinhVien: dt.hoTenSinhVien || '',
        maSinhVien: dt.maSinhVien || '',
        lop: dt.lopSinhVien || '',
        trangThai: mappedTrangThai,
        dotDangKyId: dt.dotDangKyId ? Number(dt.dotDangKyId) : undefined,
        vaiTro: 'HUONG_DAN',
        diemHuongDan: dt.diemCham,
        daChamDiemHD: dt.daChamDiem,
        canChamDiemHD: canChamDiem && !dt.daChamDiem
      });
    });

    // Thêm đề tài phản biện
    this.deTaiPhanBien.forEach(dt => {
      if (!this.allDeTai.find(t => t.id === dt.id && t.vaiTro === 'PHAN_BIEN')) {
        const canChamDiem = dt.trangThai === 'DAT_PHAN_BIEN';
        this.allDeTai.push({
          id: dt.id,
          tenDeTai: dt.tenDeTai || '',
          hoTenSinhVien: dt.hoTenSinhVien || '',
          maSinhVien: dt.maSinhVien || '',
          lop: dt.lopSinhVien || '',
          trangThai: dt.trangThai || '',
          dotDangKyId: dt.dotDangKyId ? Number(dt.dotDangKyId) : undefined,
          vaiTro: 'PHAN_BIEN',
          diemPhanBien: dt.diemPhanBien,
          daChamDiemPB: dt.daChamDiemPB,
          canChamDiemPB: canChamDiem && !dt.daChamDiemPB
        });
      }
    });

    // Thêm đề tài hội đồng
    this.deTaiHoiDong.forEach(hd => {
      if (!this.allDeTai.find(t => t.id === hd.deTaiId && t.vaiTro === 'HOI_DONG')) {
        this.allDeTai.push({
          id: hd.deTaiId,
          tenDeTai: hd.tenDeTai || '',
          hoTenSinhVien: hd.hoTenSinhVien || '',
          maSinhVien: hd.maSinhVien || '',
          lop: hd.lopSinhVien || '',
          trangThai: hd.trangThaiDeTai || '',
          dotDangKyId: hd.dotDangKyId ? Number(hd.dotDangKyId) : undefined,
          vaiTro: 'HOI_DONG',
          diemBaoVe: hd.diemBaoVe
        });
      }
    });

    this.tinhToanGiaiDoan();
  }

  private tinhToanGiaiDoan(): void {
    // Clear cache if dot changed
    if (this.lastFilterDotId !== this.selectedDotId) {
      this.cachedDeTaiByGiaiDoan.clear();
      this.lastFilterDotId = this.selectedDotId;
    }

    // Filter theo đợt
    let filteredData = this.allDeTai;
    if (this.selectedDotId) {
      filteredData = this.allDeTai.filter(dt => dt.dotDangKyId === this.selectedDotId);
    }

    this.totalDeTai = filteredData.length;
    this.totalDaHoanThanh = 0;
    this.totalDangXuLy = 0;

    // Pre-compute and cache filtered data for each giaiDoan
    this.giaiDoans.forEach(gd => {
      const deTaiGiaiDoan = filteredData.filter(gd.filterFn);
      this.cachedDeTaiByGiaiDoan.set(gd.ten, deTaiGiaiDoan);
      
      gd.soLuong = deTaiGiaiDoan.length;
      gd.daHoanThanh = 0;
      gd.dangXuLy = deTaiGiaiDoan.length;
      this.totalDangXuLy += deTaiGiaiDoan.length;
    });

    this.tiLeHoanThanh = 0;
  }

  getDeTaiByGiaiDoan(giaiDoan: TienTrinhGiaiDoan): DeTaiTienTrinh[] {
    return this.cachedDeTaiByGiaiDoan.get(giaiDoan.ten) || [];
  }

  hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '108, 117, 125';
  }

  getTrangThaiDisplay(trangThai: string): { text: string; class: string; icon: string } {
    const map: { [key: string]: { text: string; class: string; icon: string } } = {
      'CHO_GV_DUYET': { text: 'Chờ duyệt', class: 'bg-warning text-dark', icon: 'pending' },
      'GV_TU_CHOI': { text: 'Từ chối', class: 'bg-danger', icon: 'cancel' },
      'DANG_THUC_HIEN': { text: 'Đang thực hiện', class: 'bg-primary', icon: 'engineering' },
      'DA_NOP_BAO_CAO': { text: 'Đã nộp BC', class: 'bg-info', icon: 'upload_file' },
      'DAT_GVHD': { text: 'Đạt HD', class: 'bg-success', icon: 'check_circle' },
      'CHO_PHAN_BIEN': { text: 'Chờ phản biện', class: 'bg-warning text-dark', icon: 'rate_review' },
      'DAT_PHAN_BIEN': { text: 'Đạt PB', class: 'bg-success', icon: 'verified' },
      'DANG_BAO_VE': { text: 'Đang bảo vệ', class: 'bg-primary', icon: 'event' },
      'HOAN_THANH': { text: 'Hoàn thành', class: 'bg-success', icon: 'task_alt' }
    };
    return map[trangThai] || { text: trangThai, class: 'bg-secondary', icon: 'help' };
  }

  getVaiTroDisplay(vaiTro: string): { text: string; class: string } {
    const map: { [key: string]: { text: string; class: string } } = {
      'HUONG_DAN': { text: 'Hướng dẫn', class: 'bg-primary' },
      'PHAN_BIEN': { text: 'Phản biện', class: 'bg-success' },
      'HOI_DONG': { text: 'Hội đồng', class: 'bg-danger' }
    };
    return map[vaiTro] || { text: vaiTro, class: 'bg-secondary' };
  }

  getTienDoGiaiDoan(giaiDoan: TienTrinhGiaiDoan): number {
    if (giaiDoan.soLuong === 0) return 0;
    return Math.round((giaiDoan.daHoanThanh / giaiDoan.soLuong) * 100);
  }

  onDotChange(): void {
    this.loadData();
  }

  refresh(): void {
    this.loadData();
  }
}

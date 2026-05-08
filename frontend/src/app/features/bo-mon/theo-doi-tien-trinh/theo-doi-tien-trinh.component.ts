import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { BoMonService } from '../../../core/services/bo-mon.service';
import { AuthService } from '../../../core/services/auth.service';
import { ApiResponse, UserResponse, DeTaiResponse, DotDangKyResponse } from '../../../core/models/models';

interface TienTrinhGiaiDoan {
  ten: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  trangThaiList: string[];
  soLuong: number;
  daHoanThanh: number;
  dangXuLy: number;
  choXuLy: number;
}

interface DeTaiTienTrinh {
  id: number;
  tenDeTai: string;
  hoTenSinhVien: string;
  maSinhVien: string;
  lop: string;
  trangThai: string;
  giangVienHuongDan: string;
  giangVienPhanBien: string;
  diemHuongDan?: number;
  diemPhanBien?: number;
  diemBaoVe?: number;
  hoanThanhHD?: boolean;
  hoanThanhPB?: boolean;
  hoanThanhBV?: boolean;
}

@Component({
  selector: 'app-theo-doi-tien-trinh',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './theo-doi-tien-trinh.component.html',
  styleUrls: ['./theo-doi-tien-trinh.component.scss']
})
export class TheoDoiTienTrinhComponent implements OnInit {
  userInfo: UserResponse | null = null;
  
  // Filter
  dotDangKyList: DotDangKyResponse[] = [];
  selectedDotId: number | null = null;
  
  // Data
  allDeTai: DeTaiResponse[] = [];
  deTaiTienTrinh: DeTaiTienTrinh[] = [];
  
  // Giai đoạn tiến trình
  giaiDoans: TienTrinhGiaiDoan[] = [
    {
      ten: 'Chờ duyệt & GVHD',
      icon: 'pending_actions',
      color: '#6c757d',
      bgColor: 'rgba(108, 117, 125, 0.1)',
      borderColor: '#6c757d',
      trangThaiList: ['CHO_BO_MON_DUYET', 'CHO_GV_PHAN_CONG', 'CHO_GV_DUYET', 'GV_TU_CHOI', 'CHO_BO_MON_PHAN_CONG'],
      soLuong: 0,
      daHoanThanh: 0,
      dangXuLy: 0,
      choXuLy: 0
    },
    {
      ten: 'Đang thực hiện',
      icon: 'engineering',
      color: '#0d6efd',
      bgColor: 'rgba(13, 110, 253, 0.1)',
      borderColor: '#0d6efd',
      trangThaiList: ['DANG_THUC_HIEN', 'DA_NOP_BAO_CAO'],
      soLuong: 0,
      daHoanThanh: 0,
      dangXuLy: 0,
      choXuLy: 0
    },
    {
      ten: 'Chờ phản biện',
      icon: 'rate_review',
      color: '#fd7e14',
      bgColor: 'rgba(253, 126, 20, 0.1)',
      borderColor: '#fd7e14',
      trangThaiList: ['DAT_GVHD', 'CHO_PHAN_BIEN'],
      soLuong: 0,
      daHoanThanh: 0,
      dangXuLy: 0,
      choXuLy: 0
    },
    {
      ten: 'Chờ bảo vệ',
      icon: 'event',
      color: '#dc3545',
      bgColor: 'rgba(220, 53, 69, 0.1)',
      borderColor: '#dc3545',
      trangThaiList: ['DAT_PHAN_BIEN', 'DANG_BAO_VE'],
      soLuong: 0,
      daHoanThanh: 0,
      dangXuLy: 0,
      choXuLy: 0
    },
    {
      ten: 'Kết thúc',
      icon: 'task_alt',
      color: '#198754',
      bgColor: 'rgba(25, 135, 84, 0.1)',
      borderColor: '#198754',
      trangThaiList: ['HOAN_THANH', 'BI_TU_CHOI', 'KHONG_DAT_GVHD', 'KHONG_DAT_PHAN_BIEN', 'KHONG_DAT_BAO_VE'],
      soLuong: 0,
      daHoanThanh: 0,
      dangXuLy: 0,
      choXuLy: 0
    }
  ];
  
  // Tổng quan
  totalDeTai: number = 0;
  totalDaHoanThanh: number = 0;
  totalDangXuLy: number = 0;
  totalChoXuLy: number = 0;
  tiLeHoanThanh: number = 0;
  
  loading = true;
  error: string | null = null;

  constructor(
    private boMonService: BoMonService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.userInfo = this.authService.getCurrentUser();
    this.loadDotDangKy();
  }

  private loadDotDangKy(): void {
    this.boMonService.getAllDotDangKy().subscribe({
      next: (res) => {
        this.dotDangKyList = res.data || [];
        
        if (this.dotDangKyList.length > 0) {
          this.selectedDotId = this.dotDangKyList[0].id;
        }
        
        this.loadData();
      },
      error: () => {
        this.loadData();
      }
    });
  }

  loadData(): void {
    this.loading = true;
    this.error = null;
    
    this.boMonService.getDeTai(undefined, this.selectedDotId || undefined).subscribe({
      next: (res: ApiResponse<DeTaiResponse[]>) => {
        this.allDeTai = res.data || [];
        this.processData();
        this.loading = false;
      },
      error: () => {
        this.error = 'Không thể tải dữ liệu';
        this.loading = false;
      }
    });
  }

  private processData(): void {
    // Chuyển đổi dữ liệu
    this.deTaiTienTrinh = this.allDeTai.map(dt => ({
      id: dt.id,
      tenDeTai: dt.tenDeTai,
      hoTenSinhVien: dt.hoTenSinhVien || '',
      maSinhVien: dt.maSinhVien || '',
      lop: dt.lopSinhVien || '',
      trangThai: dt.trangThai,
      giangVienHuongDan: dt.hoTenGiangVienHuongDan || 'Chưa phân công',
      giangVienPhanBien: dt.hoTenGiangVienPhanBien || 'Chưa phân công',
      diemHuongDan: dt.diemHuongDan,
      diemPhanBien: dt.diemPhanBien,
      diemBaoVe: dt.diemBaoVe,
      hoanThanhHD: dt.daChamDiemHD || false,
      hoanThanhPB: dt.daChamDiemPB || false,
      hoanThanhBV: dt.diemBaoVe !== undefined && dt.diemBaoVe !== null
    }));

    // Reset stats
    this.totalDeTai = this.deTaiTienTrinh.length;
    this.totalDaHoanThanh = 0;
    this.totalDangXuLy = 0;
    this.totalChoXuLy = 0;

    // Tính toán cho từng giai đoạn
    this.giaiDoans.forEach(gd => {
      const deTaiGiaiDoan = this.deTaiTienTrinh.filter(dt => 
        gd.trangThaiList.includes(dt.trangThai)
      );
      
      gd.soLuong = deTaiGiaiDoan.length;
      gd.daHoanThanh = this.tinhDaHoanThanh(gd.ten, deTaiGiaiDoan);
      gd.choXuLy = this.tinhChoXuLy(gd.ten, deTaiGiaiDoan);
      gd.dangXuLy = gd.soLuong - gd.daHoanThanh - gd.choXuLy;
      
      this.totalDaHoanThanh += gd.daHoanThanh;
      this.totalDangXuLy += gd.dangXuLy;
      this.totalChoXuLy += gd.choXuLy;
    });

    // Tính tỷ lệ hoàn thành
    if (this.totalDeTai > 0) {
      this.tiLeHoanThanh = Math.round((this.totalDaHoanThanh / this.totalDeTai) * 100);
    }
  }

  private tinhDaHoanThanh(tenGiaiDoan: string, deTais: DeTaiTienTrinh[]): number {
    switch (tenGiaiDoan) {
      case 'Chờ duyệt & GVHD':
        // Hoàn thành = đã được phân công GVHD thành công
        return deTais.filter(dt => 
          dt.trangThai === 'DANG_THUC_HIEN'
        ).length;
      case 'Đang thực hiện':
        // Hoàn thành = đã đạt GVHD
        return deTais.filter(dt => 
          dt.trangThai === 'DAT_GVHD'
        ).length;
      case 'Chờ phản biện':
        // Hoàn thành = đã đạt phản biện
        return deTais.filter(dt => 
          dt.trangThai === 'DAT_PHAN_BIEN'
        ).length;
      case 'Chờ bảo vệ':
        // Hoàn thành = đã bảo vệ
        return deTais.filter(dt => 
          dt.trangThai === 'HOAN_THANH' ||
          dt.trangThai === 'KHONG_DAT_BAO_VE'
        ).length;
      case 'Kết thúc':
        // Hoàn thành = đạt
        return deTais.filter(dt => 
          dt.trangThai === 'HOAN_THANH'
        ).length;
      default:
        return 0;
    }
  }

  private tinhChoXuLy(tenGiaiDoan: string, deTais: DeTaiTienTrinh[]): number {
    switch (tenGiaiDoan) {
      case 'Chờ duyệt & GVHD':
        // Chờ xử lý = bị từ chối
        return deTais.filter(dt => 
          dt.trangThai === 'GV_TU_CHOI' ||
          dt.trangThai === 'BI_TU_CHOI'
        ).length;
      case 'Đang thực hiện':
        // Chờ xử lý = không đạt HD
        return deTais.filter(dt => 
          dt.trangThai === 'KHONG_DAT_GVHD'
        ).length;
      case 'Chờ phản biện':
        // Chờ xử lý = không đạt phản biện
        return deTais.filter(dt => 
          dt.trangThai === 'KHONG_DAT_PHAN_BIEN'
        ).length;
      case 'Chờ bảo vệ':
        // Không có gì cần xử lý
        return 0;
      case 'Kết thúc':
        // Chờ xử lý = không đạt
        return deTais.filter(dt => 
          dt.trangThai === 'KHONG_DAT_BAO_VE'
        ).length;
      default:
        return 0;
    }
  }

  getDeTaiByGiaiDoan(giaiDoan: TienTrinhGiaiDoan): DeTaiTienTrinh[] {
    return this.deTaiTienTrinh.filter(dt => 
      giaiDoan.trangThaiList.includes(dt.trangThai)
    );
  }

  hexToRgb(hex: string): string {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (result) {
      return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`;
    }
    return '108, 117, 125'; // fallback gray
  }

  getTrangThaiDisplay(trangThai: string): { text: string; class: string; icon: string } {
    const map: { [key: string]: { text: string; class: string; icon: string } } = {
      'CHO_GV_PHAN_CONG': { text: 'Chờ phân công HD', class: 'bg-secondary', icon: 'schedule' },
      'CHO_GV_DUYET': { text: 'GV đang duyệt', class: 'bg-info', icon: 'pending' },
      'GV_TU_CHOI': { text: 'GV từ chối', class: 'bg-danger', icon: 'cancel' },
      'CHO_BO_MON_PHAN_CONG': { text: 'Chờ BM xác nhận', class: 'bg-warning text-dark', icon: 'pending_actions' },
      'DANG_THUC_HIEN': { text: 'Đang thực hiện', class: 'bg-primary', icon: 'engineering' },
      'DA_NOP_BAO_CAO': { text: 'Đã nộp báo cáo', class: 'bg-info', icon: 'upload_file' },
      'DAT_GVHD': { text: 'Đạt HD', class: 'bg-success', icon: 'check_circle' },
      'KHONG_DAT_GVHD': { text: 'Không đạt HD', class: 'bg-danger', icon: 'error' },
      'CHO_PHAN_BIEN': { text: 'Chờ phản biện', class: 'bg-warning text-dark', icon: 'rate_review' },
      'DAT_PHAN_BIEN': { text: 'Đạt PB', class: 'bg-success', icon: 'verified' },
      'KHONG_DAT_PHAN_BIEN': { text: 'Không đạt PB', class: 'bg-danger', icon: 'cancel' },
      'DANG_BAO_VE': { text: 'Đang bảo vệ', class: 'bg-primary', icon: 'event' },
      'HOAN_THANH': { text: 'Hoàn thành', class: 'bg-success', icon: 'task_alt' },
      'KHONG_DAT_BAO_VE': { text: 'Không đạt BV', class: 'bg-danger', icon: 'close' }
    };
    return map[trangThai] || { text: trangThai, class: 'bg-secondary', icon: 'help' };
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

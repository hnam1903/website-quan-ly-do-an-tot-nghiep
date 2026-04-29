import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/constants/api.constants';
import { AuthService } from '../../core/services/auth.service';

interface ThongBao {
  id: number;
  tieuDe: string;
  noiDung: string;
  ngayDang: string;
  trangThai: boolean;
}

interface DashboardStats {
  tongSinhVien: number;
  tongGiangVien: number;
  tongDeTai: number;
  deTaiHoanThanh: number;
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.css']
})
export class LandingPageComponent implements OnInit {
  thongBaos: ThongBao[] = [];
  selectedThongBao: ThongBao | null = null;
  showDetailModal = false;
  currentUser: any;
  stats: DashboardStats = {
    tongSinhVien: 0,
    tongGiangVien: 0,
    tongDeTai: 0,
    deTaiHoanThanh: 0
  };

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadThongBao();
    this.loadStats();
    this.currentUser = this.authService.getCurrentUser();
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getRoleLabel(role: string): string {
    const roleLabels: { [key: string]: string } = {
      'ADMIN': 'Quản trị viên',
      'GIANG_VIEN': 'Giảng viên',
      'LANH_DAO_BO_MON': 'Lãnh đạo bộ môn',
      'SINH_VIEN': 'Sinh viên'
    };
    return roleLabels[role] || role;
  }

  loadThongBao(): void {
    this.http.get<any>(`${API_URL}/public/thong-bao`).subscribe({
      next: (res) => {
        if (res.success) {
          this.thongBaos = res.data;
        }
      },
      error: (err) => console.error('Lỗi load thông báo:', err)
    });
  }

  loadStats(): void {
    this.http.get<any>(`${API_URL}/admin/dashboard`).subscribe({
      next: (res) => {
        if (res.success) {
          this.stats = res.data;
        }
      },
      error: (err) => console.error('Lỗi load stats:', err)
    });
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getNotificationColor(index: number): string {
    const colors = ['blue', 'green', 'orange', 'purple'];
    return colors[index % colors.length];
  }

  getNotificationIcon(index: number): string {
    const icons = ['notifications_active', 'task_alt', 'event', 'assignment'];
    return icons[index % icons.length];
  }

  viewDetail(tb: ThongBao): void {
    this.selectedThongBao = tb;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedThongBao = null;
  }
}

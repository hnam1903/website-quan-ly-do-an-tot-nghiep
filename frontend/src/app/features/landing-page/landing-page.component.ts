import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../../core/constants/api.constants';
import { AuthService } from '../../core/services/auth.service';
import { ChatbotService, DeTaiGoiY } from '../../core/services/chatbot.service';

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

interface ChatMessageItem {
  role: 'user' | 'bot';
  content: string;
  deTaiList?: DeTaiGoiY[];
}

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

  // Chatbot state
  showChatbot = false;
  userMessage = '';
  chatMessages: ChatMessageItem[] = [];
  isLoading = false;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private router: Router,
    private chatbotService: ChatbotService
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
    const icons = ['campaign', 'task_alt', 'event', 'assignment'];
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

  // Chatbot methods
  toggleChatbot(): void {
    this.showChatbot = !this.showChatbot;
  }

  sendMessage(): void {
    if (!this.userMessage.trim() || this.isLoading) return;

    const message = this.userMessage.trim();
    this.chatMessages.push({
      role: 'user',
      content: message
    });
    this.userMessage = '';
    this.isLoading = true;

    this.chatbotService.goiYDeTai(message).subscribe({
      next: (res) => {
        this.chatMessages.push({
          role: 'bot',
          content: res.tinNhan || 'Dưới đây là gợi ý đề tài cho bạn:',
          deTaiList: res.danhSachDeTai
        });
        this.isLoading = false;
      },
      error: (err) => {
        this.chatMessages.push({
          role: 'bot',
          content: 'Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.'
        });
        this.isLoading = false;
      }
    });
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  closeChatbot(): void {
    this.showChatbot = false;
  }
}

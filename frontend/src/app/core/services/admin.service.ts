import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, DotDangKyResponse, BoMonResponse, GiangVienResponse, SinhVienResponse, DeTaiResponse, DashboardResponse, DanhSachSinhVienDotDangKyResponse, ThongBaoResponse, QuanLyDiemResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin';

  constructor(private http: HttpClient) {}

  // Đợt đăng ký
  getAllDotDangKy(): Observable<ApiResponse<DotDangKyResponse[]>> {
    return this.http.get<ApiResponse<DotDangKyResponse[]>>(`${this.apiUrl}/dot-dang-ky`);
  }

  createDotDangKy(data: any): Observable<ApiResponse<DotDangKyResponse>> {
    return this.http.post<ApiResponse<DotDangKyResponse>>(`${this.apiUrl}/dot-dang-ky`, data);
  }

  updateDotDangKy(id: number, data: any): Observable<ApiResponse<DotDangKyResponse>> {
    return this.http.put<ApiResponse<DotDangKyResponse>>(`${this.apiUrl}/dot-dang-ky/${id}`, data);
  }

  deleteDotDangKy(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/dot-dang-ky/${id}`);
  }

  dongDotDangKy(id: number): Observable<ApiResponse<DotDangKyResponse>> {
    return this.http.put<ApiResponse<DotDangKyResponse>>(`${this.apiUrl}/dot-dang-ky/${id}/dong`, {});
  }

  moLaiDotDangKy(id: number): Observable<ApiResponse<DotDangKyResponse>> {
    return this.http.put<ApiResponse<DotDangKyResponse>>(`${this.apiUrl}/dot-dang-ky/${id}/mo-lai`, {});
  }

  // Lấy danh sách đề tài (filter theo bộ môn và trạng thái)
  getDeTaiDangKy(dotDangKyId?: number, trangThai?: string, boMonId?: number): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams();
    if (dotDangKyId) {
      params = params.set('dotDangKyId', dotDangKyId.toString());
    }
    if (trangThai) {
      params = params.set('trangThai', trangThai);
    }
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai`, { params });
  }

  // Đề tài không đạt
  getDeTaiKhongDat(dotDangKyId?: number): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams();
    if (dotDangKyId) {
      params = params.set('dotDangKyId', dotDangKyId.toString());
    }
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai/khong-dat`, { params });
  }

  xoaDeTaiKhongDat(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/de-tai/${id}/xoa`);
  }

  xoaNhieuDeTaiKhongDat(ids: number[]): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/de-tai/xoa-nhieu`, { body: ids });
  }

  // Xóa đề tài
  xoaDeTai(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/de-tai/${id}/xoa`);
  }

  // Bộ môn
  getAllBoMon(): Observable<ApiResponse<BoMonResponse[]>> {
    return this.http.get<ApiResponse<BoMonResponse[]>>(`${this.apiUrl}/bo-mon`);
  }

  createBoMon(data: any): Observable<ApiResponse<BoMonResponse>> {
    return this.http.post<ApiResponse<BoMonResponse>>(`${this.apiUrl}/bo-mon`, data);
  }

  updateBoMon(id: number, data: any): Observable<ApiResponse<BoMonResponse>> {
    return this.http.put<ApiResponse<BoMonResponse>>(`${this.apiUrl}/bo-mon/${id}`, data);
  }

  deleteBoMon(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/bo-mon/${id}`);
  }

  // Giảng viên
  getAllGiangVien(boMonId?: number): Observable<ApiResponse<GiangVienResponse[]>> {
    let params = new HttpParams();
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    return this.http.get<ApiResponse<GiangVienResponse[]>>(`${this.apiUrl}/giang-vien`, { params });
  }

  createGiangVien(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('http://localhost:8080/api/auth/register/giang-vien', data);
  }

  updateGiangVien(id: number, data: any): Observable<ApiResponse<GiangVienResponse>> {
    return this.http.put<ApiResponse<GiangVienResponse>>(`${this.apiUrl}/giang-vien/${id}`, data);
  }

  setLanhDaoBoMon(id: number, isLanhDao: boolean): Observable<ApiResponse<GiangVienResponse>> {
    return this.http.put<ApiResponse<GiangVienResponse>>(`${this.apiUrl}/giang-vien/${id}/lanh-dao?isLanhDao=${isLanhDao}`, {});
  }

  deleteGiangVien(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/giang-vien/${id}`);
  }

  // Sinh viên
  getAllSinhVien(boMonId?: number): Observable<ApiResponse<SinhVienResponse[]>> {
    let params = new HttpParams();
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    return this.http.get<ApiResponse<SinhVienResponse[]>>(`${this.apiUrl}/sinh-vien`, { params });
  }

  createSinhVien(data: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('http://localhost:8080/api/auth/register/sinh-vien', data);
  }

  updateSinhVien(id: number, data: any): Observable<ApiResponse<SinhVienResponse>> {
    return this.http.put<ApiResponse<SinhVienResponse>>(`${this.apiUrl}/sinh-vien/${id}`, data);
  }

  deleteSinhVien(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/sinh-vien/${id}`);
  }

  // Dashboard
  getDashboard(): Observable<ApiResponse<DashboardResponse>> {
    return this.http.get<ApiResponse<DashboardResponse>>(`${this.apiUrl}/dashboard`);
  }

  // Thống kê
  getThongKeTongHop(dotDangKyId?: number, boMonId?: number): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams();
    if (dotDangKyId) {
      params = params.set('dotDangKyId', dotDangKyId.toString());
    }
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/thong-ke`, { params });
  }

  // Sinh viên theo đợt đăng ký
  getDanhSachSinhVienByDotDangKy(dotDangKyId: number): Observable<ApiResponse<DanhSachSinhVienDotDangKyResponse>> {
    return this.http.get<ApiResponse<DanhSachSinhVienDotDangKyResponse>>(
      `${this.apiUrl}/dot-dang-ky/${dotDangKyId}/sinh-vien`
    );
  }

  // Thông báo
  getAllThongBao(): Observable<ApiResponse<ThongBaoResponse[]>> {
    return this.http.get<ApiResponse<ThongBaoResponse[]>>(`${this.apiUrl}/thong-bao`);
  }

  createThongBao(data: any): Observable<ApiResponse<ThongBaoResponse>> {
    return this.http.post<ApiResponse<ThongBaoResponse>>(`${this.apiUrl}/thong-bao`, data);
  }

  updateThongBao(id: number, data: any): Observable<ApiResponse<ThongBaoResponse>> {
    return this.http.put<ApiResponse<ThongBaoResponse>>(`${this.apiUrl}/thong-bao/${id}`, data);
  }

  deleteThongBao(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/thong-bao/${id}`);
  }

  toggleTrangThaiThongBao(id: number): Observable<ApiResponse<ThongBaoResponse>> {
    return this.http.put<ApiResponse<ThongBaoResponse>>(`${this.apiUrl}/thong-bao/${id}/trang-thai`, {});
  }

  // Quản lý điểm
  getQuanLyDiem(boMonId?: number, dotDangKyId?: number): Observable<ApiResponse<QuanLyDiemResponse[]>> {
    let params = new HttpParams();
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    if (dotDangKyId) {
      params = params.set('dotDangKyId', dotDangKyId.toString());
    }
    return this.http.get<ApiResponse<QuanLyDiemResponse[]>>(`${this.apiUrl}/quan-ly-diem`, { params });
  }

  // Quản lý tài khoản
  khoaTaiKhoan(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/tai-khoan/${id}/khoa`, {});
  }

  moTaiKhoan(id: number): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/tai-khoan/${id}/mo`, {});
  }
}

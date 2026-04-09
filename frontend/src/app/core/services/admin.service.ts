import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, DotDangKyResponse, BoMonResponse, GiangVienResponse, SinhVienResponse, DeTaiResponse, DashboardResponse } from '../models/models';

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

  // Gửi lên Bộ môn
  getDeTaiDangKy(dotDangKyId?: number, trangThai?: string): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams();
    if (dotDangKyId) {
      params = params.set('dotDangKyId', dotDangKyId.toString());
    }
    if (trangThai) {
      params = params.set('trangThai', trangThai);
    }
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai`, { params });
  }

  guiLenBoMon(id: number): Observable<ApiResponse<DeTaiResponse>> {
    return this.http.put<ApiResponse<DeTaiResponse>>(`${this.apiUrl}/de-tai/${id}/gui-bo-mon`, {});
  }

  guiNhieuLenBoMon(ids: number[]): Observable<ApiResponse<DeTaiResponse[]>> {
    return this.http.put<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai/gui-bo-mon`, ids);
  }

  // Đề tài bị từ chối
  getDeTaiBiTuChoi(dotDangKyId?: number): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams();
    if (dotDangKyId) {
      params = params.set('dotDangKyId', dotDangKyId.toString());
    }
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai/bi-tu-choi`, { params });
  }

  xoaDeTaiBiTuChoi(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/de-tai/${id}/xoa`);
  }

  xoaNhieuDeTaiBiTuChoi(ids: number[]): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/de-tai/xoa-nhieu`, { body: ids });
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
}

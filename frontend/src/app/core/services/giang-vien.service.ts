import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PhanCongHuongDanResponse, DeTaiResponse, DiemHuongDanResponse, DiemPhanBienResponse, HoiDongBaoVeResponse, BaoCaoResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class GiangVienService {
  private apiUrl = 'http://localhost:8080/api/giang-vien';

  constructor(private http: HttpClient) {}

  // GV Hướng dẫn
  getDeTaiHuongDan(): Observable<ApiResponse<PhanCongHuongDanResponse[]>> {
    return this.http.get<ApiResponse<PhanCongHuongDanResponse[]>>(`${this.apiUrl}/huong-dan`);
  }

  getDeTaiChoDuyet(): Observable<ApiResponse<PhanCongHuongDanResponse[]>> {
    return this.http.get<ApiResponse<PhanCongHuongDanResponse[]>>(`${this.apiUrl}/huong-dan/cho-duyet`);
  }

  duyetSinhVien(id: number, duyet: boolean): Observable<ApiResponse<PhanCongHuongDanResponse>> {
    return this.http.put<ApiResponse<PhanCongHuongDanResponse>>(`${this.apiUrl}/huong-dan/${id}/duyet?duyet=${duyet}`, {});
  }

  chamDiemHuongDan(data: any): Observable<ApiResponse<DiemHuongDanResponse>> {
    return this.http.post<ApiResponse<DiemHuongDanResponse>>(`${this.apiUrl}/diem-huong-dan`, data);
  }

  // GV Phản biện
  getDeTaiPhanBien(): Observable<ApiResponse<DeTaiResponse[]>> {
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/phan-bien`);
  }

  chamDiemPhanBien(data: any): Observable<ApiResponse<DiemPhanBienResponse>> {
    return this.http.post<ApiResponse<DiemPhanBienResponse>>(`${this.apiUrl}/diem-phan-bien`, data);
  }

  // GV Hội đồng - chỉ xem danh sách
  getHoiDongBaoVe(): Observable<ApiResponse<HoiDongBaoVeResponse[]>> {
    return this.http.get<ApiResponse<HoiDongBaoVeResponse[]>>(`${this.apiUrl}/hoi-dong`);
  }

  // Xem báo cáo sinh viên
  getBaoCaoSinhVien(): Observable<ApiResponse<BaoCaoResponse[]>> {
    return this.http.get<ApiResponse<BaoCaoResponse[]>>(`${this.apiUrl}/bao-cao`);
  }

  getBaoCaoChiTiet(deTaiId: number): Observable<ApiResponse<BaoCaoResponse>> {
    return this.http.get<ApiResponse<BaoCaoResponse>>(`${this.apiUrl}/bao-cao/${deTaiId}`);
  }
}

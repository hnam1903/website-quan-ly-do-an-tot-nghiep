import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PhanCongHuongDanResponse, DeTaiResponse, DiemHuongDanResponse, DiemPhanBienResponse, HoiDongBaoVeResponse, BaoCaoResponse, DotBaoCaoTienDoResponse, BaoCaoTienDoResponse } from '../models/models';

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

  // Báo cáo tiến độ
  getDotBaoCaoTienDo(): Observable<ApiResponse<DotBaoCaoTienDoResponse[]>> {
    return this.http.get<ApiResponse<DotBaoCaoTienDoResponse[]>>(`${this.apiUrl}/bao-cao-tien-do/dot`);
  }

  taoDotBaoCaoTienDo(data: any): Observable<ApiResponse<DotBaoCaoTienDoResponse>> {
    return this.http.post<ApiResponse<DotBaoCaoTienDoResponse>>(`${this.apiUrl}/bao-cao-tien-do/dot`, data);
  }

  capNhatTrangThaiDot(dotId: number, trangThai: string): Observable<ApiResponse<DotBaoCaoTienDoResponse>> {
    return this.http.put<ApiResponse<DotBaoCaoTienDoResponse>>(`${this.apiUrl}/bao-cao-tien-do/dot/${dotId}/trang-thai?trangThai=${trangThai}`, {});
  }

  getBaoCaoTienDoByDot(dotId: number): Observable<ApiResponse<BaoCaoTienDoResponse[]>> {
    return this.http.get<ApiResponse<BaoCaoTienDoResponse[]>>(`${this.apiUrl}/bao-cao-tien-do/dot/${dotId}/danh-sach`);
  }

  nhanXetBaoCaoTienDo(data: any): Observable<ApiResponse<BaoCaoTienDoResponse>> {
    return this.http.post<ApiResponse<BaoCaoTienDoResponse>>(`${this.apiUrl}/bao-cao-tien-do/nhan-xet`, data);
  }

  xoaDotBaoCaoTienDo(dotId: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/bao-cao-tien-do/dot/${dotId}`);
  }

  // Sinh viên hướng dẫn
  getSinhVienHuongDan(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/sinh-vien-huong-dan`);
  }

  getBaoCaoTienDoBySinhVien(sinhVienId: number): Observable<ApiResponse<BaoCaoTienDoResponse[]>> {
    return this.http.get<ApiResponse<BaoCaoTienDoResponse[]>>(`${this.apiUrl}/bao-cao-tien-do/sinh-vien/${sinhVienId}`);
  }
}

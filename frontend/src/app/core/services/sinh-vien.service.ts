import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, PhanCongHuongDanResponse, DeTaiResponse, DiemHuongDanResponse, DiemPhanBienResponse, HoiDongBaoVeResponse, GiangVienResponse, DotBaoCaoTienDoResponse, BaoCaoTienDoResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class SinhVienService {
  private apiUrl = 'http://localhost:8080/api/sinh-vien';

  constructor(private http: HttpClient) {}

  getDotDangKyDangMo(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/dot-dang-ky`);
  }

  getGiangVienList(): Observable<ApiResponse<GiangVienResponse[]>> {
    return this.http.get<ApiResponse<GiangVienResponse[]>>(`${this.apiUrl}/giang-vien`);
  }

  dangKyDeTai(data: any): Observable<ApiResponse<DeTaiResponse>> {
    return this.http.post<ApiResponse<DeTaiResponse>>(`${this.apiUrl}/de-tai`, data);
  }

  dangKyLaiDeTai(deTaiId: number, data: any): Observable<ApiResponse<DeTaiResponse>> {
    return this.http.put<ApiResponse<DeTaiResponse>>(`${this.apiUrl}/de-tai/${deTaiId}/dang-ky-lai`, data);
  }

  getDeTaiCuaToi(): Observable<ApiResponse<DeTaiResponse>> {
    return this.http.get<ApiResponse<DeTaiResponse>>(`${this.apiUrl}/de-tai`);
  }

  nopBaoCao(formData: FormData): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/bao-cao`, formData);
  }

  getBaoCaoCuaToi(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/bao-cao`);
  }

  getKetQuaHuongDan(): Observable<ApiResponse<DiemHuongDanResponse>> {
    return this.http.get<ApiResponse<DiemHuongDanResponse>>(`${this.apiUrl}/ket-qua/huong-dan`);
  }

  getKetQuaPhanBien(): Observable<ApiResponse<DiemPhanBienResponse>> {
    return this.http.get<ApiResponse<DiemPhanBienResponse>>(`${this.apiUrl}/ket-qua/phan-bien`);
  }

  getKetQuaBaoVe(): Observable<ApiResponse<DeTaiResponse>> {
    return this.http.get<ApiResponse<DeTaiResponse>>(`${this.apiUrl}/ket-qua/bao-ve`);
  }

  getLichBaoVe(): Observable<ApiResponse<DeTaiResponse>> {
    return this.http.get<ApiResponse<DeTaiResponse>>(`${this.apiUrl}/lich-bao-ve`);
  }

  // Báo cáo tiến độ
  getDotBaoCaoTienDo(): Observable<ApiResponse<DotBaoCaoTienDoResponse[]>> {
    return this.http.get<ApiResponse<DotBaoCaoTienDoResponse[]>>(`${this.apiUrl}/bao-cao-tien-do/dot`);
  }

  getBaoCaoTienDoCuaToi(): Observable<ApiResponse<BaoCaoTienDoResponse[]>> {
    return this.http.get<ApiResponse<BaoCaoTienDoResponse[]>>(`${this.apiUrl}/bao-cao-tien-do`);
  }

  nopBaoCaoTienDo(formData: FormData): Observable<ApiResponse<BaoCaoTienDoResponse>> {
    return this.http.post<ApiResponse<BaoCaoTienDoResponse>>(`${this.apiUrl}/bao-cao-tien-do`, formData);
  }
}

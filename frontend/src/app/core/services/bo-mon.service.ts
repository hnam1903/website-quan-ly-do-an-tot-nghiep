import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, DeTaiResponse, GiangVienResponse, SinhVienResponse, PhanCongHuongDanResponse, PhanCongPhanBienResponse, HoiDongBaoVeResponse, BoMonResponse, BaoCaoResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BoMonService {
  private apiUrl = 'http://localhost:8080/api/bo-mon';

  constructor(private http: HttpClient) {}

  getDeTai(trangThai?: string, boMonId?: number): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams();
    if (trangThai) {
      params = params.set('trangThai', trangThai);
    }
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai`, { params });
  }

  getDeTaiByTrangThai(trangThais: string[]): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams();
    // Backend chưa hỗ trợ nhiều trạng thái nên gọi lần lượt
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai?trangThai=${trangThais[0]}`, { params });
  }

  duyetDeTai(id: number): Observable<ApiResponse<DeTaiResponse>> {
    return this.http.put<ApiResponse<DeTaiResponse>>(`${this.apiUrl}/de-tai/${id}/duyet`, {});
  }

  tuChoiDeTai(id: number, ghiChu: string): Observable<ApiResponse<DeTaiResponse>> {
    return this.http.put<ApiResponse<DeTaiResponse>>(`${this.apiUrl}/de-tai/${id}/tu-choi`, { ghiChu });
  }

  getDeTaiKhongDat(loai: string, boMonId?: number): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams().set('loai', loai);
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai/khong-dat`, { params });
  }

  getGiangVien(boMonId?: number): Observable<ApiResponse<GiangVienResponse[]>> {
    let params = new HttpParams();
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    return this.http.get<ApiResponse<GiangVienResponse[]>>(`${this.apiUrl}/giang-vien`, { params });
  }

  getSinhVien(boMonId?: number): Observable<ApiResponse<SinhVienResponse[]>> {
    let params = new HttpParams();
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    return this.http.get<ApiResponse<SinhVienResponse[]>>(`${this.apiUrl}/sinh-vien`, { params });
  }

  phanCongHuongDan(deTaiId: number, giangVienId: number): Observable<ApiResponse<PhanCongHuongDanResponse>> {
    return this.http.post<ApiResponse<PhanCongHuongDanResponse>>(`${this.apiUrl}/phan-cong-huong-dan`, {
      deTaiId,
      giangVienId
    });
  }

  getDeTaiChoGVDuyet(): Observable<ApiResponse<PhanCongHuongDanResponse[]>> {
    return this.http.get<ApiResponse<PhanCongHuongDanResponse[]>>(`${this.apiUrl}/de-tai/cho-gv-duyet`);
  }

  phanCongPhanBien(deTaiId: number, giangVienId: number): Observable<ApiResponse<PhanCongPhanBienResponse>> {
    return this.http.post<ApiResponse<PhanCongPhanBienResponse>>(`${this.apiUrl}/phan-cong-phan-bien`, {
      deTaiId,
      giangVienId
    });
  }

  taoHoiDong(data: any): Observable<ApiResponse<HoiDongBaoVeResponse>> {
    return this.http.post<ApiResponse<HoiDongBaoVeResponse>>(`${this.apiUrl}/hoi-dong`, data);
  }

  getHoiDongBaoVe(): Observable<ApiResponse<HoiDongBaoVeResponse[]>> {
    return this.http.get<ApiResponse<HoiDongBaoVeResponse[]>>(`${this.apiUrl}/hoi-dong`);
  }

  getBoMonList(): Observable<ApiResponse<BoMonResponse[]>> {
    return this.http.get<ApiResponse<BoMonResponse[]>>(`${this.apiUrl}/bo-mon`);
  }

  getBaoCaoByDeTaiId(deTaiId: number): Observable<ApiResponse<BaoCaoResponse>> {
    return this.http.get<ApiResponse<BaoCaoResponse>>(`${this.apiUrl}/bao-cao/${deTaiId}`);
  }

  importDiemBaoVe(data: { hoiDongId: number; nhanXet?: string; diemThanhViens?: { giangVienId: number; diem: number }[] }): Observable<ApiResponse<HoiDongBaoVeResponse>> {
    return this.http.post<ApiResponse<HoiDongBaoVeResponse>>(`${this.apiUrl}/diem-bao-ve`, data);
  }

  updateDiemBaoVe(hoiDongId: number, data: { nhanXet?: string; diemThanhViens?: { giangVienId: number; diem: number }[] }): Observable<ApiResponse<HoiDongBaoVeResponse>> {
    return this.http.put<ApiResponse<HoiDongBaoVeResponse>>(`${this.apiUrl}/diem-bao-ve/${hoiDongId}`, data);
  }

  getDiemBaoVeByHoiDong(hoiDongId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/diem-bao-ve/hoi-dong/${hoiDongId}`);
  }

  getDiemBaoVeByDeTai(deTaiId: number): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/diem-bao-ve/de-tai/${deTaiId}`);
  }

  importDiemExcel(file: File): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/diem-bao-ve/import-excel`, formData);
  }

  downloadDiemBaoVeTemplate(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/diem-bao-ve/excel-template`, {
      responseType: 'blob'
    });
  }
}

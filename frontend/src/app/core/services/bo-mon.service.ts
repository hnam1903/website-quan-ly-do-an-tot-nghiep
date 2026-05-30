import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse, DeTaiResponse, GiangVienResponse, SinhVienResponse, PhanCongHuongDanResponse, PhanCongPhanBienResponse, HoiDongBaoVeResponse, BoMonResponse, BaoCaoResponse, DotBaoCaoTienDoResponse, ThongKePhanCongResponse, QuanLyDiemResponse, DotDangKyResponse } from '../models/models';

@Injectable({
  providedIn: 'root'
})
export class BoMonService {
  private apiUrl = 'http://localhost:8080/api/bo-mon';

  constructor(private http: HttpClient) {}

  getDeTai(trangThai?: string, dotId?: number, boMonId?: number): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams();
    if (trangThai) {
      params = params.set('trangThai', trangThai);
    }
    if (dotId) {
      params = params.set('dotId', dotId.toString());
    }
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai`, { params });
  }

  getDeTaiByTrangThai(trangThais: string[]): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams();
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai?trangThai=${trangThais[0]}`, { params });
  }

  duyetDeTai(id: number): Observable<ApiResponse<DeTaiResponse>> {
    return this.http.put<ApiResponse<DeTaiResponse>>(`${this.apiUrl}/de-tai/${id}/duyet`, {});
  }

  tuChoiDeTai(id: number, ghiChu: string): Observable<ApiResponse<DeTaiResponse>> {
    return this.http.put<ApiResponse<DeTaiResponse>>(`${this.apiUrl}/de-tai/${id}/tu-choi`, { ghiChu });
  }

  getDeTaiChoBoMonDuyet(): Observable<ApiResponse<DeTaiResponse[]>> {
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai/cho-bo-mon-duyet`);
  }

  getDeTaiKhongDat(loai: string, boMonId?: number): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams().set('loai', loai);
    if (boMonId) {
      params = params.set('boMonId', boMonId.toString());
    }
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai/khong-dat`, { params });
  }

  getDeTaiHoanThanh(dotId?: number): Observable<ApiResponse<DeTaiResponse[]>> {
    let params = new HttpParams();
    if (dotId) {
      params = params.set('dotId', dotId.toString());
    }
    return this.http.get<ApiResponse<DeTaiResponse[]>>(`${this.apiUrl}/de-tai/hoan-thanh`, { params });
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

  getDanhSachGvhd(dotId?: number): Observable<ApiResponse<PhanCongHuongDanResponse[]>> {
    let params = new HttpParams();
    if (dotId) {
      params = params.set('dotId', dotId.toString());
    }
    return this.http.get<ApiResponse<PhanCongHuongDanResponse[]>>(`${this.apiUrl}/danh-sach-gvhd`, { params });
  }

  getDanhSachGvpb(dotId?: number): Observable<ApiResponse<PhanCongPhanBienResponse[]>> {
    let params = new HttpParams();
    if (dotId) {
      params = params.set('dotId', dotId.toString());
    }
    return this.http.get<ApiResponse<PhanCongPhanBienResponse[]>>(`${this.apiUrl}/danh-sach-gvpb`, { params });
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

  getHoiDongBaoVe(dotId?: number): Observable<ApiResponse<HoiDongBaoVeResponse[]>> {
    let params = new HttpParams();
    if (dotId) {
      params = params.set('dotId', dotId.toString());
    }
    return this.http.get<ApiResponse<HoiDongBaoVeResponse[]>>(`${this.apiUrl}/hoi-dong`, { params });
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

  getThongKe(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/thong-ke`);
  }

  getAllDotDangKy(): Observable<ApiResponse<any[]>> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/dot-dang-ky`);
  }

  getDotBaoCaoTienDo(): Observable<ApiResponse<DotBaoCaoTienDoResponse[]>> {
    return this.http.get<ApiResponse<DotBaoCaoTienDoResponse[]>>(`${this.apiUrl}/bao-cao-tien-do`);
  }

  getThongKeDiem(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/thong-ke-diem`);
  }

  getThongKePhanCong(): Observable<ApiResponse<ThongKePhanCongResponse>> {
    return this.http.get<ApiResponse<ThongKePhanCongResponse>>(`${this.apiUrl}/thong-ke-phan-cong`);
  }

  getQuanLyDiem(dotId?: number): Observable<ApiResponse<QuanLyDiemResponse[]>> {
    let params = new HttpParams();
    if (dotId) {
      params = params.set('dotId', dotId.toString());
    }
    return this.http.get<ApiResponse<QuanLyDiemResponse[]>>(`${this.apiUrl}/quan-ly-diem`, { params });
  }

  capNhatGioiHanDeTai(gvId: number, soDeTaiToiDa: number): Observable<ApiResponse<GiangVienResponse>> {
    return this.http.put<ApiResponse<GiangVienResponse>>(`${this.apiUrl}/giang-vien/${gvId}/gioi-han-de-tai`, {
      soDeTaiToiDa
    });
  }
}

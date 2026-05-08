export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
  tokenType: string;
  userId: number;
  email: string;
  role: string;
}

export interface UserResponse {
  id: number;
  email: string;
  role: string;
  hoTen?: string;
  hocVi?: string;
  maSinhVien?: string;
  lop?: string;
  tenBoMon?: string;
  boMonId?: number;
}

export interface DotDangKyResponse {
  id: number;
  tenDot: string;
  namHoc: string;
  hocKy: number;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: string;
  soLuongDangKy?: number;
}

export interface BoMonResponse {
  id: number;
  tenBoMon: string;
  maBoMon: string;
  khoaId?: number;
  tenKhoa?: string;
  soLuongGiangVien?: number;
  soLuongSinhVien?: number;
  soLuongDeTai?: number;
}

export interface GiangVienResponse {
  id: number;
  hoTen: string;
  hocVi?: string;
  email: string;
  boMonId?: number;
  tenBoMon?: string;
  laLanhDao?: boolean;
  taiKhoanId?: number;
  trangThaiTaiKhoan?: boolean;
}

export interface SinhVienResponse {
  id: number;
  hoTen: string;
  maSinhVien: string;
  lop?: string;
  email: string;
  boMonId?: number;
  tenBoMon?: string;
  deTaiId?: number;
  deTaiTen?: string;
  deTaiTrangThai?: string;
  taiKhoanId?: number;
  trangThaiTaiKhoan?: boolean;
}

export interface DeTaiResponse {
  id: number;
  tenDeTai: string;
  noiDungDuKien?: string;
  congNgheSuDung?: string;
  trangThai: string;
  ghiChu?: string;
  dotDangKyId?: number;
  tenDotDangKy?: string;
  namHoc?: string;
  sinhVienId?: number;
  hoTenSinhVien?: string;
  maSinhVien?: string;
  lopSinhVien?: string;
  boMonId?: number;
  tenBoMon?: string;
  giangVienHuongDanId?: number;
  hoTenGiangVienHuongDan?: string;
  deTaiTrangThai?: string;
  giangVienDuKienId?: number;
  hoTenGiangVienDuKien?: string;
  giangVienPhanBienId?: number;
  hoTenGiangVienPhanBien?: string;
  diemHuongDan?: number;
  diemPhanBien?: number;
  diemBaoVe?: number;
  diemTongBaoVe?: number;
  daChamDiemPB?: boolean;
  daChamDiemHD?: boolean;
  nhanXetPhanBien?: string;
  createdAt?: string;
  hoTenGiangVienHoiDong?: string;
  thanhVienHoiDongList?: ThanhVienInfo[];
  // Thông tin lịch bảo vệ
  ngayBaoVe?: string;
  diaDiem?: string;
  // Thông tin báo cáo
  coBaoCao?: boolean;
  trangThaiBaoCao?: string;
  ngayNopBaoCao?: string;
  nhanXetCham?: string;
}

export interface ThanhVienInfo {
  hoTen?: string;
  vaiTro?: string;
  diem?: number;
}

export interface PhanCongHuongDanResponse {
  id: number;
  deTaiId: number;
  tenDeTai: string;
  noiDungDuKien?: string;
  congNgheSuDung?: string;
  giangVienId: number;
  hoTenGiangVien: string;
  trangThai: string;
  ngayPhanCong?: string;
  sinhVienId?: number;
  hoTenSinhVien?: string;
  maSinhVien?: string;
  lopSinhVien?: string;
  tenBoMon?: string;
  deTaiTrangThai?: string;
  // Điểm hướng dẫn
  daChamDiem?: boolean;
  diemCham?: number;
  nhanXetCham?: string;
  // Điểm phản biện
  daChamDiemPB?: boolean;
  diemPhanBien?: number;
  nhanXetPhanBien?: string;
  // Thông tin đợt đăng ký
  dotDangKyId?: number;
  tenDotDangKy?: string;
  namHoc?: string;
}

export interface SinhVienHuongDanResponse {
  id: number;
  maSinhVien?: string;
  hoTen: string;
  lop?: string;
  tenDeTai?: string;
  daChamDiem?: boolean;
  dotDangKyId?: number;
}

export interface PhanCongPhanBienResponse {
  id: number;
  deTaiId: number;
  tenDeTai: string;
  hoTenSinhVien?: string;
  maSinhVien?: string;
  lopSinhVien?: string;
  giangVienId: number;
  hoTenGiangVien: string;
  deTaiTrangThai?: string;
}

export interface BaoCaoResponse {
  id: number;
  deTaiId: number;
  tenDeTai: string;
  hoTenSinhVien?: string;
  maSinhVien?: string;
  fileBaoCao?: string;
  ngayNop?: string;
  trangThai: string;
}

export interface DiemHuongDanResponse {
  id: number;
  deTaiId: number;
  tenDeTai: string;
  diem?: number;
  nhanXet?: string;
  ngayCham?: string;
  trangThai: string;
}

export interface DiemPhanBienResponse {
  id: number;
  deTaiId: number;
  tenDeTai: string;
  diem?: number;
  nhanXet?: string;
  ngayCham?: string;
  trangThai: string;
}

export interface HoiDongBaoVeResponse {
  id: number;
  deTaiId: number;
  tenDeTai: string;
  sinhVienId?: number;
  hoTenSinhVien?: string;
  maSinhVien?: string;
  lopSinhVien?: string;
  ngayBaoVe?: string;
  diaDiem?: string;
  trangThai: string;
  trangThaiDeTai: string;
  thanhViens?: ThanhVienResponse[];
  daChamDiem?: boolean;
  diemBaoVe?: number;
  nhanXetCham?: string;
  dotDangKyId?: number;
}

export interface ThanhVienResponse {
  id: number;
  giangVienId: number;
  hoTenGiangVien: string;
  hocVi?: string;
  vaiTro: string;
  diem?: number;
  nhanXet?: string;
}


export interface DashboardResponse {
  tongSoGiangVien: number;
  tongSoSinhVien: number;
  tongSoDeTai: number;
  deTaiChoDuyet: number;
  deTaiDangThucHien: number;
  deTaiHoanThanh: number;
  deTaiKhongDat: number;
}

export interface DanhSachSinhVienDotDangKyResponse {
  sinhVienDaDangKy: SinhVienResponse[];
  sinhVienChuaDangKy: SinhVienResponse[];
  tongSoSinhVien: number;
  soLuongDaDangKy: number;
  soLuongChuaDangKy: number;
}

// Báo cáo tiến độ
export interface DotBaoCaoTienDoResponse {
  id: number;
  giangVienId: number;
  hoTenGiangVien: string;
  tenDot: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: string;
  createdAt: string;
  soLuongSinhVienNop?: number;
}

export interface BaoCaoTienDoResponse {
  id: number;
  dotBaoCaoTienDoId: number;
  tenDotBaoCao: string;
  deTaiId: number;
  tenDeTai: string;
  sinhVienId?: number;
  hoTenSinhVien?: string;
  maSinhVien?: string;
  lopSinhVien?: string;
  fileBaoCao?: string;
  noiDung?: string;
  ngayNop?: string;
  trangThai: string;
  nhanXet?: string;
  ngayNhanXet?: string;
}

export interface SinhVienHuongDan {
  id: number;
  maSinhVien: string;
  hoTen: string;
  email?: string;
  lop?: string;
  tenDeTai?: string;
}

export interface ThongKePhanCongResponse {
  tongSinhVien: number;
  svDaPhanCongHuongDan: number;
  svChuaPhanCongHuongDan: number;
  svDaPhanCongPhanBien: number;
  svChuaPhanCongPhanBien: number;
  svChoLapHoiDong: number;
}

export interface ThongBaoResponse {
  id: number;
  tieuDe: string;
  noiDung: string;
  ngayDang: string;
  trangThai: boolean;
}

// Quản lý điểm
export interface QuanLyDiemResponse {
  sinhVienId: number;
  hoTen: string;
  maSinhVien: string;
  lop?: string;
  tenBoMon?: string;
  boMonId?: number;
  tenDeTai: string;
  deTaiId: number;
  diemHuongDan?: number;
  diemPhanBien?: number;
  diemBaoVe?: number;
  diemTongBaoVe?: number;
  thanhVienHoiDongList?: ThanhVienHoiDongDiem[];
}

export interface ThanhVienHoiDongDiem {
  hoTen: string;
  vaiTro: string;
  diem?: number;
}

// Phân trang
export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

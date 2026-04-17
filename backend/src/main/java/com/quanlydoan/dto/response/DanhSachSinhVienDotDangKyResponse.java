package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DanhSachSinhVienDotDangKyResponse {
    private List<SinhVienResponse> sinhVienDaDangKy;
    private List<SinhVienResponse> sinhVienChuaDangKy;
    private int tongSoSinhVien;
    private int soLuongDaDangKy;
    private int soLuongChuaDangKy;
}

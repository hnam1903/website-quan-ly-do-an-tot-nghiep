package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhanCongPhanBienResponse {
    private Long id;
    private Long deTaiId;
    private String tenDeTai;
    private String hoTenSinhVien;
    private String maSinhVien;
    private String lopSinhVien;
    private Long giangVienId;
    private String hoTenGiangVien;
    private String deTaiTrangThai;
}

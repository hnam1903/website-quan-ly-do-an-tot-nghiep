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
public class PhanCongSummaryResponse {

    private Long deTaiId;
    private String tenDeTai;

    private Long sinhVienId;
    private String hoTenSinhVien;
    private String maSinhVien;
    private String lopSinhVien;

    private Long boMonId;
    private String tenBoMon;

    private Long dotDangKyId;
    private String tenDot;
    private String namHoc;
    private Integer hocKy;

    private Long gvhdId;
    private String hoTenGvhd;

    private Long gvpbId;
    private String hoTenGvpb;

    private Long hoiDongId;
    private String ngayBaoVe;
    private String diaDiem;
    private String trangThaiHoiDong;
    private List<ThanhVienInfo> thanhVienHoiDong;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThanhVienInfo {
        private Long giangVienId;
        private String hoTen;
        private String vaiTro;
    }
}

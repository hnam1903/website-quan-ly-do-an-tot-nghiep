package com.quanlydoan.dto.response;

import com.quanlydoan.enums.TrangThaiDeTai;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeTaiResponse {
    private Long id;
    private String tenDeTai;
    private String noiDungDuKien;
    private String congNgheSuDung;
    private TrangThaiDeTai trangThai;
    private String ghiChu;
    private Long dotDangKyId;
    private String tenDotDangKy;
    private Long sinhVienId;
    private String hoTenSinhVien;
    private String maSinhVien;
    private String lopSinhVien;
    private Long boMonId;
    private String tenBoMon;
    private Long giangVienHuongDanId;
    private String hoTenGiangVienHuongDan;
    private Long giangVienDuKienId;
    private String hoTenGiangVienDuKien;
    private Long giangVienPhanBienId;
    private String hoTenGiangVienPhanBien;
    private BigDecimal diemHuongDan;
    private BigDecimal diemPhanBien;
    private BigDecimal diemBaoVe;
    private Boolean daChamDiemPB;
    private Boolean daChamDiemHD;
    private LocalDateTime createdAt;
    private String hoTenGiangVienHoiDong;
    private String vaiTroHoiDong;
    private List<ThanhVienInfo> thanhVienHoiDongList;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThanhVienInfo {
        private String hoTen;
        private String vaiTro;
    }
}

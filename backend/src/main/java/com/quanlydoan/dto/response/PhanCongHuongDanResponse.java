package com.quanlydoan.dto.response;

import com.quanlydoan.enums.TrangThaiPhanCong;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhanCongHuongDanResponse {
    private Long id;
    private Long deTaiId;
    private String tenDeTai;
    private String noiDungDuKien;
    private String congNgheSuDung;
    private Long giangVienId;
    private String hoTenGiangVien;
    private TrangThaiPhanCong trangThai;
    private LocalDateTime ngayPhanCong;
    // Thông tin sinh viên
    private Long sinhVienId;
    private String hoTenSinhVien;
    private String maSinhVien;
    private String lopSinhVien;
    private String tenBoMon;
    private Boolean daChamDiem;
    private BigDecimal diemCham;
    private String nhanXetCham;
}

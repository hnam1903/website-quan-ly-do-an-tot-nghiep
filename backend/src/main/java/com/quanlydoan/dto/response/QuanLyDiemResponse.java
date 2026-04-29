package com.quanlydoan.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuanLyDiemResponse {
    
    private Long sinhVienId;
    private String hoTen;
    private String maSinhVien;
    private String lop;
    private String tenBoMon;
    private Long boMonId;
    
    private String tenDeTai;
    private Long deTaiId;
    
    private BigDecimal diemHuongDan;
    private BigDecimal diemPhanBien;
    private BigDecimal diemBaoVe;    // Tổng điểm các thành viên hội đồng (SUM)
    private BigDecimal diemTongBaoVe; // Tổng điểm bao gồm cả điểm phản biện (có PB)
    
    // Danh sách điểm thành viên hội đồng
    private List<ThanhVienHoiDongDiem> thanhVienHoiDongList;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ThanhVienHoiDongDiem {
        private String hoTen;
        private String vaiTro; // chu_tich, thu_ky, uy_vien
        private BigDecimal diem;
    }
}

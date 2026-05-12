package com.quanlydoan.dto.response;

import com.quanlydoan.enums.TrangThaiDotBaoCao;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class DotBaoCaoTienDoResponse {

    private Long id;
    private Long giangVienId;
    private String hoTenGiangVien;
    private String tenDot;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private TrangThaiDotBaoCao trangThai;
    private LocalDateTime createdAt;
    private Integer soLuongSinhVienNop;
    private Integer soLuongSinhVienChuaNop;

    // Thông tin đợt đăng ký liên kết (nullable)
    private Long dotDangKyId;
    private String tenDotDangKy;
    private String namHoc;
    private Integer hocKy;
}

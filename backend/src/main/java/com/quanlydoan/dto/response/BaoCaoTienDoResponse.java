package com.quanlydoan.dto.response;

import com.quanlydoan.enums.TrangThaiBaoCaoTienDo;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class BaoCaoTienDoResponse {

    private Long id;
    private Long dotBaoCaoTienDoId;
    private String tenDotBaoCao;
    private Long deTaiId;
    private String tenDeTai;
    private Long sinhVienId;
    private String hoTenSinhVien;
    private String maSinhVien;
    private String lopSinhVien;
    private String fileBaoCao;
    private String noiDung;
    private LocalDateTime ngayNop;
    private TrangThaiBaoCaoTienDo trangThai;
    private String nhanXet;
    private LocalDateTime ngayNhanXet;
}

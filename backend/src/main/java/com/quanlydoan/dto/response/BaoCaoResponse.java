package com.quanlydoan.dto.response;

import com.quanlydoan.enums.TrangThaiBaoCao;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BaoCaoResponse {
    private Long id;
    private Long deTaiId;
    private String tenDeTai;
    private String hoTenSinhVien;
    private String maSinhVien;
    private String fileBaoCao;
    private String fileSourceCode;
    private LocalDateTime ngayNop;
    private TrangThaiBaoCao trangThai;
}

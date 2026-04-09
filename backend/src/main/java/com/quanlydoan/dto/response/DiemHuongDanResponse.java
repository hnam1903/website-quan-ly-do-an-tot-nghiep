package com.quanlydoan.dto.response;

import com.quanlydoan.enums.TrangThaiDiem;
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
public class DiemHuongDanResponse {
    private Long id;
    private Long deTaiId;
    private String tenDeTai;
    private BigDecimal diem;
    private String nhanXet;
    private LocalDateTime ngayCham;
    private TrangThaiDiem trangThai;
}

package com.quanlydoan.dto.response;

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
public class DiemBaoVeResponse {
    private Long id;
    private Long hoiDongId;
    private Long giangVienId;
    private String hoTenGiangVien;
    private BigDecimal diem;
    private String nhanXet;
    private LocalDateTime createdAt;
}

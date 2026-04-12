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
public class DiemBaoVeResponse {
    private Long id;
    private Long hoiDongId;
    private Long giangVienId;
    private String hoTenGiangVien;
    private String hocVi;
    private BigDecimal diem;
    private TrangThaiDiem trangThai;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

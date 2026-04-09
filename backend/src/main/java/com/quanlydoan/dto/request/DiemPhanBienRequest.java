package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DiemPhanBienRequest {
    @NotNull(message = "ID đề tài không được để trống")
    private Long deTaiId;
    
    @NotNull(message = "Điểm không được để trống")
    private BigDecimal diem;
    
    private String nhanXet;
}

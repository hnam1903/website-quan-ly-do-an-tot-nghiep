package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class DiemBaoVeRequest {
    @NotNull(message = "ID hội đồng không được để trống")
    private Long hoiDongId;
    
    @NotNull(message = "Điểm không được để trống")
    private BigDecimal diem;
    
    private String nhanXet;
}

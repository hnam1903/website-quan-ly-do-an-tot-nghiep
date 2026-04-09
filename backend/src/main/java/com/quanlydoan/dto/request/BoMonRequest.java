package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BoMonRequest {
    @NotBlank(message = "Tên bộ môn không được để trống")
    private String tenBoMon;
    
    @NotBlank(message = "Mã bộ môn không được để trống")
    private String maBoMon;
    
    private Long khoaId;
}

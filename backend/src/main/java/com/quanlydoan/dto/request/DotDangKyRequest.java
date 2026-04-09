package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DotDangKyRequest {
    @NotBlank(message = "Tên đợt không được để trống")
    private String tenDot;
    
    @NotBlank(message = "Năm học không được để trống")
    private String namHoc;
    
    @NotNull(message = "Học kỳ không được để trống")
    private Integer hocKy;
    
    @NotNull(message = "Ngày bắt đầu không được để trống")
    private String ngayBatDau;
}

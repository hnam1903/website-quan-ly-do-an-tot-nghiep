package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PhanCongHuongDanRequest {
    @NotNull(message = "ID đề tài không được để trống")
    private Long deTaiId;
    
    @NotNull(message = "ID giảng viên không được để trống")
    private Long giangVienId;
}

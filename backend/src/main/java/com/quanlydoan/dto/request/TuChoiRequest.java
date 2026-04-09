package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TuChoiRequest {
    @NotBlank(message = "Lý do từ chối không được để trống")
    private String ghiChu;
}

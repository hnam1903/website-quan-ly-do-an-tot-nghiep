package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ThongBaoRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String tieuDe;

    @NotBlank(message = "Nội dung không được để trống")
    private String noiDung;
}

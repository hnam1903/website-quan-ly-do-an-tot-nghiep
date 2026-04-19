package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class DotBaoCaoTienDoRequest {

    @NotBlank(message = "Tên đợt không được trống")
    private String tenDot;

    @NotNull(message = "Ngày bắt đầu không được trống")
    private LocalDateTime ngayBatDau;

    @NotNull(message = "Ngày kết thúc không được trống")
    private LocalDateTime ngayKetThuc;
}

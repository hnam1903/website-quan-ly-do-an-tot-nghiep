package com.quanlydoan.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class GioiHanDeTaiRequest {
    @Min(value = 1, message = "Số đề tài tối thiểu là 1")
    @Max(value = 20, message = "Số đề tài tối đa là 20")
    private Integer soDeTaiToiDa;
}

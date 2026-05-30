package com.quanlydoan.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class GiangVienRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;

    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;

    private String hocVi;

    @NotNull(message = "Bộ môn không được để trống")
    private Long boMonId;

    private String password;

    private Boolean laLanhDao;

    @Min(value = 1, message = "Số đề tài tối thiểu là 1")
    @Max(value = 20, message = "Số đề tài tối đa là 20")
    private Integer soDeTaiToiDa;  // Số đề tài tối đa được hướng dẫn
}

package com.quanlydoan.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SinhVienRequest {
    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    private String email;
    
    @NotBlank(message = "Họ tên không được để trống")
    private String hoTen;
    
    @NotBlank(message = "Mã sinh viên không được để trống")
    private String maSinhVien;
    
    private String lop;
    
    @NotNull(message = "Bộ môn không được để trống")
    private Long boMonId;
    
    private String password;
}

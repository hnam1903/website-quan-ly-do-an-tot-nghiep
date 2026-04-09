package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String role;
    private String hoTen;
    private String hocVi;
    private String maSinhVien;
    private String lop;
    private String tenBoMon;
    private Long boMonId;
}

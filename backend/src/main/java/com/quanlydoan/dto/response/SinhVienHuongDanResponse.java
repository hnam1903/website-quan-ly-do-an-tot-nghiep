package com.quanlydoan.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SinhVienHuongDanResponse {
    private Long id;
    private String maSinhVien;
    private String hoTen;
    private String lop;
    private String tenDeTai;
    private Boolean daChamDiem;
    private Long dotDangKyId;
}

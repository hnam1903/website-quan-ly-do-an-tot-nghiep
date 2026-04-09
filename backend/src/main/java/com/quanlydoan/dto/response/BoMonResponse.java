package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoMonResponse {
    private Long id;
    private String tenBoMon;
    private String maBoMon;
    private Long khoaId;
    private String tenKhoa;
    private Integer soLuongGiangVien;
    private Integer soLuongSinhVien;
}

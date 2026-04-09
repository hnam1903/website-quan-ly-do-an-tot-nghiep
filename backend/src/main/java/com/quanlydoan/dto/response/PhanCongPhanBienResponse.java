package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhanCongPhanBienResponse {
    private Long id;
    private Long deTaiId;
    private String tenDeTai;
    private Long giangVienId;
    private String hoTenGiangVien;
}

package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long tongSoGiangVien;
    private long tongSoSinhVien;
    private long tongSoDeTai;
    private long deTaiChoDuyet;
    private long deTaiDangThucHien;
    private long deTaiHoanThanh;
    private long deTaiKhongDat;
}

package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThongKePhanCongResponse {
    private long tongSinhVien;
    private long svDaPhanCongHuongDan;
    private long svChuaPhanCongHuongDan;
    private long svDaPhanCongPhanBien;
    private long svChuaPhanCongPhanBien;
    private long svChoLapHoiDong;
}

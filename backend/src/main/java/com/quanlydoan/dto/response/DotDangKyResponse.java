package com.quanlydoan.dto.response;

import com.quanlydoan.enums.TrangThaiDot;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DotDangKyResponse {
    private Long id;
    private String tenDot;
    private String namHoc;
    private Integer hocKy;
    private LocalDateTime ngayBatDau;
    private LocalDateTime ngayKetThuc;
    private TrangThaiDot trangThai;
    private Integer soLuongDangKy;
}

package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThongBaoResponse {
    private Long id;
    private String tieuDe;
    private String noiDung;
    private LocalDateTime ngayDang;
    private Boolean trangThai;
}

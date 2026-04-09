package com.quanlydoan.dto.response;

import com.quanlydoan.enums.VaiTroHoiDong;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThanhVienResponse {
    private Long id;
    private Long giangVienId;
    private String hoTenGiangVien;
    private String hocVi;
    private VaiTroHoiDong vaiTro;
}

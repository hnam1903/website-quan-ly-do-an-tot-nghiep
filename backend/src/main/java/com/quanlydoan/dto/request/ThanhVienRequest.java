package com.quanlydoan.dto.request;

import com.quanlydoan.enums.VaiTroHoiDong;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ThanhVienRequest {
    @NotNull(message = "ID giảng viên không được để trống")
    private Long giangVienId;
    
    @NotNull(message = "Vai trò không được để trống")
    private VaiTroHoiDong vaiTro;
}

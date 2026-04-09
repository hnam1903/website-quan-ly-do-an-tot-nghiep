package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class HoiDongRequest {
    @NotNull(message = "ID đề tài không được để trống")
    private Long deTaiId;
    
    private String ngayBaoVe;
    
    private String diaDiem;
    
    @NotEmpty(message = "Hội đồng phải có 3 thành viên")
    private List<ThanhVienRequest> thanhViens;
}

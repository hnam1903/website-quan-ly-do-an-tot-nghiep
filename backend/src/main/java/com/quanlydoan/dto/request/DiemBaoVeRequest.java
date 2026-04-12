package com.quanlydoan.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiemBaoVeRequest {
    
    @NotNull(message = "ID hội đồng không được null")
    private Long hoiDongId;
    
    private String nhanXet;
    
    // Danh sách điểm của từng giảng viên thành viên hội đồng
    private List<DiemThanhVien> diemThanhViens;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DiemThanhVien {
        @NotNull(message = "ID giảng viên không được null")
        private Long giangVienId;
        
        @DecimalMin(value = "0", message = "Điểm phải từ 0")
        @DecimalMax(value = "10", message = "Điểm không được vượt quá 10")
        private BigDecimal diem;
    }
}
package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DeTaiRequest {
    @NotBlank(message = "Tên đề tài không được để trống")
    private String tenDeTai;
    
    private String noiDungDuKien;
    
    private String congNgheSuDung;
    
    private Long giangVienDuKienId;
    
    private Long dotDangKyId;
}

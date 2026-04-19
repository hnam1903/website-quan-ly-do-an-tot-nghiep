package com.quanlydoan.dto.request;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class BaoCaoRequest {
    private Long deTaiId;
    private MultipartFile fileBaoCao;
 
}

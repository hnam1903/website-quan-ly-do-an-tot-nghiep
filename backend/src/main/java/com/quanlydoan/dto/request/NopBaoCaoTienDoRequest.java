package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class NopBaoCaoTienDoRequest {

    @NotNull(message = "ID đợt báo cáo không được trống")
    private Long dotBaoCaoTienDoId;

    private Long deTaiId;

    private String noiDung;

    private MultipartFile fileBaoCao;
}

package com.quanlydoan.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NhanXetBaoCaoTienDoRequest {

    @NotNull(message = "ID báo cáo không được trống")
    private Long baoCaoTienDoId;

    private String nhanXet;

    private String trangThai; // DA_NHAN_XET hoặc BI_TU_CHOI
}

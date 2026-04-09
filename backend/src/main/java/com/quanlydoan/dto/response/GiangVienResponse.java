package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GiangVienResponse {
    private Long id;
    private String hoTen;
    private String hocVi;
    private String email;
    private Long boMonId;
    private String tenBoMon;
    private Boolean laLanhDao;
}

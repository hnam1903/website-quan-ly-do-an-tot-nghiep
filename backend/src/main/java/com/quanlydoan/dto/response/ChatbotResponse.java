package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatbotResponse {
    private List<DeTaiGoiY> danhSachDeTai;
    private String tinNhan;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DeTaiGoiY {
        private String tenDeTai;
        private String noiDungDuKien;
        private String congNgheSuDung;
        private String danhGiaThucTe;
    }
}

package com.quanlydoan.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ThongKeDiemResponse {
    private long tongDeTai;
    private long deTaiCoDiemHuongDan;
    private long deTaiCoDiemPhanBien;
    private long deTaiCoDiemBaoVe;
    private long deTaiHoanThanh;
    
    private double diemHuongDanTrungBinh;
    private double diemPhanBienTrungBinh;
    private double diemBaoVeTrungBinh;

    private double diemHuongDanCaoNhat;
    private double diemPhanBienCaoNhat;
    private double diemBaoVeCaoNhat;
    
    private double diemHuongDanThapNhat;
    private double diemPhanBienThapNhat;
    private double diemBaoVeThapNhat;

    // Điểm tổng bảo vệ
    private double diemTongBaoVeTrungBinh;
    private double diemTongBaoVeCaoNhat;
    private double diemTongBaoVeThapNhat;
}

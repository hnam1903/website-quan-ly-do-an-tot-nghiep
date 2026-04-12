package com.quanlydoan.dto.response;

import com.quanlydoan.enums.TrangThaiHoiDong;
import com.quanlydoan.enums.VaiTroHoiDong;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HoiDongBaoVeResponse {
    private Long id;
    private Long deTaiId;
    private String tenDeTai;
    private String deTai;
    private String sinhVien;
    private Long sinhVienId;
    private String hoTenSinhVien;
    private String maSinhVien;
    private String lopSinhVien;
    private LocalDate ngayBaoVe;
    private String diaDiem;
    private TrangThaiHoiDong trangThai;
    private List<ThanhVienResponse> thanhViens;
    private Boolean daChamDiem;
    private BigDecimal diemBaoVe;
    private String nhanXetCham;
}

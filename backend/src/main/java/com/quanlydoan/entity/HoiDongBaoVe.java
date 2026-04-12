package com.quanlydoan.entity;

import com.quanlydoan.enums.TrangThaiHoiDong;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "hoi_dong_bao_ve")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HoiDongBaoVe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "de_tai_id")
    private DeTai deTai;

    @Column(name = "ngay_bao_ve")
    private LocalDate ngayBaoVe;

    @Column(length = 100)
    private String diaDiem;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TrangThaiHoiDong trangThai = TrangThaiHoiDong.CHO_BAO_VE;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "nhan_xet_bao_ve")
    private String nhanXetBaoVe;

    @OneToMany(mappedBy = "hoiDong", cascade = CascadeType.ALL)
    private List<ThanhVienHoiDong> thanhViens;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

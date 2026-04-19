package com.quanlydoan.entity;

import com.quanlydoan.enums.TrangThaiDeTai;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "de_tai")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeTai {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_de_tai", nullable = false, length = 200)
    private String tenDeTai;

    @Column(name = "noi_dung_du_kien", columnDefinition = "TEXT")
    private String noiDungDuKien;

    @Column(name = "cong_nghe_su_dung", length = 200)
    private String congNgheSuDung;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private TrangThaiDeTai trangThai = TrangThaiDeTai.CHO_DUYET;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dot_dang_ky_id")
    private DotDangKy dotDangKy;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sinh_vien_id")
    private SinhVien sinhVien;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "giang_vien_du_kien_id")
    private GiangVien giangVienDuKien;

    @Column(columnDefinition = "TEXT")
    private String ghiChu;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToOne(mappedBy = "deTai", cascade = CascadeType.ALL)
    private PhanCongHuongDan phanCongHuongDan;

    @OneToOne(mappedBy = "deTai", cascade = CascadeType.ALL)
    private BaoCao baoCao;

    @OneToOne(mappedBy = "deTai", cascade = CascadeType.ALL)
    private DiemHuongDan diemHuongDan;

    @OneToOne(mappedBy = "deTai", cascade = CascadeType.ALL)
    private PhanCongPhanBien phanCongPhanBien;

    @OneToOne(mappedBy = "deTai", cascade = CascadeType.ALL)
    private DiemPhanBien diemPhanBien;

    @OneToOne(mappedBy = "deTai", cascade = CascadeType.ALL)
    private HoiDongBaoVe hoiDongBaoVe;

    @OneToMany(mappedBy = "deTai", cascade = CascadeType.ALL)
    private List<BaoCaoTienDo> danhSachBaoCaoTienDo;


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

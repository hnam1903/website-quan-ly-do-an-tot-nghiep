package com.quanlydoan.entity;

import com.quanlydoan.enums.TrangThaiDot;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "dot_dang_ky")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DotDangKy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_dot", nullable = false, length = 100)
    private String tenDot;

    @Column(name = "nam_hoc", nullable = false, length = 20)
    private String namHoc;

    @Column(name = "hoc_ky", nullable = false)
    private Integer hocKy;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TrangThaiDot trangThai = TrangThaiDot.DANG_MO;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "dotDangKy", cascade = CascadeType.ALL)
    private List<DeTai> deTais;

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

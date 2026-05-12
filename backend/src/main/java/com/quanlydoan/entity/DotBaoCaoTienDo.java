package com.quanlydoan.entity;

import com.quanlydoan.enums.TrangThaiDotBaoCao;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "dot_bao_cao_tien_do")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DotBaoCaoTienDo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "giang_vien_id", nullable = false)
    private GiangVien giangVien;

    @Column(name = "ten_dot", nullable = false, length = 255)
    private String tenDot;

    @Column(name = "ngay_bat_dau", nullable = false)
    private LocalDateTime ngayBatDau;

    @Column(name = "ngay_ket_thuc", nullable = false)
    private LocalDateTime ngayKetThuc;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TrangThaiDotBaoCao trangThai = TrangThaiDotBaoCao.MO;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dot_dang_ky_id")
    private DotDangKy dotDangKy;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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

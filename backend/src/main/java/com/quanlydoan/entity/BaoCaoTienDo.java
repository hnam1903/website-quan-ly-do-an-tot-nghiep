package com.quanlydoan.entity;

import com.quanlydoan.enums.TrangThaiBaoCaoTienDo;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bao_cao_tien_do")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaoCaoTienDo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dot_bao_cao_tien_do_id", nullable = false)
    private DotBaoCaoTienDo dotBaoCaoTienDo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "de_tai_id", nullable = false)
    private DeTai deTai;

    @Column(name = "file_bao_cao", length = 255)
    private String fileBaoCao;

    @Column(name = "noi_dung", columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "ngay_nop")
    private LocalDateTime ngayNop;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TrangThaiBaoCaoTienDo trangThai = TrangThaiBaoCaoTienDo.CHO_NHAN_XET;

    @Column(name = "nhan_xet", columnDefinition = "TEXT")
    private String nhanXet;

    @Column(name = "ngay_nhan_xet")
    private LocalDateTime ngayNhanXet;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        ngayNop = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

package com.quanlydoan.entity;

import com.quanlydoan.enums.TrangThaiBaoCao;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "bao_cao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BaoCao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "de_tai_id")
    private DeTai deTai;

    @Column(name = "file_bao_cao", length = 255)
    private String fileBaoCao;


    @Column(name = "ngay_nop")
    private LocalDateTime ngayNop;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TrangThaiBaoCao trangThai = TrangThaiBaoCao.CHUA_NOP;

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

package com.quanlydoan.entity;

import com.quanlydoan.enums.TrangThaiDiem;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "diem_huong_dan")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiemHuongDan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "de_tai_id")
    private DeTai deTai;

    @Column(precision = 4, scale = 2)
    private BigDecimal diem;

    @Column(columnDefinition = "TEXT")
    private String nhanXet;

    @Column(name = "ngay_cham")
    private LocalDateTime ngayCham;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TrangThaiDiem trangThai = TrangThaiDiem.CHUA_CHAM;

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

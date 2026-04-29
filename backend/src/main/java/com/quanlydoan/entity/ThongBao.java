package com.quanlydoan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "thong_bao")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ThongBao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String tieuDe;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String noiDung;

    @Column(name = "ngay_dang", nullable = false)
    private LocalDateTime ngayDang;

    @Column(name = "trang_thai", nullable = false)
    @Builder.Default
    private Boolean trangThai = true;

    @PrePersist
    protected void onCreate() {
        if (ngayDang == null) {
            ngayDang = LocalDateTime.now();
        }
    }
}

package com.quanlydoan.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "bo_mon")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BoMon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_bo_mon", nullable = false, length = 100)
    private String tenBoMon;

    @Column(name = "ma_bo_mon", unique = true, nullable = false, length = 20)
    private String maBoMon;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "khoa_id")
    private Khoa khoa;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "boMon", cascade = CascadeType.ALL)
    private List<GiangVien> giangViens;

    @OneToMany(mappedBy = "boMon", cascade = CascadeType.ALL)
    private List<SinhVien> sinhViens;

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

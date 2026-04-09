package com.quanlydoan.repository;

import com.quanlydoan.entity.DiemPhanBien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DiemPhanBienRepository extends JpaRepository<DiemPhanBien, Long> {
    Optional<DiemPhanBien> findByDeTaiId(Long deTaiId);
}

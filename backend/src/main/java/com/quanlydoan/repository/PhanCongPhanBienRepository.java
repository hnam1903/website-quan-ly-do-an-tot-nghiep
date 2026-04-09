package com.quanlydoan.repository;

import com.quanlydoan.entity.PhanCongPhanBien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface PhanCongPhanBienRepository extends JpaRepository<PhanCongPhanBien, Long> {
    Optional<PhanCongPhanBien> findByDeTaiId(Long deTaiId);
}

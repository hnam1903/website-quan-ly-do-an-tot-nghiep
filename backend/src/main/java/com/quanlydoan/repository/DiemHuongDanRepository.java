package com.quanlydoan.repository;

import com.quanlydoan.entity.DiemHuongDan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface DiemHuongDanRepository extends JpaRepository<DiemHuongDan, Long> {
    Optional<DiemHuongDan> findByDeTaiId(Long deTaiId);
}

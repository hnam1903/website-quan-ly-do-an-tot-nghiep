package com.quanlydoan.repository;

import com.quanlydoan.entity.BaoCao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface BaoCaoRepository extends JpaRepository<BaoCao, Long> {
    Optional<BaoCao> findByDeTaiId(Long deTaiId);
    boolean existsByDeTaiId(Long deTaiId);
}

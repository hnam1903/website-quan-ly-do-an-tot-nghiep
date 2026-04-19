package com.quanlydoan.repository;

import com.quanlydoan.entity.BaoCaoTienDo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BaoCaoTienDoRepository extends JpaRepository<BaoCaoTienDo, Long> {

    Optional<BaoCaoTienDo> findByDotBaoCaoTienDoIdAndDeTaiId(Long dotBaoCaoId, Long deTaiId);

    List<BaoCaoTienDo> findAllByDotBaoCaoTienDoId(Long dotBaoCaoId);

    List<BaoCaoTienDo> findAllByDeTaiId(Long deTaiId);

    @Query("SELECT b FROM BaoCaoTienDo b WHERE b.dotBaoCaoTienDo.id = :dotId AND b.deTai.sinhVien.id = :sinhVienId")
    Optional<BaoCaoTienDo> findByDotAndSinhVien(@Param("dotId") Long dotId, @Param("sinhVienId") Long sinhVienId);

    @Query("SELECT b FROM BaoCaoTienDo b WHERE b.deTai.sinhVien.id = :sinhVienId ORDER BY b.ngayNop DESC")
    List<BaoCaoTienDo> findAllBySinhVien(@Param("sinhVienId") Long sinhVienId);

    boolean existsByDotBaoCaoTienDoIdAndDeTaiId(Long dotBaoCaoId, Long deTaiId);
}

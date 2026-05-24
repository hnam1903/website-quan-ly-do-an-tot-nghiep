package com.quanlydoan.repository;

import com.quanlydoan.entity.DiemBaoVe;
import com.quanlydoan.entity.HoiDongBaoVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiemBaoVeRepository extends JpaRepository<DiemBaoVe, Long> {

    List<DiemBaoVe> findByHoiDongId(Long hoiDongId);

    Optional<DiemBaoVe> findByHoiDongIdAndGiangVienId(Long hoiDongId, Long giangVienId);

    @Query("SELECT ROUND(AVG(d.diem), 2) FROM DiemBaoVe d WHERE d.hoiDong.id = :hoiDongId AND d.diem IS NOT NULL")
    BigDecimal calculateAverageDiemByHoiDongId(@Param("hoiDongId") Long hoiDongId);

    @Query("SELECT COALESCE(SUM(d.diem), 0) FROM DiemBaoVe d WHERE d.hoiDong.id = :hoiDongId AND d.diem IS NOT NULL")
    BigDecimal calculateSumDiemByHoiDongId(@Param("hoiDongId") Long hoiDongId);

}

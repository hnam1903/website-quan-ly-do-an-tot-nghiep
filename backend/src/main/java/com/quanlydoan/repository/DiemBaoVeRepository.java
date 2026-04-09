package com.quanlydoan.repository;

import com.quanlydoan.entity.DiemBaoVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DiemBaoVeRepository extends JpaRepository<DiemBaoVe, Long> {
    List<DiemBaoVe> findByHoiDongId(Long hoiDongId);
    Optional<DiemBaoVe> findByHoiDongIdAndGiangVienId(Long hoiDongId, Long giangVienId);
    
    @Query("SELECT AVG(dbv.diem) FROM DiemBaoVe dbv WHERE dbv.hoiDong.id = :hoiDongId")
    Double calculateAverageDiemByHoiDongId(@Param("hoiDongId") Long hoiDongId);
}

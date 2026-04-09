package com.quanlydoan.repository;

import com.quanlydoan.entity.HoiDongBaoVe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface HoiDongBaoVeRepository extends JpaRepository<HoiDongBaoVe, Long> {
    Optional<HoiDongBaoVe> findByDeTaiId(Long deTaiId);
    
    @Query("SELECT hd FROM HoiDongBaoVe hd JOIN hd.thanhViens tv WHERE tv.giangVien.id = :gvId")
    List<HoiDongBaoVe> findAllByGiangVienId(@Param("gvId") Long gvId);
}

package com.quanlydoan.repository;

import com.quanlydoan.entity.PhanCongHuongDan;
import com.quanlydoan.enums.TrangThaiPhanCong;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PhanCongHuongDanRepository extends JpaRepository<PhanCongHuongDan, Long> {
    Optional<PhanCongHuongDan> findByDeTaiId(Long deTaiId);
    List<PhanCongHuongDan> findByGiangVienId(Long giangVienId);
    List<PhanCongHuongDan> findByGiangVienIdAndTrangThai(Long giangVienId, TrangThaiPhanCong trangThai);
    
    @Query("SELECT pchd FROM PhanCongHuongDan pchd WHERE pchd.giangVien.id = :gvId AND pchd.trangThai = :trangThai")
    List<PhanCongHuongDan> findByGiangVienAndTrangThai(@Param("gvId") Long gvId, @Param("trangThai") TrangThaiPhanCong trangThai);
}

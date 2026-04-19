package com.quanlydoan.repository;

import com.quanlydoan.entity.DeTai;
import com.quanlydoan.enums.TrangThaiDeTai;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface DeTaiRepository extends JpaRepository<DeTai, Long> {
    List<DeTai> findByTrangThai(TrangThaiDeTai trangThai);

    List<DeTai> findByDotDangKyId(Long dotDangKyId);
    List<DeTai> findByDotDangKyIdAndTrangThai(Long dotDangKyId, TrangThaiDeTai trangThai);
    List<DeTai> findByTrangThaiIn(List<TrangThaiDeTai> trangThais);
    List<DeTai> findByDotDangKyIdAndTrangThaiIn(Long dotDangKyId, List<TrangThaiDeTai> trangThais);
    List<DeTai> findBySinhVienId(Long sinhVienId);
    
    @Query("SELECT dt FROM DeTai dt WHERE dt.sinhVien.boMon.id = :boMonId")
    List<DeTai> findAllByBoMonId(@Param("boMonId") Long boMonId);
    
    @Query("SELECT dt FROM DeTai dt WHERE dt.sinhVien.boMon.id = :boMonId AND dt.trangThai = :trangThai")
    List<DeTai> findByBoMonIdAndTrangThai(@Param("boMonId") Long boMonId, @Param("trangThai") TrangThaiDeTai trangThai);
    
    @Query("SELECT dt FROM DeTai dt WHERE dt.phanCongHuongDan.giangVien.id = :gvId")
    List<DeTai> findByGiangVienHuongDanId(@Param("gvId") Long gvId);
    
    @Query("SELECT dt FROM DeTai dt WHERE dt.phanCongPhanBien.giangVien.id = :gvId")
    List<DeTai> findByGiangVienPhanBienId(@Param("gvId") Long gvId);
    
    @Query("SELECT COUNT(dt) FROM DeTai dt WHERE dt.trangThai = :trangThai")
    long countByTrangThai(@Param("trangThai") TrangThaiDeTai trangThai);
    
    @Query("SELECT dt FROM DeTai dt JOIN dt.sinhVien sv WHERE sv.boMon.id = :boMonId AND dt.trangThai IN :trangThais")
    List<DeTai> findByBoMonIdAndTrangThaiIn(@Param("boMonId") Long boMonId, @Param("trangThais") List<TrangThaiDeTai> trangThais);
}

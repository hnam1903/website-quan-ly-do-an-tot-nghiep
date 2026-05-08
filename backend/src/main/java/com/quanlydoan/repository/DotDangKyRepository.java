package com.quanlydoan.repository;

import com.quanlydoan.entity.DotDangKy;
import com.quanlydoan.enums.TrangThaiDot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DotDangKyRepository extends JpaRepository<DotDangKy, Long> {
    List<DotDangKy> findByTrangThai(TrangThaiDot trangThai);
    List<DotDangKy> findAllByOrderByNgayBatDauDesc();

    @Query("SELECT DISTINCT d.dotDangKy FROM DeTai d WHERE d.sinhVien.boMon.id = :boMonId")
    List<DotDangKy> findByBoMonId(@Param("boMonId") Long boMonId);
}

package com.quanlydoan.repository;

import com.quanlydoan.entity.DotDangKy;
import com.quanlydoan.enums.TrangThaiDot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DotDangKyRepository extends JpaRepository<DotDangKy, Long> {
    List<DotDangKy> findByTrangThai(TrangThaiDot trangThai);
    List<DotDangKy> findAllByOrderByNgayBatDauDesc();
}

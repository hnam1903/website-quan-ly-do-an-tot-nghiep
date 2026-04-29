package com.quanlydoan.repository;

import com.quanlydoan.entity.ThongBao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ThongBaoRepository extends JpaRepository<ThongBao, Long> {
    List<ThongBao> findByTrangThaiTrueOrderByNgayDangDesc();
    List<ThongBao> findAllByOrderByNgayDangDesc();
}

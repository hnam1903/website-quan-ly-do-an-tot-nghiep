package com.quanlydoan.repository;

import com.quanlydoan.entity.DotBaoCaoTienDo;
import com.quanlydoan.enums.TrangThaiDotBaoCao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface DotBaoCaoTienDoRepository extends JpaRepository<DotBaoCaoTienDo, Long> {

    List<DotBaoCaoTienDo> findAllByGiangVienIdOrderByCreatedAtDesc(Long giangVienId);

    List<DotBaoCaoTienDo> findByGiangVienIdAndTrangThai(Long giangVienId, TrangThaiDotBaoCao trangThai);

    @Query("SELECT d FROM DotBaoCaoTienDo d WHERE d.giangVien.id = :giangVienId AND d.trangThai = 'MO' ORDER BY d.ngayKetThuc ASC")
    List<DotBaoCaoTienDo> findDangMoByGiangVien(@Param("giangVienId") Long giangVienId);

    @Query("SELECT d FROM DotBaoCaoTienDo d WHERE d.giangVien.id = :giangVienId ORDER BY d.createdAt DESC")
    List<DotBaoCaoTienDo> findAllByGiangVien(@Param("giangVienId") Long giangVienId);
}

package com.quanlydoan.repository;

import com.quanlydoan.entity.BoMon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface BoMonRepository extends JpaRepository<BoMon, Long> {
    Optional<BoMon> findByMaBoMon(String maBoMon);
    Optional<BoMon> findByTenBoMonIgnoreCase(String tenBoMon);
    List<BoMon> findByKhoaId(Long khoaId);
    
    @Query("SELECT bm FROM BoMon bm WHERE bm.khoa.id = :khoaId")
    List<BoMon> findAllByKhoaId(@Param("khoaId") Long khoaId);
}

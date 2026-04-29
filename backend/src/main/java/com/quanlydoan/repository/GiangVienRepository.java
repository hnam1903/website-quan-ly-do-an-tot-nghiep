package com.quanlydoan.repository;

import com.quanlydoan.entity.GiangVien;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface GiangVienRepository extends JpaRepository<GiangVien, Long> {
    Optional<GiangVien> findByTaiKhoanEmail(String email);
    
    @Query("SELECT gv FROM GiangVien gv WHERE gv.boMon.id = :boMonId")
    List<GiangVien> findAllByBoMonId(@Param("boMonId") Long boMonId);
    
    @Query("SELECT gv FROM GiangVien gv WHERE gv.laLanhDao = true AND gv.boMon.id = :boMonId")
    Optional<GiangVien> findLanhDaoByBoMonId(@Param("boMonId") Long boMonId);
    
    @Query("SELECT gv FROM GiangVien gv JOIN gv.taiKhoan tk WHERE tk.email = :email")
    Optional<GiangVien> findByEmail(@Param("email") String email);
    
    // Phân trang
    Page<GiangVien> findAll(Pageable pageable);
    
    Page<GiangVien> findByBoMonId(Long boMonId, Pageable pageable);
    
    @Query("SELECT gv FROM GiangVien gv JOIN FETCH gv.taiKhoan tk JOIN FETCH gv.boMon WHERE LOWER(gv.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(tk.email) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<GiangVien> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT gv FROM GiangVien gv JOIN FETCH gv.taiKhoan tk JOIN FETCH gv.boMon WHERE gv.boMon.id = :boMonId AND (LOWER(gv.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(tk.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<GiangVien> searchByKeywordAndBoMon(@Param("keyword") String keyword, @Param("boMonId") Long boMonId, Pageable pageable);
}

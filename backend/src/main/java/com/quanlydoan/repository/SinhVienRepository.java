package com.quanlydoan.repository;

import com.quanlydoan.entity.SinhVien;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SinhVienRepository extends JpaRepository<SinhVien, Long> {
    Optional<SinhVien> findByMaSinhVien(String maSinhVien);
    boolean existsByMaSinhVien(String maSinhVien);
    Optional<SinhVien> findByTaiKhoanEmail(String email);
    
    List<SinhVien> findAllByBoMonId(Long boMonId);
    
    @Query("SELECT sv FROM SinhVien sv JOIN FETCH sv.taiKhoan tk WHERE tk.email = :email")
    Optional<SinhVien> findByEmail(@Param("email") String email);
    
    // Phân trang
    Page<SinhVien> findAll(Pageable pageable);
    
    Page<SinhVien> findByBoMonId(Long boMonId, Pageable pageable);
    
    @Query("SELECT sv FROM SinhVien sv JOIN FETCH sv.taiKhoan tk JOIN FETCH sv.boMon WHERE LOWER(sv.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(sv.maSinhVien) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<SinhVien> searchByKeyword(@Param("keyword") String keyword, Pageable pageable);
    
    @Query("SELECT sv FROM SinhVien sv JOIN FETCH sv.taiKhoan tk JOIN FETCH sv.boMon WHERE sv.boMon.id = :boMonId AND (LOWER(sv.hoTen) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(sv.maSinhVien) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<SinhVien> searchByKeywordAndBoMon(@Param("keyword") String keyword, @Param("boMonId") Long boMonId, Pageable pageable);
}

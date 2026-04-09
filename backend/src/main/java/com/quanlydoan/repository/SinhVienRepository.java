package com.quanlydoan.repository;

import com.quanlydoan.entity.SinhVien;
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
}

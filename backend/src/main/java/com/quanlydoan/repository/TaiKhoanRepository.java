package com.quanlydoan.repository;

import com.quanlydoan.entity.TaiKhoan;
import com.quanlydoan.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaiKhoanRepository extends JpaRepository<TaiKhoan, Long> {
    Optional<TaiKhoan> findByEmail(String email);
    boolean existsByEmail(String email);
    List<TaiKhoan> findByRole(Role role);
}

package com.quanlydoan.config;

import com.quanlydoan.entity.*;
import com.quanlydoan.enums.Role;
import com.quanlydoan.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final KhoaRepository khoaRepository;
    private final BoMonRepository boMonRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final GiangVienRepository giangVienRepository;
    private final SinhVienRepository sinhVienRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (!taiKhoanRepository.existsByEmail("admin@gmail.com")) {
            TaiKhoan admin = TaiKhoan.builder()
                    .email("admin@gmail.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .trangThai(true)
                    .build();
            taiKhoanRepository.save(admin);
            System.out.println("Tạo tài khoản Admin: admin@gmail.com / admin123");
        }



    }
}

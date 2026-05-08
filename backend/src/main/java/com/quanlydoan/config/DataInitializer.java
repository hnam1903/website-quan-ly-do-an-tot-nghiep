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

    private final TaiKhoanRepository taiKhoanRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {

        if (!taiKhoanRepository.existsByEmail("admin@humg.edu.vn")) {
            TaiKhoan admin = TaiKhoan.builder()
                    .email("admin@humg.edu.vn")
                    .password(passwordEncoder.encode("123456"))
                    .role(Role.ADMIN)
                    .trangThai(true)
                    .build();
            taiKhoanRepository.save(admin);

        }



    }
}

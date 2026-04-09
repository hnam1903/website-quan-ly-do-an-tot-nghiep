package com.quanlydoan.service;

import com.quanlydoan.dto.request.LoginRequest;
import com.quanlydoan.dto.request.RegisterRequest;
import com.quanlydoan.dto.response.AuthResponse;
import com.quanlydoan.dto.response.UserResponse;
import com.quanlydoan.entity.*;
import com.quanlydoan.enums.Role;
import com.quanlydoan.exception.BadRequestException;
import com.quanlydoan.exception.ResourceNotFoundException;
import com.quanlydoan.repository.*;
import com.quanlydoan.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final TaiKhoanRepository taiKhoanRepository;
    private final GiangVienRepository giangVienRepository;
    private final SinhVienRepository sinhVienRepository;
    private final KhoaRepository khoaRepository;
    private final BoMonRepository boMonRepository;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String token = tokenProvider.generateToken(request.getEmail());

        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(taiKhoan.getId())
                .email(taiKhoan.getEmail())
                .role(taiKhoan.getRole())
                .build();
    }

    @Transactional
    public UserResponse registerGiangVien(RegisterRequest request, String hoTen, Long boMonId, String hocVi, Boolean laLanhDao) {
        if (taiKhoanRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        TaiKhoan taiKhoan = TaiKhoan.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.GIANG_VIEN)
                .build();
        taiKhoan = taiKhoanRepository.save(taiKhoan);

        BoMon boMon = boMonRepository.findById(boMonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ môn"));

        GiangVien giangVien = GiangVien.builder()
                .taiKhoan(taiKhoan)
                .hoTen(hoTen)
                .hocVi(hocVi)
                .boMon(boMon)
                .laLanhDao(laLanhDao != null && laLanhDao)
                .build();
        giangVien = giangVienRepository.save(giangVien);

        return mapToUserResponse(taiKhoan, giangVien, null);
    }

    @Transactional
    public UserResponse registerSinhVien(RegisterRequest request, String hoTen, String maSinhVien, String lop, Long boMonId) {
        if (taiKhoanRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email đã tồn tại");
        }

        TaiKhoan taiKhoan = TaiKhoan.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.SINH_VIEN)
                .build();
        taiKhoan = taiKhoanRepository.save(taiKhoan);

        BoMon boMon = boMonRepository.findById(boMonId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ môn"));

        SinhVien sinhVien = SinhVien.builder()
                .taiKhoan(taiKhoan)
                .hoTen(hoTen)
                .maSinhVien(maSinhVien)
                .lop(lop)
                .boMon(boMon)
                .build();
        sinhVien = sinhVienRepository.save(sinhVien);

        return mapToUserResponse(taiKhoan, null, sinhVien);
    }

    public UserResponse getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        
        TaiKhoan taiKhoan = taiKhoanRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        switch (taiKhoan.getRole()) {
            case GIANG_VIEN, LANH_DAO_BO_MON -> {
                GiangVien giangVien = giangVienRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));
                return mapToUserResponse(taiKhoan, giangVien, null);
            }
            case SINH_VIEN -> {
                SinhVien sinhVien = sinhVienRepository.findByEmail(email)
                        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên"));
                return mapToUserResponse(taiKhoan, null, sinhVien);
            }
            default -> {
                return UserResponse.builder()
                        .id(taiKhoan.getId())
                        .email(taiKhoan.getEmail())
                        .role(taiKhoan.getRole().name())
                        .build();
            }
        }
    }

    private UserResponse mapToUserResponse(TaiKhoan taiKhoan, GiangVien giangVien, SinhVien sinhVien) {
        UserResponse.UserResponseBuilder builder = UserResponse.builder()
                .id(taiKhoan.getId())
                .email(taiKhoan.getEmail())
                .role(taiKhoan.getRole().name());

        if (giangVien != null) {
            builder.hoTen(giangVien.getHoTen())
                   .hocVi(giangVien.getHocVi())
                   .boMonId(giangVien.getBoMon() != null ? giangVien.getBoMon().getId() : null)
                   .tenBoMon(giangVien.getBoMon() != null ? giangVien.getBoMon().getTenBoMon() : null);
        }

        if (sinhVien != null) {
            builder.hoTen(sinhVien.getHoTen())
                   .maSinhVien(sinhVien.getMaSinhVien())
                   .lop(sinhVien.getLop())
                   .boMonId(sinhVien.getBoMon() != null ? sinhVien.getBoMon().getId() : null)
                   .tenBoMon(sinhVien.getBoMon() != null ? sinhVien.getBoMon().getTenBoMon() : null);
        }

        return builder.build();
    }
}

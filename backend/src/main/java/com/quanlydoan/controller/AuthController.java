package com.quanlydoan.controller;

import com.quanlydoan.dto.request.*;
import com.quanlydoan.dto.response.*;
import com.quanlydoan.service.AuthService;
import com.quanlydoan.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AdminService adminService;

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
    }

    @PostMapping("/register/giang-vien")
    public ResponseEntity<ApiResponse<UserResponse>> registerGiangVien(
            @Valid @RequestBody RegisterGiangVienRequest request) {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail(request.getEmail());
        registerRequest.setPassword(request.getPassword());
        registerRequest.setRole(com.quanlydoan.enums.Role.GIANG_VIEN);
        
        UserResponse response = authService.registerGiangVien(
                registerRequest,
                request.getHoTen(),
                request.getBoMonId(),
                request.getHocVi(),
                request.getLaLanhDao()
        );
        return ResponseEntity.ok(ApiResponse.success("Đăng ký giảng viên thành công", response));
    }

    @PostMapping("/register/sinh-vien")
    public ResponseEntity<ApiResponse<UserResponse>> registerSinhVien(
            @Valid @RequestBody RegisterSinhVienRequest request) {
        RegisterRequest registerRequest = new RegisterRequest();
        registerRequest.setEmail(request.getEmail());
        registerRequest.setPassword(request.getPassword());
        registerRequest.setRole(com.quanlydoan.enums.Role.SINH_VIEN);
        
        UserResponse response = authService.registerSinhVien(
                registerRequest,
                request.getHoTen(),
                request.getMaSinhVien(),
                request.getLop(),
                request.getBoMonId()
        );
        return ResponseEntity.ok(ApiResponse.success("Đăng ký sinh viên thành công", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

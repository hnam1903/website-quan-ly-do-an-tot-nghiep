package com.quanlydoan.controller;

import com.quanlydoan.dto.request.*;
import com.quanlydoan.dto.response.*;
import com.quanlydoan.service.BoMonService;
import com.quanlydoan.service.AuthService;
import com.quanlydoan.enums.TrangThaiDeTai;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bo-mon")
@RequiredArgsConstructor
public class BoMonController {

    private final BoMonService boMonService;
    private final AuthService authService;

    @GetMapping("/bo-mon")
    public ResponseEntity<ApiResponse<List<BoMonResponse>>> getAllBoMon() {
        return ResponseEntity.ok(ApiResponse.success(boMonService.getAllBoMon()));
    }

    @GetMapping("/de-tai")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getDeTai(
            @RequestParam(required = false) Long boMonId,
            @RequestParam(required = false) String trangThai) {

        UserResponse currentUser = authService.getCurrentUser();
        Long targetBoMonId = boMonId != null ? boMonId : currentUser.getBoMonId();

        List<DeTaiResponse> deTais;
        if (trangThai == null || trangThai.isBlank()) {
            deTais = boMonService.getDeTaiByBoMon(targetBoMonId);
        } else {
            try {
                TrangThaiDeTai enumTrangThai = TrangThaiDeTai.valueOf(trangThai);
                deTais = boMonService.getDeTaiByTrangThai(targetBoMonId, enumTrangThai);
            } catch (IllegalArgumentException ex) {
                // Nếu FE gửi giá trị không nằm trong enum, fallback hiển thị theo bộ môn
                deTais = boMonService.getDeTaiByBoMon(targetBoMonId);
            }
        }

        return ResponseEntity.ok(ApiResponse.success(deTais));
    }

    @PutMapping("/de-tai/{id}/duyet")
    public ResponseEntity<ApiResponse<DeTaiResponse>> duyetDeTai(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Duyệt đề tài thành công", boMonService.duyetDeTaiBoMon(id)));
    }

    @PutMapping("/de-tai/{id}/tu-choi")
    public ResponseEntity<ApiResponse<DeTaiResponse>> tuChoiDeTai(
            @PathVariable Long id, @RequestBody(required = false) String ghiChu) {
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối. Sinh viên sẽ đăng ký lại.", boMonService.tuChoiDeTaiBoMon(id, ghiChu)));
    }

    @GetMapping("/de-tai/khong-dat")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getDeTaiKhongDat(
            @RequestParam(required = false) Long boMonId,
            @RequestParam String loai) {
        
        UserResponse currentUser = authService.getCurrentUser();
        Long targetBoMonId = boMonId != null ? boMonId : currentUser.getBoMonId();
        
        return ResponseEntity.ok(ApiResponse.success(boMonService.getDeTaiKhongDat(targetBoMonId, loai)));
    }

    @GetMapping("/giang-vien")
    public ResponseEntity<ApiResponse<List<GiangVienResponse>>> getGiangVien(
            @RequestParam(required = false) Long boMonId) {

        UserResponse currentUser = authService.getCurrentUser();
        Long targetBoMonId = boMonId != null ? boMonId : currentUser.getBoMonId();

        return ResponseEntity.ok(ApiResponse.success(boMonService.getGiangVienByBoMon(targetBoMonId)));
    }

    @GetMapping("/sinh-vien")
    public ResponseEntity<ApiResponse<List<SinhVienResponse>>> getSinhVien(
            @RequestParam(required = false) Long boMonId) {

        UserResponse currentUser = authService.getCurrentUser();
        List<SinhVienResponse> sinhViens;
        
        if ("ADMIN".equals(currentUser.getRole())) {
            sinhViens = boMonService.getAllSinhVien(boMonId);
        } else {
            Long targetBoMonId = boMonId != null ? boMonId : currentUser.getBoMonId();
            sinhViens = boMonService.getSinhVienByBoMon(targetBoMonId);
        }

        return ResponseEntity.ok(ApiResponse.success(sinhViens));
    }

    @PostMapping("/phan-cong-huong-dan")
    public ResponseEntity<ApiResponse<PhanCongHuongDanResponse>> phanCongHuongDan(
            @Valid @RequestBody PhanCongHuongDanRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Phân công thành công", boMonService.phanCongHuongDan(request)));
    }

    @PostMapping("/phan-cong-phan-bien")
    public ResponseEntity<ApiResponse<PhanCongPhanBienResponse>> phanCongPhanBien(
            @Valid @RequestBody PhanCongPhanBienRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Phân công thành công", boMonService.phanCongPhanBien(request)));
    }

    @PostMapping("/hoi-dong")
    public ResponseEntity<ApiResponse<HoiDongBaoVeResponse>> taoHoiDong(
            @Valid @RequestBody HoiDongRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tạo hội đồng thành công", boMonService.taoHoiDong(request)));
    }

    @GetMapping("/bao-cao")
    public ResponseEntity<ApiResponse<List<BaoCaoResponse>>> getBaoCao() {
        UserResponse currentUser = authService.getCurrentUser();
        Long targetBoMonId = currentUser.getBoMonId();
        return ResponseEntity.ok(ApiResponse.success(boMonService.getBaoCaoByBoMon(targetBoMonId)));
    }
}

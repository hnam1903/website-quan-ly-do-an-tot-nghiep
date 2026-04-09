package com.quanlydoan.controller;

import com.quanlydoan.dto.request.*;
import com.quanlydoan.dto.response.*;
import com.quanlydoan.enums.TrangThaiDeTai;
import com.quanlydoan.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // Đợt đăng ký
    @GetMapping("/dot-dang-ky")
    public ResponseEntity<ApiResponse<List<DotDangKyResponse>>> getAllDotDangKy() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllDotDangKy()));
    }

    @GetMapping("/dot-dang-ky/{id}")
    public ResponseEntity<ApiResponse<DotDangKyResponse>> getDotDangKyById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDotDangKyById(id)));
    }

    @PostMapping("/dot-dang-ky")
    public ResponseEntity<ApiResponse<DotDangKyResponse>> createDotDangKy(@Valid @RequestBody DotDangKyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tạo đợt đăng ký thành công", adminService.createDotDangKy(request)));
    }

    @PutMapping("/dot-dang-ky/{id}")
    public ResponseEntity<ApiResponse<DotDangKyResponse>> updateDotDangKy(
            @PathVariable Long id, @Valid @RequestBody DotDangKyRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", adminService.updateDotDangKy(id, request)));
    }

    @DeleteMapping("/dot-dang-ky/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDotDangKy(@PathVariable Long id) {
        adminService.deleteDotDangKy(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thành công", null));
    }

    // Gửi lên Bộ môn
    @GetMapping("/de-tai")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getDeTaiDangKy(
            @RequestParam(required = false) Long dotDangKyId,
            @RequestParam(required = false) TrangThaiDeTai trangThai) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDeTaiDangKy(dotDangKyId, trangThai)));
    }

    @PutMapping("/de-tai/{id}/gui-bo-mon")
    public ResponseEntity<ApiResponse<DeTaiResponse>> guiLenBoMon(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Đã gửi lên Bộ môn thành công", adminService.guiLenBoMon(id)));
    }

    @PutMapping("/de-tai/gui-bo-mon")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> guiNhieuLenBoMon(@RequestBody List<Long> ids) {
        return ResponseEntity.ok(ApiResponse.success("Đã gửi " + ids.size() + " đề tài lên Bộ môn thành công", adminService.guiNhieuLenBoMon(ids)));
    }


    // Đề tài bị từ chối
    @GetMapping("/de-tai/bi-tu-choi")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getDeTaiBiTuChoi(
            @RequestParam(required = false) Long dotDangKyId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDeTaiBiTuChoi(dotDangKyId)));
    }

    @DeleteMapping("/de-tai/{id}/xoa")
    public ResponseEntity<ApiResponse<Void>> xoaDeTaiBiTuChoi(@PathVariable Long id) {
        adminService.xoaDeTaiBiTuChoi(id);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa đề tài bị từ chối", null));
    }

    @DeleteMapping("/de-tai/xoa-nhieu")
    public ResponseEntity<ApiResponse<Void>> xoaNhieuDeTaiBiTuChoi(@RequestBody List<Long> ids) {
        adminService.xoaNhieuDeTaiBiTuChoi(ids);
        return ResponseEntity.ok(ApiResponse.success("Đã xóa " + ids.size() + " đề tài bị từ chối", null));
    }


    // Bộ môn
    @GetMapping("/bo-mon")
    public ResponseEntity<ApiResponse<List<BoMonResponse>>> getAllBoMon() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllBoMon()));
    }

    @GetMapping("/bo-mon/{id}")
    public ResponseEntity<ApiResponse<BoMonResponse>> getBoMonById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getBoMonById(id)));
    }

    @PostMapping("/bo-mon")
    public ResponseEntity<ApiResponse<BoMonResponse>> createBoMon(@Valid @RequestBody BoMonRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tạo bộ môn thành công", adminService.createBoMon(request)));
    }

    @PutMapping("/bo-mon/{id}")
    public ResponseEntity<ApiResponse<BoMonResponse>> updateBoMon(
            @PathVariable Long id, @Valid @RequestBody BoMonRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", adminService.updateBoMon(id, request)));
    }

    @DeleteMapping("/bo-mon/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteBoMon(@PathVariable Long id) {
        adminService.deleteBoMon(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thành công", null));
    }

    // Giảng viên
    @GetMapping("/giang-vien")
    public ResponseEntity<ApiResponse<List<GiangVienResponse>>> getAllGiangVien(
            @RequestParam(required = false) Long boMonId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllGiangVien(boMonId)));
    }

    @GetMapping("/giang-vien/{id}")
    public ResponseEntity<ApiResponse<GiangVienResponse>> getGiangVienById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getGiangVienById(id)));
    }

    @PutMapping("/giang-vien/{id}")
    public ResponseEntity<ApiResponse<GiangVienResponse>> updateGiangVien(
            @PathVariable Long id, @Valid @RequestBody GiangVienRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", adminService.updateGiangVien(id, request)));
    }

    @PutMapping("/giang-vien/{id}/lanh-dao")
    public ResponseEntity<ApiResponse<GiangVienResponse>> setLanhDaoBoMon(
            @PathVariable Long id, @RequestParam Boolean isLanhDao) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", adminService.setLanhDaoBoMon(id, isLanhDao)));
    }

    @DeleteMapping("/giang-vien/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGiangVien(@PathVariable Long id) {
        adminService.deleteGiangVien(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thành công", null));
    }

    // Sinh viên
    @GetMapping("/sinh-vien")
    public ResponseEntity<ApiResponse<List<SinhVienResponse>>> getAllSinhVien(
            @RequestParam(required = false) Long boMonId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllSinhVien(boMonId)));
    }

    @GetMapping("/sinh-vien/{id}")
    public ResponseEntity<ApiResponse<SinhVienResponse>> getSinhVienById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getSinhVienById(id)));
    }

    @PutMapping("/sinh-vien/{id}")
    public ResponseEntity<ApiResponse<SinhVienResponse>> updateSinhVien(
            @PathVariable Long id, @Valid @RequestBody SinhVienRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", adminService.updateSinhVien(id, request)));
    }

    @DeleteMapping("/sinh-vien/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSinhVien(@PathVariable Long id) {
        adminService.deleteSinhVien(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thành công", null));
    }

    // Dashboard
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDashboard()));
    }

    // Thống kê
    @GetMapping("/thong-ke")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getThongKeTongHop(
            @RequestParam(required = false) Long dotDangKyId,
            @RequestParam(required = false) Long boMonId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getThongKeTongHop(dotDangKyId, boMonId)));
    }
}

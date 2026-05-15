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

    @PutMapping("/dot-dang-ky/{id}/dong")
    public ResponseEntity<ApiResponse<DotDangKyResponse>> dongDotDangKy(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Đã đóng đợt đăng ký", adminService.dongDotDangKy(id)));
    }

    @PutMapping("/dot-dang-ky/{id}/mo-lai")
    public ResponseEntity<ApiResponse<DotDangKyResponse>> moLaiDotDangKy(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Đã mở lại đợt đăng ký", adminService.moLaiDotDangKy(id)));
    }

    // Danh sách sinh viên theo đợt đăng ký
    @GetMapping("/dot-dang-ky/{id}/sinh-vien")
    public ResponseEntity<ApiResponse<DanhSachSinhVienDotDangKyResponse>> getSinhVienByDotDangKy(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDanhSachSinhVienByDotDangKy(id)));
    }

    @GetMapping("/de-tai")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getDeTaiDangKy(
            @RequestParam(required = false) Long dotDangKyId,
            @RequestParam(required = false) TrangThaiDeTai trangThai,
            @RequestParam(required = false) Long boMonId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDeTaiDangKy(dotDangKyId, trangThai, boMonId)));
    }

    //  Đề tài không đạt
    @GetMapping("/de-tai/khong-dat")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getDeTaiKhongDat(
            @RequestParam(required = false) Long dotDangKyId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getDeTaiKhongDat(dotDangKyId)));
    }

    @DeleteMapping("/de-tai/{id}/xoa")
    public ResponseEntity<ApiResponse<Void>> xoaDeTai(@PathVariable Long id) {
        adminService.xoaDeTai(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa đề tài thành công", null));
    }

    //  Bộ môn
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

    // Quản lý điểm
    @GetMapping("/quan-ly-diem")
    public ResponseEntity<ApiResponse<List<QuanLyDiemResponse>>> getQuanLyDiem(
            @RequestParam(required = false) Long boMonId,
            @RequestParam(required = false) Long dotDangKyId) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getQuanLyDiem(boMonId, dotDangKyId)));
    }

    //  Quản lý Tài Khoản

    @GetMapping("/tai-khoan")
    public ResponseEntity<ApiResponse<List<TaiKhoanResponse>>> getAllTaiKhoan() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllTaiKhoan()));
    }

    @GetMapping("/tai-khoan/{id}")
    public ResponseEntity<ApiResponse<TaiKhoanResponse>> getTaiKhoanById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.getTaiKhoanById(id)));
    }

    @PutMapping("/tai-khoan/{id}/khoa")
    public ResponseEntity<ApiResponse<TaiKhoanResponse>> khoaTaiKhoan(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Đã khóa tài khoản thành công", adminService.khoaTaiKhoan(id)));
    }

    @PutMapping("/tai-khoan/{id}/mo")
    public ResponseEntity<ApiResponse<TaiKhoanResponse>> moTaiKhoan(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Đã mở tài khoản thành công", adminService.moTaiKhoan(id)));
    }
}

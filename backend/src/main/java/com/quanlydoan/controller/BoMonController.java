package com.quanlydoan.controller;

import com.quanlydoan.dto.request.*;
import com.quanlydoan.dto.response.*;
import com.quanlydoan.enums.TrangThaiDeTai;
import com.quanlydoan.service.BoMonService;
import com.quanlydoan.service.AuthService;
import com.quanlydoan.service.ImportExcelService;
import com.quanlydoan.enums.TrangThaiDeTai;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@RestController
@RequestMapping("/api/bo-mon")
@PreAuthorize("hasAnyRole('ADMIN', 'LANH_DAO_BO_MON')")
@RequiredArgsConstructor
public class BoMonController {

    private final BoMonService boMonService;
    private final AuthService authService;
    private final ImportExcelService importExcelService;

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
            @PathVariable Long id, @RequestBody TuChoiRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Đã từ chối. Sinh viên sẽ đăng ký lại.", boMonService.tuChoiDeTaiBoMon(id, request.getGhiChu())));
    }

    @GetMapping("/de-tai/khong-dat")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getDeTaiKhongDat(
            @RequestParam(required = false) Long boMonId,
            @RequestParam String loai) {
        
        UserResponse currentUser = authService.getCurrentUser();
        Long targetBoMonId = boMonId != null ? boMonId : currentUser.getBoMonId();
        
        return ResponseEntity.ok(ApiResponse.success(boMonService.getDeTaiKhongDat(targetBoMonId, loai)));
    }

    @GetMapping("/de-tai/hoan-thanh")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getDeTaiHoanThanh() {
        UserResponse currentUser = authService.getCurrentUser();
        Long boMonId = currentUser.getBoMonId();
        return ResponseEntity.ok(ApiResponse.success(boMonService.getDeTaiHoanThanh(boMonId)));
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

    @GetMapping("/de-tai/cho-gv-duyet")
    public ResponseEntity<ApiResponse<List<PhanCongHuongDanResponse>>> getDeTaiChoGVDuyet() {
        UserResponse currentUser = authService.getCurrentUser();
        Long boMonId = currentUser.getBoMonId();
        return ResponseEntity.ok(ApiResponse.success(boMonService.getDeTaiChoGVDuyet(boMonId)));
    }

    @GetMapping("/danh-sach-gvhd")
    public ResponseEntity<ApiResponse<List<PhanCongHuongDanResponse>>> getDanhSachGvhd() {
        UserResponse currentUser = authService.getCurrentUser();
        Long boMonId = currentUser.getBoMonId();
        return ResponseEntity.ok(ApiResponse.success(boMonService.getDanhSachGvhd(boMonId)));
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

    @GetMapping("/hoi-dong")
    public ResponseEntity<ApiResponse<List<HoiDongBaoVeResponse>>> getHoiDongBaoVe() {
        UserResponse currentUser = authService.getCurrentUser();
        Long boMonId = currentUser.getBoMonId();
        return ResponseEntity.ok(ApiResponse.success(boMonService.getHoiDongByBoMon(boMonId)));
    }

    @GetMapping("/bao-cao")
    public ResponseEntity<ApiResponse<List<BaoCaoResponse>>> getBaoCao() {
        UserResponse currentUser = authService.getCurrentUser();
        Long targetBoMonId = currentUser.getBoMonId();
        return ResponseEntity.ok(ApiResponse.success(boMonService.getBaoCaoByBoMon(targetBoMonId)));
    }

    @GetMapping("/bao-cao/{deTaiId}")
    public ResponseEntity<ApiResponse<BaoCaoResponse>> getBaoCaoChiTiet(@PathVariable Long deTaiId) {
        BaoCaoResponse baoCao = boMonService.getBaoCaoByDeTaiId(deTaiId);
        if (baoCao == null) {
            return ResponseEntity.ok(ApiResponse.success("Chưa có báo cáo", null));
        }
        return ResponseEntity.ok(ApiResponse.success(baoCao));
    }

    @PostMapping("/diem-bao-ve")
    public ResponseEntity<ApiResponse<HoiDongBaoVeResponse>> importDiemBaoVe(
            @Valid @RequestBody DiemBaoVeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Nhập điểm bảo vệ thành công",
                boMonService.importDiemBaoVe(request)));
    }

    @PutMapping("/diem-bao-ve/{id}")
    public ResponseEntity<ApiResponse<HoiDongBaoVeResponse>> updateDiemBaoVe(
            @PathVariable Long id,
            @Valid @RequestBody DiemBaoVeRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật điểm thành công",
                boMonService.updateDiemBaoVe(id, request)));
    }

    @GetMapping("/diem-bao-ve/hoi-dong/{hoiDongId}")
    public ResponseEntity<ApiResponse<List<DiemBaoVeResponse>>> getDiemBaoVeByHoiDong(
            @PathVariable Long hoiDongId) {
        return ResponseEntity.ok(ApiResponse.success(
                boMonService.getDiemBaoVeByHoiDong(hoiDongId)));
    }

    @GetMapping("/diem-bao-ve/de-tai/{deTaiId}")
    public ResponseEntity<ApiResponse<List<DiemBaoVeResponse>>> getDiemBaoVeByDeTai(
            @PathVariable Long deTaiId) {
        return ResponseEntity.ok(ApiResponse.success(
                boMonService.getDiemBaoVeByDeTai(deTaiId)));
    }

    @PostMapping("/diem-bao-ve/import-excel")
    public ResponseEntity<ApiResponse<ImportDiemResult>> importDiemExcel(
            @RequestParam("file") MultipartFile file) {
        UserResponse currentUser = authService.getCurrentUser();
        Long boMonId = currentUser.getBoMonId();
        return ResponseEntity.ok(ApiResponse.success("Import Excel thành công",
                importExcelService.importDiemBaoVe(file, boMonId)));
    }

    @GetMapping("/diem-bao-ve/excel-template")
    public ResponseEntity<byte[]> downloadExcelTemplate() {
        try {
            byte[] template = importExcelService.generateExcelTemplate();
            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=template_diem_bao_ve.xlsx")
                    .header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
                    .body(template);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/thong-ke-diem")
    public ResponseEntity<ApiResponse<ThongKeDiemResponse>> getThongKeDiem() {
        UserResponse currentUser = authService.getCurrentUser();
        Long boMonId = currentUser.getBoMonId();
        return ResponseEntity.ok(ApiResponse.success(boMonService.getThongKeDiem(boMonId)));
    }

    @GetMapping("/thong-ke-phan-cong")
    public ResponseEntity<ApiResponse<ThongKePhanCongResponse>> getThongKePhanCong() {
        UserResponse currentUser = authService.getCurrentUser();
        Long boMonId = currentUser.getBoMonId();
        return ResponseEntity.ok(ApiResponse.success(boMonService.getThongKePhanCong(boMonId)));
    }

    @GetMapping("/quan-ly-diem")
    public ResponseEntity<ApiResponse<List<QuanLyDiemResponse>>> getQuanLyDiem() {
        UserResponse currentUser = authService.getCurrentUser();
        Long boMonId = currentUser.getBoMonId();
        return ResponseEntity.ok(ApiResponse.success(boMonService.getQuanLyDiem(boMonId)));
    }
}

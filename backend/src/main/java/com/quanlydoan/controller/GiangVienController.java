package com.quanlydoan.controller;

import com.quanlydoan.dto.request.*;
import com.quanlydoan.dto.response.*;
import com.quanlydoan.entity.GiangVien;
import com.quanlydoan.repository.GiangVienRepository;
import com.quanlydoan.service.GiangVienService;
import com.quanlydoan.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/giang-vien")
@PreAuthorize("hasAnyRole('ADMIN', 'GIANG_VIEN', 'LANH_DAO_BO_MON')")
@RequiredArgsConstructor
public class GiangVienController {

    private final GiangVienService giangVienService;
    private final AuthService authService;
    private final GiangVienRepository giangVienRepository;

    // GV Hướng dẫn
    @GetMapping("/huong-dan")
    public ResponseEntity<ApiResponse<List<PhanCongHuongDanResponse>>> getDeTaiHuongDan() {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getDeTaiHuongDan(gv.getId())));
    }

    @GetMapping("/huong-dan/cho-duyet")
    public ResponseEntity<ApiResponse<List<PhanCongHuongDanResponse>>> getDeTaiChoDuyet() {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getDeTaiChoDuyet(gv.getId())));
    }

    @PutMapping("/huong-dan/{id}/duyet")
    public ResponseEntity<ApiResponse<PhanCongHuongDanResponse>> duyetSinhVien(
            @PathVariable Long id, @RequestParam boolean duyet) {
        PhanCongHuongDanResponse result = giangVienService.duyetSinhVienHuongDan(id, duyet);
        if (duyet) {
            return ResponseEntity.ok(ApiResponse.success("Duyệt thành công", result));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Từ chối thành công. Bộ môn sẽ phân công GV khác.", null));
        }
    }

    @PostMapping("/diem-huong-dan")
    public ResponseEntity<ApiResponse<DiemHuongDanResponse>> chamDiemHuongDan(
            @Valid @RequestBody DiemHuongDanRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Chấm điểm thành công", giangVienService.chamDiemHuongDan(request)));
    }

    // GV Phản biện
    @GetMapping("/phan-bien")
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getDeTaiPhanBien() {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getDeTaiPhanBien(gv.getId())));
    }

    @PostMapping("/diem-phan-bien")
    public ResponseEntity<ApiResponse<DiemPhanBienResponse>> chamDiemPhanBien(
            @Valid @RequestBody DiemPhanBienRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Chấm điểm thành công", giangVienService.chamDiemPhanBien(request)));
    }

    // GV Hội đồng - chỉ xem danh sách, không chấm điểm bảo vệ
    @GetMapping("/hoi-dong")
    public ResponseEntity<ApiResponse<List<HoiDongBaoVeResponse>>> getHoiDongBaoVe() {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getHoiDongBaoVe(gv.getId())));
    }

    // Xem báo cáo sinh viên
    @GetMapping("/bao-cao")
    public ResponseEntity<ApiResponse<List<BaoCaoResponse>>> getBaoCaoSinhVien() {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getBaoCaoCuaSinhVien(gv.getId())));
    }

    @GetMapping("/bao-cao/{deTaiId}")
    public ResponseEntity<ApiResponse<BaoCaoResponse>> getBaoCaoChiTiet(@PathVariable Long deTaiId) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        BaoCaoResponse baoCao = giangVienService.getBaoCaoByDeTaiId(deTaiId, gv.getId());
        if (baoCao == null) {
            return ResponseEntity.ok(ApiResponse.success("Chưa có báo cáo", null));
        }
        return ResponseEntity.ok(ApiResponse.success(baoCao));
    }
}

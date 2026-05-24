package com.quanlydoan.controller;

import com.quanlydoan.dto.request.*;
import com.quanlydoan.dto.response.*;
import com.quanlydoan.entity.SinhVien;
import com.quanlydoan.repository.SinhVienRepository;
import com.quanlydoan.service.SinhVienService;
import com.quanlydoan.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import org.springframework.web.bind.annotation.ModelAttribute;

@RestController
@RequestMapping("/api/sinh-vien")
@PreAuthorize("hasAnyRole('ADMIN', 'SINH_VIEN')")
@RequiredArgsConstructor
public class SinhVienController {

    private final SinhVienService sinhVienService;
    private final AuthService authService;
    private final SinhVienRepository sinhVienRepository;

    @GetMapping("/dot-dang-ky")
    public ResponseEntity<ApiResponse<List<DotDangKyResponse>>> getDotDangKyDangMo() {
        return ResponseEntity.ok(ApiResponse.success(sinhVienService.getDotDangKyDangMo()));
    }

    @GetMapping("/giang-vien")
    public ResponseEntity<ApiResponse<List<GiangVienResponse>>> getGiangVienList() {
        UserResponse currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(sinhVienService.getGiangVienByBoMon(currentUser.getEmail())));
    }

    @PostMapping("/de-tai")
    public ResponseEntity<ApiResponse<DeTaiResponse>> dangKyDeTai(@Valid @RequestBody DeTaiRequest request) {
        UserResponse currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Đăng ký thành công",
                sinhVienService.dangKyDeTai(request, currentUser.getEmail())));
    }

    @PutMapping("/de-tai/{id}/dang-ky-lai")
    public ResponseEntity<ApiResponse<DeTaiResponse>> dangKyLai(@PathVariable Long id, @Valid @RequestBody DeTaiRequest request) {
        UserResponse currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Đăng ký lại thành công",
                sinhVienService.dangKyLaiDeTai(id, request, currentUser.getEmail())));
    }

    @GetMapping("/de-tai")
    public ResponseEntity<ApiResponse<DeTaiResponse>> getDeTaiCuaToi() {
        UserResponse currentUser = authService.getCurrentUser();
        DeTaiResponse deTai = sinhVienService.getDeTaiCuaToi(currentUser.getEmail());
        if (deTai == null) {
            return ResponseEntity.ok(ApiResponse.success("Chưa đăng ký đề tài", null));
        }
        return ResponseEntity.ok(ApiResponse.success(deTai));
    }

    @PostMapping("/bao-cao")
    public ResponseEntity<ApiResponse<BaoCaoResponse>> nopBaoCao(@ModelAttribute BaoCaoRequest request) {
        UserResponse currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Nộp báo cáo thành công",
                sinhVienService.nopBaoCao(request, currentUser.getEmail())));
    }

    @GetMapping("/bao-cao")
    public ResponseEntity<ApiResponse<BaoCaoResponse>> getBaoCaoCuaToi() {
        UserResponse currentUser = authService.getCurrentUser();
        BaoCaoResponse baoCao = sinhVienService.getBaoCaoCuaToi(currentUser.getEmail());
        if (baoCao == null) {
            return ResponseEntity.ok(ApiResponse.success("Chưa nộp báo cáo", null));
        }
        return ResponseEntity.ok(ApiResponse.success(baoCao));
    }

    @GetMapping("/ket-qua/huong-dan")
    public ResponseEntity<ApiResponse<DiemHuongDanResponse>> getKetQuaHuongDan() {
        UserResponse currentUser = authService.getCurrentUser();
        DiemHuongDanResponse ketQua = sinhVienService.getKetQuaHuongDan(currentUser.getEmail());
        if (ketQua == null) {
            return ResponseEntity.ok(ApiResponse.success("Chưa có kết quả", null));
        }
        return ResponseEntity.ok(ApiResponse.success(ketQua));
    }

    @GetMapping("/ket-qua/phan-bien")
    public ResponseEntity<ApiResponse<DiemPhanBienResponse>> getKetQuaPhanBien() {
        UserResponse currentUser = authService.getCurrentUser();
        DiemPhanBienResponse ketQua = sinhVienService.getKetQuaPhanBien(currentUser.getEmail());
        if (ketQua == null) {
            return ResponseEntity.ok(ApiResponse.success("Chưa có kết quả", null));
        }
        return ResponseEntity.ok(ApiResponse.success(ketQua));
    }

    @GetMapping("/ket-qua/bao-ve")
    public ResponseEntity<ApiResponse<DeTaiResponse>> getKetQuaBaoVe() {
        UserResponse currentUser = authService.getCurrentUser();
        DeTaiResponse ketQua = sinhVienService.getKetQuaBaoVe(currentUser.getEmail());
        if (ketQua == null) {
            return ResponseEntity.ok(ApiResponse.success("Chưa có kết quả", null));
        }
        return ResponseEntity.ok(ApiResponse.success(ketQua));
    }

    @GetMapping("/lich-bao-ve")
    public ResponseEntity<ApiResponse<DeTaiResponse>> getLichBaoVe() {
        UserResponse currentUser = authService.getCurrentUser();
        DeTaiResponse lichBaoVe = sinhVienService.getLichBaoVe(currentUser.getEmail());
        if (lichBaoVe == null) {
            return ResponseEntity.ok(ApiResponse.success("Chưa có lịch bảo vệ", null));
        }
        return ResponseEntity.ok(ApiResponse.success(lichBaoVe));
    }


    @GetMapping("/bao-cao-tien-do/dot")
    public ResponseEntity<ApiResponse<List<DotBaoCaoTienDoResponse>>> getDotBaoCaoTienDo() {
        UserResponse currentUser = authService.getCurrentUser();
        SinhVien sv = sinhVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));
        return ResponseEntity.ok(ApiResponse.success(sinhVienService.getDotBaoCaoTienDoDangMo(sv.getId())));
    }

    @GetMapping("/bao-cao-tien-do")
    public ResponseEntity<ApiResponse<List<BaoCaoTienDoResponse>>> getBaoCaoTienDoCuaToi() {
        UserResponse currentUser = authService.getCurrentUser();
        SinhVien sv = sinhVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));
        return ResponseEntity.ok(ApiResponse.success(sinhVienService.getBaoCaoTienDoCuaToi(sv.getId())));
    }

    // Nộp báo cáo tiến độ
    @PostMapping("/bao-cao-tien-do")
    public ResponseEntity<ApiResponse<BaoCaoTienDoResponse>> nopBaoCaoTienDo(@ModelAttribute NopBaoCaoTienDoRequest request) {
        UserResponse currentUser = authService.getCurrentUser();
        SinhVien sv = sinhVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sinh viên"));
        return ResponseEntity.ok(ApiResponse.success("Nộp báo cáo tiến độ thành công",
                sinhVienService.nopBaoCaoTienDo(request, sv.getId())));
    }
}

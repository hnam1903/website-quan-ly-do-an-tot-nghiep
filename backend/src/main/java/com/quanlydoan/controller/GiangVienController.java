package com.quanlydoan.controller;

import com.quanlydoan.dto.request.*;
import com.quanlydoan.dto.response.*;
import com.quanlydoan.entity.GiangVien;
import com.quanlydoan.enums.TrangThaiDotBaoCao;
import com.quanlydoan.enums.TrangThaiBaoCaoTienDo;
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

    @GetMapping("/huong-dan")
    public ResponseEntity<ApiResponse<List<PhanCongHuongDanResponse>>> getDeTaiHuongDan(
            @RequestParam(required = false) Long dotId) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getDeTaiHuongDan(gv.getId(), dotId)));
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
    public ResponseEntity<ApiResponse<List<DeTaiResponse>>> getDeTaiPhanBien(
            @RequestParam(required = false) Long dotId) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getDeTaiPhanBien(gv.getId(), dotId)));
    }

    @PostMapping("/diem-phan-bien")
    public ResponseEntity<ApiResponse<DiemPhanBienResponse>> chamDiemPhanBien(
            @Valid @RequestBody DiemPhanBienRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Chấm điểm thành công", giangVienService.chamDiemPhanBien(request)));
    }

    // GV Hội đồng - chỉ xem danh sách, không chấm điểm bảo vệ
    @GetMapping("/hoi-dong")
    public ResponseEntity<ApiResponse<List<HoiDongBaoVeResponse>>> getHoiDongBaoVe(
            @RequestParam(required = false) Long dotId) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getHoiDongBaoVe(gv.getId(), dotId)));
    }

    // Xem báo cáo sinh viên
    @GetMapping("/bao-cao")
    public ResponseEntity<ApiResponse<List<BaoCaoResponse>>> getBaoCaoSinhVien(
            @RequestParam(required = false) Long dotId) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getBaoCaoCuaSinhVien(gv.getId(), dotId)));
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

    // ==================== BÁO CÁO TIẾN ĐỘ ====================

    // Tạo đợt báo cáo tiến độ
    @PostMapping("/bao-cao-tien-do/dot")
    public ResponseEntity<ApiResponse<DotBaoCaoTienDoResponse>> taoDotBaoCaoTienDo(
            @Valid @RequestBody DotBaoCaoTienDoRequest request) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success("Tạo đợt báo cáo thành công",
                giangVienService.taoDotBaoCaoTienDo(request, gv.getId())));
    }

    // Lấy danh sách đợt báo cáo tiến độ
    @GetMapping("/bao-cao-tien-do/dot")
    public ResponseEntity<ApiResponse<List<DotBaoCaoTienDoResponse>>> getDotBaoCaoTienDo() {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getDotBaoCaoTienDo(gv.getId())));
    }

    // Cập nhật trạng thái đợt báo cáo (mở/đóng)
    @PutMapping("/bao-cao-tien-do/dot/{dotId}/trang-thai")
    public ResponseEntity<ApiResponse<DotBaoCaoTienDoResponse>> capNhatTrangThaiDot(
            @PathVariable Long dotId, @RequestParam String trangThai) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(
                giangVienService.capNhatTrangThaiDot(dotId, com.quanlydoan.enums.TrangThaiDotBaoCao.valueOf(trangThai))));
    }

    // Lấy báo cáo tiến độ theo đợt
    @GetMapping("/bao-cao-tien-do/dot/{dotId}/danh-sach")
    public ResponseEntity<ApiResponse<List<BaoCaoTienDoResponse>>> getBaoCaoTienDoByDot(@PathVariable Long dotId) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getBaoCaoTienDoByDot(dotId, gv.getId())));
    }

    // Nhận xét báo cáo tiến độ
    @PostMapping("/bao-cao-tien-do/nhan-xet")
    public ResponseEntity<ApiResponse<BaoCaoTienDoResponse>> nhanXetBaoCaoTienDo(
            @Valid @RequestBody NhanXetBaoCaoTienDoRequest request) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success("Nhận xét thành công",
                giangVienService.nhanXetBaoCaoTienDo(request, gv.getId())));
    }

    // Xóa đợt báo cáo tiến độ
    @DeleteMapping("/bao-cao-tien-do/dot/{dotId}")
    public ResponseEntity<ApiResponse<Void>> xoaDotBaoCaoTienDo(@PathVariable Long dotId) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        giangVienService.xoaDotBaoCaoTienDo(dotId, gv.getId());
        return ResponseEntity.ok(ApiResponse.success("Xóa đợt báo cáo thành công", null));
    }

    // Lấy danh sách sinh viên được hướng dẫn
    @GetMapping("/sinh-vien-huong-dan")
    public ResponseEntity<ApiResponse<List<SinhVienHuongDanResponse>>> getSinhVienHuongDan() {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getSinhVienHuongDan(gv.getId())));
    }

    // Lấy báo cáo tiến độ của một sinh viên
    @GetMapping("/bao-cao-tien-do/sinh-vien/{sinhVienId}")
    public ResponseEntity<ApiResponse<List<BaoCaoTienDoResponse>>> getBaoCaoTienDoBySinhVien(@PathVariable Long sinhVienId) {
        UserResponse currentUser = authService.getCurrentUser();
        GiangVien gv = giangVienRepository.findByTaiKhoanEmail(currentUser.getEmail())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giảng viên"));
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getBaoCaoTienDoBySinhVien(sinhVienId, gv.getId())));
    }

    // Lấy danh sách đợt đăng ký
    @GetMapping("/dot-dang-ky")
    public ResponseEntity<ApiResponse<List<DotDangKyResponse>>> getDotDangKy() {
        UserResponse currentUser = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(giangVienService.getDotDangKyByBoMon(currentUser.getBoMonId())));
    }
}

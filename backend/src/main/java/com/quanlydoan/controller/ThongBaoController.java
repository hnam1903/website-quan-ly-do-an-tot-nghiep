package com.quanlydoan.controller;

import com.quanlydoan.dto.request.ThongBaoRequest;
import com.quanlydoan.dto.response.ApiResponse;
import com.quanlydoan.dto.response.ThongBaoResponse;
import com.quanlydoan.service.ThongBaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ThongBaoController {

    private final ThongBaoService thongBaoService;

    // ==================== PUBLIC (Landing Page) ====================
    @GetMapping("/api/public/thong-bao")
    public ResponseEntity<ApiResponse<List<ThongBaoResponse>>> getThongBaoPublic() {
        return ResponseEntity.ok(ApiResponse.success(thongBaoService.getAllHienThi()));
    }

    // ==================== ADMIN CRUD ====================
    @GetMapping("/api/admin/thong-bao")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ThongBaoResponse>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(thongBaoService.getAll()));
    }

    @GetMapping("/api/admin/thong-bao/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ThongBaoResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(thongBaoService.getById(id)));
    }

    @PostMapping("/api/admin/thong-bao")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ThongBaoResponse>> create(@Valid @RequestBody ThongBaoRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Tạo thông báo thành công", thongBaoService.create(request)));
    }

    @PutMapping("/api/admin/thong-bao/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ThongBaoResponse>> update(
            @PathVariable Long id, @Valid @RequestBody ThongBaoRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thông báo thành công", thongBaoService.update(id, request)));
    }

    @DeleteMapping("/api/admin/thong-bao/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        thongBaoService.delete(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa thông báo thành công", null));
    }

    @PutMapping("/api/admin/thong-bao/{id}/trang-thai")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ThongBaoResponse>> toggleTrangThai(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Cập nhật trạng thái thành công", thongBaoService.toggleTrangThai(id)));
    }
}

package com.quanlydoan.controller;

import com.quanlydoan.dto.response.ApiResponse;
import com.quanlydoan.entity.*;
import com.quanlydoan.enums.Role;
import com.quanlydoan.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.*;

@RestController
@RequestMapping("/api/admin/import")
@CrossOrigin(origins = "http://localhost:4200")
@RequiredArgsConstructor
public class ImportController {

    private final GiangVienRepository giangVienRepository;
    private final SinhVienRepository sinhVienRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final BoMonRepository boMonRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/giang-vien")
    public ResponseEntity<ApiResponse<Map<String, Object>>> importGiangVien(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File rỗng"));
            }

            List<GiangVien> createdList = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            int rowNum = 1;

            try (InputStream is = file.getInputStream();
                 Workbook workbook = new XSSFWorkbook(is)) {
                
                Sheet sheet = workbook.getSheetAt(0);
                DataFormatter formatter = new DataFormatter();

                Row headerRow = sheet.getRow(0);
                if (headerRow == null) {
                    return ResponseEntity.badRequest().body(ApiResponse.error("File không có header"));
                }

                Map<String, Integer> colIndex = buildColumnIndex(headerRow, formatter);

                if (!colIndex.containsKey("email") || !colIndex.containsKey("hoten") || !colIndex.containsKey("hocvi")) {
                    return ResponseEntity.badRequest().body(ApiResponse.error("File thiếu cột bắt buộc: email, hoten, hocvi"));
                }

                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    rowNum++;
                    Row row = sheet.getRow(i);
                    if (row == null) continue;

                    try {
                        String email = getCellValue(row, colIndex.get("email"), formatter);
                        String hoTen = getCellValue(row, colIndex.get("hoten"), formatter);
                        String hocVi = getCellValue(row, colIndex.get("hocvi"), formatter);
                        String boMonTen = getCellValue(row, colIndex.get("bomon"), formatter);

                        if (email.isEmpty() || hoTen.isEmpty()) {
                            errors.add("Dòng " + rowNum + ": Email hoặc Họ tên trống");
                            continue;
                        }

                        if (taiKhoanRepository.findByEmail(email).isPresent()) {
                            errors.add("Dòng " + rowNum + ": Email '" + email + "' đã tồn tại");
                            continue;
                        }

                        TaiKhoan taiKhoan = TaiKhoan.builder()
                                .email(email)
                                .password(passwordEncoder.encode("123456"))
                                .role(Role.GIANG_VIEN)
                                .trangThai(true)
                                .build();
                        taiKhoan = taiKhoanRepository.save(taiKhoan);

                        GiangVien gv = GiangVien.builder()
                                .taiKhoan(taiKhoan)
                                .hoTen(hoTen)
                                .hocVi(hocVi)
                                .build();

                        if (!boMonTen.isEmpty()) {
                            boMonRepository.findByTenBoMonIgnoreCase(boMonTen).ifPresent(gv::setBoMon);
                        }

                        createdList.add(giangVienRepository.save(gv));
                    } catch (Exception e) {
                        errors.add("Dòng " + rowNum + ": " + e.getMessage());
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("successCount", createdList.size());
            result.put("errorCount", errors.size());
            result.put("errors", errors);

            return ResponseEntity.ok(ApiResponse.success("Đã import " + createdList.size() + " giảng viên", result));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ApiResponse.error("Lỗi: " + e.getMessage()));
        }
    }

    @PostMapping("/sinh-vien")
    public ResponseEntity<ApiResponse<Map<String, Object>>> importSinhVien(
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(ApiResponse.error("File rỗng"));
            }

            List<SinhVien> createdList = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            int rowNum = 1;

            try (InputStream is = file.getInputStream();
                 Workbook workbook = new XSSFWorkbook(is)) {
                
                Sheet sheet = workbook.getSheetAt(0);
                DataFormatter formatter = new DataFormatter();

                Row headerRow = sheet.getRow(0);
                if (headerRow == null) {
                    return ResponseEntity.badRequest().body(ApiResponse.error("File không có header"));
                }

                Map<String, Integer> colIndex = buildColumnIndex(headerRow, formatter);
                if (colIndex.containsKey("masv") && !colIndex.containsKey("masinhvien")) {
                    colIndex.put("masinhvien", colIndex.get("masv"));
                }

                if (!colIndex.containsKey("masinhvien") || !colIndex.containsKey("hoten") || !colIndex.containsKey("email")) {
                    return ResponseEntity.badRequest().body(ApiResponse.error("File thiếu cột bắt buộc: masinhvien (hoặc masv), hoten, email"));
                }

                for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                    rowNum++;
                    Row row = sheet.getRow(i);
                    if (row == null) continue;

                    // Kiểm tra dòng có trống hoàn toàn không
                    boolean isEmptyRow = true;
                    for (int j = 0; j < headerRow.getLastCellNum(); j++) {
                        Cell cell = row.getCell(j);
                        if (cell != null && !formatter.formatCellValue(cell).trim().isEmpty()) {
                            isEmptyRow = false;
                            break;
                        }
                    }
                    if (isEmptyRow) continue;

                    String maSV = getCellValue(row, colIndex.get("masinhvien"), formatter);
                    String hoTen = getCellValue(row, colIndex.get("hoten"), formatter);
                    String email = getCellValue(row, colIndex.get("email"), formatter);
                    String lop = getCellValue(row, colIndex.get("lop"), formatter);
                    String boMonTen = getCellValue(row, colIndex.get("bomon"), formatter);

                    if (maSV.isEmpty() || hoTen.isEmpty() || email.isEmpty()) {
                        errors.add("Dòng " + rowNum + ": Mã SV, Họ tên hoặc Email trống");
                        continue;
                    }

                    if (sinhVienRepository.findByMaSinhVien(maSV).isPresent()) {
                        errors.add("Dòng " + rowNum + ": Mã SV '" + maSV + "' đã tồn tại");
                        continue;
                    }

                    if (taiKhoanRepository.findByEmail(email).isPresent()) {
                        errors.add("Dòng " + rowNum + ": Email '" + email + "' đã tồn tại");
                        continue;
                    }

                    TaiKhoan taiKhoan = TaiKhoan.builder()
                            .email(email)
                            .password(passwordEncoder.encode("123456"))
                            .role(Role.SINH_VIEN)
                            .trangThai(true)
                            .build();
                    taiKhoan = taiKhoanRepository.save(taiKhoan);

                    SinhVien sv = SinhVien.builder()
                            .taiKhoan(taiKhoan)
                            .maSinhVien(maSV)
                            .hoTen(hoTen)
                            .lop(lop)
                            .build();

                    if (!boMonTen.isEmpty()) {
                        boMonRepository.findByTenBoMonIgnoreCase(boMonTen).ifPresent(sv::setBoMon);
                    }

                    createdList.add(sinhVienRepository.save(sv));
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("successCount", createdList.size());
            result.put("errorCount", errors.size());
            result.put("errors", errors);

            String message = errors.isEmpty() 
                    ? "Đã import " + createdList.size() + " sinh viên"
                    : "Import hoàn tất: " + createdList.size() + " thành công, " + errors.size() + " lỗi";

            return ResponseEntity.ok(ApiResponse.success(message, result));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(ApiResponse.error("Lỗi: " + e.getMessage()));
        }
    }

    private String getCellValue(Row row, Integer colIndex, DataFormatter formatter) {
        if (colIndex == null) return "";
        Cell cell = row.getCell(colIndex);
        if (cell == null) return "";
        return formatter.formatCellValue(cell).trim();
    }

    /**
     * Chuẩn hóa tiêu đề cột: "Bộ môn", "bomon", "BỘ MÔN" → bomon để khớp với code.
     */
    private static Map<String, Integer> buildColumnIndex(Row headerRow, DataFormatter formatter) {
        Map<String, Integer> colIndex = new HashMap<>();
        for (int i = 0; i < headerRow.getLastCellNum(); i++) {
            Cell cell = headerRow.getCell(i);
            if (cell != null) {
                String raw = formatter.formatCellValue(cell).trim();
                String key = normalizeHeaderKey(raw);
                if (!key.isEmpty()) {
                    colIndex.put(key, i);
                }
            }
        }
        return colIndex;
    }

    private static String normalizeHeaderKey(String s) {
        if (s == null || s.isEmpty()) return "";
        String lower = s.toLowerCase();
        String nfd = Normalizer.normalize(lower, Normalizer.Form.NFD);
        StringBuilder sb = new StringBuilder();
        for (int j = 0; j < nfd.length(); j++) {
            char c = nfd.charAt(j);
            if (Character.getType(c) != Character.NON_SPACING_MARK) {
                sb.append(c);
            }
        }
        return sb.toString().replaceAll("[^a-z0-9]", "");
    }
}

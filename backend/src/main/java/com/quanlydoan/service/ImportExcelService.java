package com.quanlydoan.service;

import com.quanlydoan.dto.response.ImportDiemResult;
import com.quanlydoan.entity.*;
import com.quanlydoan.enums.TrangThaiDiem;
import com.quanlydoan.enums.TrangThaiHoiDong;
import com.quanlydoan.enums.VaiTroHoiDong;
import com.quanlydoan.exception.BadRequestException;
import com.quanlydoan.repository.*;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ImportExcelService {

    private final DiemBaoVeRepository diemBaoVeRepository;
    private final HoiDongBaoVeRepository hoiDongBaoVeRepository;
    private final DeTaiRepository deTaiRepository;
    private final SinhVienRepository sinhVienRepository;

    @Transactional
    public ImportDiemResult importDiemBaoVe(MultipartFile file, Long boMonId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File Excel không được để trống");
        }

        if (!file.getOriginalFilename().endsWith(".xlsx") && !file.getOriginalFilename().endsWith(".xls")) {
            throw new BadRequestException("Vui lòng chọn file Excel (.xlsx hoặc .xls)");
        }

        int totalRows = 0;
        int successRows = 0;
        int errorRows = 0;
        List<String> errors = new ArrayList<>();

        try (InputStream inputStream = file.getInputStream();
             Workbook workbook = new XSSFWorkbook(inputStream)) {

            Sheet sheet = workbook.getSheet("DiemBaoVe");
            if (sheet == null) {
                sheet = workbook.getSheetAt(0);
            }

            // Đọc header để xác định cột
            Row headerRow = sheet.getRow(0);
            if (headerRow == null) {
                throw new BadRequestException("File Excel không có header");
            }

            Map<String, Integer> columnIndex = new HashMap<>();
            for (int i = 0; i < headerRow.getLastCellNum(); i++) {
                Cell cell = headerRow.getCell(i);
                if (cell != null) {
                    String header = getCellValueAsString(cell).trim().toLowerCase();
                    columnIndex.put(header, i);
                }
            }

            // Kiểm tra các cột bắt buộc
            if (!columnIndex.containsKey("msv") && !columnIndex.containsKey("mã sv") && !columnIndex.containsKey("mã sinh viên")) {
                throw new BadRequestException("File Excel phải có cột 'MSV' (Mã sinh viên)");
            }

            // Duyệt từng dòng dữ liệu (bắt đầu từ dòng 1)
            for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) continue;

                totalRows++;

                try {
                    processRow(row, columnIndex);
                    successRows++;
                } catch (Exception e) {
                    errorRows++;
                    errors.add("Dòng " + (i + 1) + ": " + e.getMessage());
                }
            }

        } catch (BadRequestException e) {
            throw e;
        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi đọc file Excel: " + e.getMessage());
        }

        ImportDiemResult.ImportDiemResultBuilder builder = ImportDiemResult.builder()
                .totalRows(totalRows)
                .successRows(successRows)
                .errorRows(errorRows);

        if (!errors.isEmpty()) {
            builder.message("Có " + errorRows + " dòng lỗi: " + String.join("; ", errors));
        } else {
            builder.message("Import thành công " + successRows + " dòng");
        }

        return builder.build();
    }

    public byte[] generateExcelTemplate() {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("DiemBaoVe");

            // Tạo header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.LIGHT_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setBorderRight(BorderStyle.THIN);
            headerStyle.setBorderBottom(BorderStyle.THIN);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            // Tạo header
            String[] headers = {"MSV", "Họ tên SV", "Đề tài", "Điểm Chủ tịch", "Điểm Thư ký", "Điểm Ủy viên", "Nhận xét"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Set column width
            sheet.setColumnWidth(0, 3000);
            sheet.setColumnWidth(1, 5000);
            sheet.setColumnWidth(2, 10000);  // Đề tài
            sheet.setColumnWidth(3, 4000);
            sheet.setColumnWidth(4, 4000);
            sheet.setColumnWidth(5, 4000);
            sheet.setColumnWidth(6, 10000);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi tạo template Excel: " + e.getMessage());
        }
    }

    private void processRow(Row row, Map<String, Integer> columnIndex) {
        // Lấy MSV (hỗ trợ nhiều tên cột)
        Integer msvColIndex = columnIndex.get("msv") != null ? columnIndex.get("msv") :
                             columnIndex.get("mã sv") != null ? columnIndex.get("mã sv") :
                             columnIndex.get("mã sinh viên");
        String msv = getCellValueAsString(getCellOrDefault(row, msvColIndex));

        if (msv == null || msv.isBlank()) {
            throw new BadRequestException("MSV không được trống");
        }

        // Tìm sinh viên theo MSV
        SinhVien sinhVien = sinhVienRepository.findByMaSinhVien(msv.trim())
                .orElseThrow(() -> new BadRequestException("Không tìm thấy sinh viên với MSV: " + msv));

        // Lấy tên đề tài từ file Excel (nếu có)
        Integer deTaiColIndex = columnIndex.get("đề tài") != null ? columnIndex.get("đề tài") :
                               columnIndex.get("de tai");
        String tenDeTai = deTaiColIndex != null ? getCellValueAsString(getCellOrDefault(row, deTaiColIndex)) : null;

        // Tìm đề tài của sinh viên
        List<DeTai> deTaiList = deTaiRepository.findBySinhVienId(sinhVien.getId());
        if (deTaiList.isEmpty()) {
            throw new BadRequestException("Sinh viên " + msv + " chưa có đề tài");
        }

        // Chọn đề tài phù hợp
        DeTai deTai;
        if (tenDeTai != null && !tenDeTai.isBlank()) {
            // Tìm đề tài có tên khớp với tên trong file
            Optional<DeTai> matchedDeTai = deTaiList.stream()
                    .filter(dt -> dt.getTenDeTai() != null && dt.getTenDeTai().trim().equalsIgnoreCase(tenDeTai.trim()))
                    .findFirst();

            if (matchedDeTai.isPresent()) {
                deTai = matchedDeTai.get();
            } else {
                throw new BadRequestException("Sinh viên " + msv + " không có đề tài với tên: '" + tenDeTai + "'. " +
                        "Đề tài của SV: " + deTaiList.stream()
                                .map(DeTai::getTenDeTai)
                                .collect(java.util.stream.Collectors.joining(", ")));
            }
        } else {
            // Nếu không có cột đề tài, lấy đề tài đầu tiên (cách cũ - để backward compatibility)
            deTai = deTaiList.get(0);
        }

        // Tìm hội đồng của đề tài
        HoiDongBaoVe hoiDong = hoiDongBaoVeRepository.findByDeTaiId(deTai.getId())
                .orElseThrow(() -> new BadRequestException("Đề tài của SV " + msv + " chưa có hội đồng bảo vệ"));

        // Tìm các thành viên trong hội đồng theo vai trò
        Map<VaiTroHoiDong, ThanhVienHoiDong> thanhVienMap = new HashMap<>();
        if (hoiDong.getThanhViens() != null) {
            for (ThanhVienHoiDong tv : hoiDong.getThanhViens()) {
                thanhVienMap.put(tv.getVaiTro(), tv);
            }
        }

        // Đọc điểm Chủ tịch
        processDiemForVaiTro(row, columnIndex, hoiDong, thanhVienMap, VaiTroHoiDong.CHU_TICH, "điểm chủ tịch", "diem chu tich");

        // Đọc điểm Thư ký
        processDiemForVaiTro(row, columnIndex, hoiDong, thanhVienMap, VaiTroHoiDong.THU_KY, "điểm thư ký", "diem thu ky");

        // Đọc điểm Ủy viên
        processDiemForVaiTro(row, columnIndex, hoiDong, thanhVienMap, VaiTroHoiDong.UY_VIEN, "điểm ủy viên", "diem uy vien");

        // Đọc nhận xét chung
        Integer nhanXetColIndex = columnIndex.get("nhận xét") != null ? columnIndex.get("nhận xét") : columnIndex.get("nhan xet");
        String nhanXet = getCellValueAsString(getCellOrDefault(row, nhanXetColIndex));

        // Cập nhật nhận xét cho hội đồng
        if (nhanXet != null && !nhanXet.isBlank()) {
            hoiDong.setNhanXetBaoVe(nhanXet);
        }

        // Cập nhật điểm trung bình vào hội đồng
        updateHoiDongDiem(hoiDong);

        // Cập nhật trạng thái đề tài thành HOAN_THANH
        deTai.setTrangThai(com.quanlydoan.enums.TrangThaiDeTai.HOAN_THANH);
        deTaiRepository.save(deTai);
    }

    private void processDiemForVaiTro(Row row, Map<String, Integer> columnIndex,
                                     HoiDongBaoVe hoiDong,
                                     Map<VaiTroHoiDong, ThanhVienHoiDong> thanhVienMap,
                                     VaiTroHoiDong vaiTro,
                                     String... columnNames) {

        ThanhVienHoiDong thanhVien = thanhVienMap.get(vaiTro);
        if (thanhVien == null) return;

        Integer colIndex = null;
        for (String colName : columnNames) {
            if (columnIndex.containsKey(colName)) {
                colIndex = columnIndex.get(colName);
                break;
            }
        }

        if (colIndex == null) return;

        Cell cell = getCellOrDefault(row, colIndex);
        BigDecimal diem = getCellValueAsBigDecimal(cell);

        if (diem != null) {
            // Lưu vào bảng diem_bao_ve
            DiemBaoVe diemBaoVe = diemBaoVeRepository
                    .findByHoiDongIdAndGiangVienId(hoiDong.getId(), thanhVien.getGiangVien().getId())
                    .orElse(DiemBaoVe.builder()
                            .hoiDong(hoiDong)
                            .giangVien(thanhVien.getGiangVien())
                            .build());

            diemBaoVe.setDiem(diem);
            diemBaoVe.setTrangThai(TrangThaiDiem.DU_DIEU_KIEN);

            diemBaoVeRepository.save(diemBaoVe);
        }
    }

    private void updateHoiDongDiem(HoiDongBaoVe hoiDong) {
        // Tính điểm trung bình từ bảng diem_bao_ve
        List<DiemBaoVe> diemBaoVes = diemBaoVeRepository.findByHoiDongId(hoiDong.getId());
        long countWithDiem = diemBaoVes.stream().filter(d -> d.getDiem() != null).count();

        if (countWithDiem > 0) {
            BigDecimal avgDiem = diemBaoVes.stream()
                    .filter(d -> d.getDiem() != null)
                    .map(DiemBaoVe::getDiem)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(countWithDiem), 2, java.math.RoundingMode.HALF_UP);

            hoiDong.setTrangThai(TrangThaiHoiDong.DA_BAO_VE);
            hoiDongBaoVeRepository.save(hoiDong);
        }
    }

    private Cell getCellOrDefault(Row row, Integer index) {
        if (index == null || index < 0) {
            return null;
        }
        return row.getCell(index);
    }

    private boolean isEmptyRow(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.getCellType() != CellType.BLANK) {
                String value = getCellValueAsString(cell).trim();
                if (!value.isEmpty()) {
                    return false;
                }
            }
        }
        return true;
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";

        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getLocalDateTimeCellValue().toString();
                }
                return String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            case FORMULA:
                try {
                    return String.valueOf((long) cell.getNumericCellValue());
                } catch (Exception e) {
                    return cell.getStringCellValue();
                }
            default:
                return "";
        }
    }

    private BigDecimal getCellValueAsBigDecimal(Cell cell) {
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case NUMERIC:
                return BigDecimal.valueOf(cell.getNumericCellValue());
            case STRING:
                String value = cell.getStringCellValue().trim();
                if (value.isEmpty()) return null;
                try {
                    return new BigDecimal(value);
                } catch (NumberFormatException e) {
                    return null;
                }
            default:
                return null;
        }
    }
}

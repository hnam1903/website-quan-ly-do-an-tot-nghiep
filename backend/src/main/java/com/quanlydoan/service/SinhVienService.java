package com.quanlydoan.service;

import com.quanlydoan.dto.request.*;
import com.quanlydoan.dto.response.*;
import com.quanlydoan.entity.*;
import com.quanlydoan.enums.*;
import com.quanlydoan.exception.BadRequestException;
import com.quanlydoan.exception.ResourceNotFoundException;
import com.quanlydoan.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SinhVienService {

    private final SinhVienRepository sinhVienRepository;
    private final DeTaiRepository deTaiRepository;
    private final DotDangKyRepository dotDangKyRepository;
    private final GiangVienRepository giangVienRepository;
    private final BaoCaoRepository baoCaoRepository;
    private final DiemBaoVeRepository diemBaoVeRepository;

    public List<DotDangKyResponse> getDotDangKyDangMo() {
        List<DotDangKy> dots = dotDangKyRepository.findByTrangThai(TrangThaiDot.CHUONG_TRINH);
        return dots.stream().map(this::mapToDotDangKyResponse).collect(Collectors.toList());
    }

    public List<GiangVienResponse> getGiangVienList() {
        return giangVienRepository.findAll().stream()
                .map(this::mapToGiangVienResponse)
                .collect(Collectors.toList());
    }

    public List<GiangVienResponse> getGiangVienByBoMon(String email) {
        Optional<SinhVien> sinhVienOpt = sinhVienRepository.findByTaiKhoanEmail(email);

        if (sinhVienOpt.isEmpty() || sinhVienOpt.get().getBoMon() == null) {
            return giangVienRepository.findAll().stream()
                    .map(this::mapToGiangVienResponse)
                    .collect(Collectors.toList());
        }

        SinhVien sinhVien = sinhVienOpt.get();
        List<GiangVien> giangViens = giangVienRepository.findAllByBoMonId(sinhVien.getBoMon().getId());

        if (giangViens.isEmpty()) {
            return giangVienRepository.findAll().stream()
                    .map(this::mapToGiangVienResponse)
                    .collect(Collectors.toList());
        }

        return giangViens.stream()
                .map(this::mapToGiangVienResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public DeTaiResponse dangKyDeTai(DeTaiRequest request, String email) {
        SinhVien sinhVien = sinhVienRepository.findByTaiKhoanEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên"));

        // Kiểm tra đợt đăng ký còn mở không
        DotDangKy dotDangKy = dotDangKyRepository.findById(request.getDotDangKyId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt đăng ký"));

        if (dotDangKy.getTrangThai() != TrangThaiDot.CHUONG_TRINH) {
            throw new BadRequestException("Đợt đăng ký đã kết thúc");
        }

        // Kiểm tra sinh viên đã đăng ký đề tài chưa (bỏ qua các đề tài bị từ chối)
        List<DeTai> existing = deTaiRepository.findBySinhVienId(sinhVien.getId());
        existing = existing.stream()
                .filter(dt -> dt.getTrangThai() != TrangThaiDeTai.BI_TU_CHOI &&
                              dt.getTrangThai() != TrangThaiDeTai.KHONG_DU_DIEU_KIEN)
                .collect(Collectors.toList());
        if (!existing.isEmpty()) {
            throw new BadRequestException("Sinh viên đã đăng ký đề tài rồi");
        }

        GiangVien gvDuKien = null;
        if (request.getGiangVienDuKienId() != null) {
            gvDuKien = giangVienRepository.findById(request.getGiangVienDuKienId())
                    .orElse(null);
        }

        DeTai deTai = DeTai.builder()
                .tenDeTai(request.getTenDeTai())
                .noiDungDuKien(request.getNoiDungDuKien())
                .congNgheSuDung(request.getCongNgheSuDung())
                .trangThai(TrangThaiDeTai.CHO_DUYET)
                .dotDangKy(dotDangKy)
                .sinhVien(sinhVien)
                .giangVienDuKien(gvDuKien)
                .build();

        deTai = deTaiRepository.save(deTai);
        return mapToDeTaiResponse(deTai);
    }

    @Transactional
    public DeTaiResponse dangKyLaiDeTai(Long deTaiId, DeTaiRequest request, String email) {
        SinhVien sinhVien = sinhVienRepository.findByTaiKhoanEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên"));

        DeTai deTai = deTaiRepository.findById(deTaiId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        if (deTai.getSinhVien() == null || !deTai.getSinhVien().getId().equals(sinhVien.getId())) {
            throw new BadRequestException("Bạn không có quyền cập nhật đề tài này");
        }
        if (deTai.getTrangThai() != TrangThaiDeTai.BI_TU_CHOI) {
            throw new BadRequestException("Chỉ có thể đăng ký lại khi đề tài bị Bộ môn từ chối");
        }

        DotDangKy dotDangKy = dotDangKyRepository.findById(request.getDotDangKyId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt đăng ký"));

        if (dotDangKy.getTrangThai() != TrangThaiDot.CHUONG_TRINH) {
            throw new BadRequestException("Đợt đăng ký đã kết thúc");
        }

        GiangVien gvDuKien = null;
        if (request.getGiangVienDuKienId() != null) {
            gvDuKien = giangVienRepository.findById(request.getGiangVienDuKienId()).orElse(null);
        }

        deTai.setTenDeTai(request.getTenDeTai());
        deTai.setNoiDungDuKien(request.getNoiDungDuKien());
        deTai.setCongNgheSuDung(request.getCongNgheSuDung());
        deTai.setDotDangKy(dotDangKy);
        deTai.setGiangVienDuKien(gvDuKien);
        deTai.setTrangThai(TrangThaiDeTai.CHO_DUYET);
        deTai.setGhiChu(null);

        deTai = deTaiRepository.save(deTai);
        return mapToDeTaiResponse(deTai);
    }

    public DeTaiResponse getDeTaiCuaToi(String email) {
        SinhVien sinhVien = sinhVienRepository.findByTaiKhoanEmail(email).orElse(null);
        if (sinhVien == null) {
            return null;
        }
        List<DeTai> deTais = deTaiRepository.findBySinhVienId(sinhVien.getId());
        if (deTais.isEmpty()) {
            return null;
        }
        return mapToDeTaiResponse(deTais.get(0));
    }

    @Transactional
    public BaoCaoResponse nopBaoCao(BaoCaoRequest request, String email) {
        SinhVien sinhVien = sinhVienRepository.findByTaiKhoanEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên"));
        List<DeTai> deTais = deTaiRepository.findBySinhVienId(sinhVien.getId());
        if (deTais.isEmpty()) {
            throw new BadRequestException("Sinh viên chưa đăng ký đề tài");
        }

        DeTai deTai = deTais.get(0);

        // Kiểm tra đề tài đang trong giai đoạn thực hiện
        if (deTai.getTrangThai() != TrangThaiDeTai.DANG_THUC_HIEN) {
            throw new BadRequestException("Đề tài không trong giai đoạn nộp báo cáo");
        }

        // Kiểm tra đã nộp báo cáo chưa (chỉ nộp 1 lần)
        if (baoCaoRepository.existsByDeTaiId(deTai.getId())) {
            throw new BadRequestException("Bạn đã nộp báo cáo rồi, không thể nộp lại");
        }

        // Lưu file
        String fileBaoCao = null;
        String fileSourceCode = null;

        try {
            if (request.getFileBaoCao() != null) {
                fileBaoCao = saveFile(request.getFileBaoCao(), "bao_cao", deTai.getId());
            }
            if (request.getFileSourceCode() != null) {
                fileSourceCode = saveFile(request.getFileSourceCode(), "source_code", deTai.getId());
            }
        } catch (Exception e) {
            throw new BadRequestException("Lỗi khi lưu file: " + e.getMessage());
        }

        BaoCao baoCao = BaoCao.builder()
                .deTai(deTai)
                .fileBaoCao(fileBaoCao)
                .fileSourceCode(fileSourceCode)
                .trangThai(TrangThaiBaoCao.DA_NOP)
                .ngayNop(LocalDateTime.now())
                .build();

        baoCao = baoCaoRepository.save(baoCao);

        // Cập nhật trạng thái đề tài
        deTai.setTrangThai(TrangThaiDeTai.DA_NOP_BAO_CAO);
        deTai.setBaoCao(baoCao);
        deTaiRepository.save(deTai);

        return mapToBaoCaoResponse(baoCao);
    }

    public BaoCaoResponse getBaoCaoCuaToi(String email) {
        SinhVien sinhVien = sinhVienRepository.findByTaiKhoanEmail(email).orElse(null);
        if (sinhVien == null) return null;
        List<DeTai> deTais = deTaiRepository.findBySinhVienId(sinhVien.getId());
        if (deTais.isEmpty()) {
            return null;
        }

        Optional<BaoCao> baoCao = baoCaoRepository.findByDeTaiId(deTais.get(0).getId());
        return baoCao.map(this::mapToBaoCaoResponse).orElse(null);
    }

    public DiemHuongDanResponse getKetQuaHuongDan(String email) {
        SinhVien sinhVien = sinhVienRepository.findByTaiKhoanEmail(email).orElse(null);
        if (sinhVien == null) return null;
        List<DeTai> deTais = deTaiRepository.findBySinhVienId(sinhVien.getId());
        if (deTais.isEmpty()) {
            return null;
        }

        DeTai deTai = deTais.get(0);
        if (deTai.getDiemHuongDan() == null) {
            return null;
        }
        return mapToDiemHuongDanResponse(deTai.getDiemHuongDan());
    }

    public DiemPhanBienResponse getKetQuaPhanBien(String email) {
        SinhVien sinhVien = sinhVienRepository.findByTaiKhoanEmail(email).orElse(null);
        if (sinhVien == null) return null;
        List<DeTai> deTais = deTaiRepository.findBySinhVienId(sinhVien.getId());
        if (deTais.isEmpty()) {
            return null;
        }

        DeTai deTai = deTais.get(0);
        if (deTai.getDiemPhanBien() == null) {
            return null;
        }
        return mapToDiemPhanBienResponse(deTai.getDiemPhanBien());
    }

    public DeTaiResponse getKetQuaBaoVe(String email) {
        SinhVien sinhVien = sinhVienRepository.findByTaiKhoanEmail(email).orElse(null);
        if (sinhVien == null) return null;
        List<DeTai> deTais = deTaiRepository.findBySinhVienId(sinhVien.getId());
        if (deTais.isEmpty()) {
            return null;
        }
        DeTai deTai = deTais.get(0);
        // Map với thông tin hội đồng bảo vệ
        return mapToDeTaiResponseWithHoiDong(deTai);
    }

    public DeTaiResponse getLichBaoVe(String email) {
        SinhVien sinhVien = sinhVienRepository.findByTaiKhoanEmail(email).orElse(null);
        if (sinhVien == null) return null;
        List<DeTai> deTais = deTaiRepository.findBySinhVienId(sinhVien.getId());
        if (deTais.isEmpty()) {
            return null;
        }
        DeTai deTai = deTais.get(0);
        // Chỉ trả về nếu đề tài có hội đồng bảo vệ
        if (deTai.getHoiDongBaoVe() == null) {
            return null;
        }
        return mapToLichBaoVeResponse(deTai);
    }

    private String saveFile(MultipartFile file, String type, Long deTaiId) throws Exception {
        String uploadDir = "./uploads/" + type + "/" + deTaiId;
        Path path = Paths.get(uploadDir);
        if (!Files.exists(path)) {
            Files.createDirectories(path);
        }

        // Lấy extension của file
        String originalName = file.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf("."));
        }

        // Tạo tên file không có ký tự đặc biệt, chỉ có timestamp + extension
        String fileName = System.currentTimeMillis() + extension;
        Path filePath = path.resolve(fileName);
        Files.copy(file.getInputStream(), filePath);

        return filePath.toString();
    }

    // Mappers
    private DotDangKyResponse mapToDotDangKyResponse(DotDangKy dot) {
        return DotDangKyResponse.builder()
                .id(dot.getId())
                .tenDot(dot.getTenDot())
                .namHoc(dot.getNamHoc())
                .hocKy(dot.getHocKy())
                .ngayBatDau(dot.getNgayBatDau())
                .ngayKetThuc(dot.getNgayKetThuc())
                .trangThai(dot.getTrangThai())
                .build();
    }

    private DeTaiResponse mapToDeTaiResponse(DeTai dt) {
        DeTaiResponse.DeTaiResponseBuilder builder = DeTaiResponse.builder()
                .id(dt.getId())
                .tenDeTai(dt.getTenDeTai())
                .noiDungDuKien(dt.getNoiDungDuKien())
                .congNgheSuDung(dt.getCongNgheSuDung())
                .trangThai(dt.getTrangThai())
                .ghiChu(dt.getGhiChu())
                .createdAt(dt.getCreatedAt());

        if (dt.getDotDangKy() != null) {
            builder.dotDangKyId(dt.getDotDangKy().getId())
                   .tenDotDangKy(dt.getDotDangKy().getTenDot());
        }

        if (dt.getSinhVien() != null) {
            builder.sinhVienId(dt.getSinhVien().getId())
                   .hoTenSinhVien(dt.getSinhVien().getHoTen())
                   .maSinhVien(dt.getSinhVien().getMaSinhVien())
                   .lopSinhVien(dt.getSinhVien().getLop());
            if (dt.getSinhVien().getBoMon() != null) {
                builder.boMonId(dt.getSinhVien().getBoMon().getId())
                       .tenBoMon(dt.getSinhVien().getBoMon().getTenBoMon());
            }
        }

        if (dt.getGiangVienDuKien() != null) {
            builder.giangVienDuKienId(dt.getGiangVienDuKien().getId())
                   .hoTenGiangVienDuKien(dt.getGiangVienDuKien().getHoTen());
        }

        if (dt.getPhanCongHuongDan() != null && dt.getPhanCongHuongDan().getGiangVien() != null) {
            builder.giangVienHuongDanId(dt.getPhanCongHuongDan().getGiangVien().getId())
                   .hoTenGiangVienHuongDan(dt.getPhanCongHuongDan().getGiangVien().getHoTen());
        }

        if (dt.getPhanCongPhanBien() != null && dt.getPhanCongPhanBien().getGiangVien() != null) {
            builder.giangVienPhanBienId(dt.getPhanCongPhanBien().getGiangVien().getId())
                   .hoTenGiangVienPhanBien(dt.getPhanCongPhanBien().getGiangVien().getHoTen());
        }

        if (dt.getDiemHuongDan() != null) builder.diemHuongDan(dt.getDiemHuongDan().getDiem());
        if (dt.getDiemPhanBien() != null) builder.diemPhanBien(dt.getDiemPhanBien().getDiem());

        // Thông tin hội đồng bảo vệ
        if (dt.getHoiDongBaoVe() != null) {
            HoiDongBaoVe hd = dt.getHoiDongBaoVe();
            builder.ngayBaoVe(hd.getNgayBaoVe())
                   .diaDiem(hd.getDiaDiem());
            if (hd.getThanhViens() != null && !hd.getThanhViens().isEmpty()) {
                List<DeTaiResponse.ThanhVienInfo> tvList = hd.getThanhViens().stream()
                        .map(tv -> {
                            BigDecimal diem = diemBaoVeRepository
                                    .findByHoiDongIdAndGiangVienId(hd.getId(), tv.getGiangVien().getId())
                                    .map(DiemBaoVe::getDiem)
                                    .orElse(null);
                            if (diem != null) {
                                diem = diem.setScale(2, RoundingMode.HALF_UP);
                            }
                            return DeTaiResponse.ThanhVienInfo.builder()
                                    .hoTen(tv.getGiangVien().getHoTen())
                                    .vaiTro(tv.getVaiTro() != null ? tv.getVaiTro().name() : null)
                                    .diem(diem)
                                    .build();
                        })
                        .collect(Collectors.toList());
                builder.thanhVienHoiDongList(tvList);
                builder.hoTenGiangVienHoiDong(hd.getThanhViens().get(0).getGiangVien().getHoTen());
            }
        }

        return builder.build();
    }

    private DeTaiResponse mapToDeTaiResponseWithHoiDong(DeTai dt) {
        DeTaiResponse.DeTaiResponseBuilder builder = DeTaiResponse.builder()
                .id(dt.getId())
                .tenDeTai(dt.getTenDeTai())
                .trangThai(dt.getTrangThai());

        if (dt.getSinhVien() != null) {
            builder.hoTenSinhVien(dt.getSinhVien().getHoTen())
                   .maSinhVien(dt.getSinhVien().getMaSinhVien())
                   .lopSinhVien(dt.getSinhVien().getLop());
        }

        if (dt.getPhanCongHuongDan() != null && dt.getPhanCongHuongDan().getGiangVien() != null) {
            builder.hoTenGiangVienHuongDan(dt.getPhanCongHuongDan().getGiangVien().getHoTen());
        }

        if (dt.getHoiDongBaoVe() != null) {
            HoiDongBaoVe hd = dt.getHoiDongBaoVe();
            builder.ngayBaoVe(hd.getNgayBaoVe())
                   .diaDiem(hd.getDiaDiem())
                   .nhanXetCham(hd.getNhanXetBaoVe());

            // Tính điểm trung bình
            BigDecimal avgDiem = diemBaoVeRepository.calculateAverageDiemByHoiDongId(hd.getId());
            if (avgDiem != null) {
                avgDiem = avgDiem.setScale(2, RoundingMode.HALF_UP);
            }
            builder.diemBaoVe(avgDiem);

            if (hd.getThanhViens() != null && !hd.getThanhViens().isEmpty()) {
                List<DeTaiResponse.ThanhVienInfo> tvList = hd.getThanhViens().stream()
                        .map(tv -> {
                            BigDecimal diem = diemBaoVeRepository
                                    .findByHoiDongIdAndGiangVienId(hd.getId(), tv.getGiangVien().getId())
                                    .map(DiemBaoVe::getDiem)
                                    .orElse(null);
                            if (diem != null) {
                                diem = diem.setScale(2, RoundingMode.HALF_UP);
                            }
                            return DeTaiResponse.ThanhVienInfo.builder()
                                    .hoTen(tv.getGiangVien().getHoTen())
                                    .vaiTro(tv.getVaiTro() != null ? tv.getVaiTro().name() : null)
                                    .diem(diem)
                                    .build();
                        })
                        .collect(Collectors.toList());
                builder.thanhVienHoiDongList(tvList);
            }
        }

        return builder.build();
    }

    private BaoCaoResponse mapToBaoCaoResponse(BaoCao bc) {
        return BaoCaoResponse.builder()
                .id(bc.getId())
                .deTaiId(bc.getDeTai().getId())
                .tenDeTai(bc.getDeTai().getTenDeTai())
                .fileBaoCao(bc.getFileBaoCao())
                .fileSourceCode(bc.getFileSourceCode())
                .ngayNop(bc.getNgayNop())
                .trangThai(bc.getTrangThai())
                .build();
    }

    private DiemHuongDanResponse mapToDiemHuongDanResponse(DiemHuongDan diem) {
        return DiemHuongDanResponse.builder()
                .id(diem.getId())
                .deTaiId(diem.getDeTai().getId())
                .tenDeTai(diem.getDeTai().getTenDeTai())
                .diem(diem.getDiem())
                .nhanXet(diem.getNhanXet())
                .ngayCham(diem.getNgayCham())
                .trangThai(diem.getTrangThai())
                .build();
    }

    private DiemPhanBienResponse mapToDiemPhanBienResponse(DiemPhanBien diem) {
        return DiemPhanBienResponse.builder()
                .id(diem.getId())
                .deTaiId(diem.getDeTai().getId())
                .tenDeTai(diem.getDeTai().getTenDeTai())
                .diem(diem.getDiem())
                .nhanXet(diem.getNhanXet())
                .ngayCham(diem.getNgayCham())
                .trangThai(diem.getTrangThai())
                .build();
    }

    private GiangVienResponse mapToGiangVienResponse(GiangVien gv) {
        return GiangVienResponse.builder()
                .id(gv.getId())
                .hoTen(gv.getHoTen())
                .hocVi(gv.getHocVi())
                .email(gv.getTaiKhoan() != null ? gv.getTaiKhoan().getEmail() : null)
                .boMonId(gv.getBoMon() != null ? gv.getBoMon().getId() : null)
                .tenBoMon(gv.getBoMon() != null ? gv.getBoMon().getTenBoMon() : null)
                .laLanhDao(gv.getLaLanhDao())
                .build();
    }

    private DeTaiResponse mapToLichBaoVeResponse(DeTai dt) {
        DeTaiResponse.DeTaiResponseBuilder builder = DeTaiResponse.builder()
                .id(dt.getId())
                .tenDeTai(dt.getTenDeTai())
                .trangThai(dt.getTrangThai());

        if (dt.getSinhVien() != null) {
            builder.hoTenSinhVien(dt.getSinhVien().getHoTen())
                   .maSinhVien(dt.getSinhVien().getMaSinhVien())
                   .lopSinhVien(dt.getSinhVien().getLop());
            if (dt.getSinhVien().getBoMon() != null) {
                builder.tenBoMon(dt.getSinhVien().getBoMon().getTenBoMon());
            }
        }

        if (dt.getPhanCongHuongDan() != null && dt.getPhanCongHuongDan().getGiangVien() != null) {
            builder.hoTenGiangVienHuongDan(dt.getPhanCongHuongDan().getGiangVien().getHoTen());
        }

        // Thông tin hội đồng bảo vệ đầy đủ
        if (dt.getHoiDongBaoVe() != null) {
            HoiDongBaoVe hd = dt.getHoiDongBaoVe();
            builder.ngayBaoVe(hd.getNgayBaoVe())
                   .diaDiem(hd.getDiaDiem());
            if (hd.getThanhViens() != null && !hd.getThanhViens().isEmpty()) {
                List<DeTaiResponse.ThanhVienInfo> tvList = hd.getThanhViens().stream()
                        .map(tv -> {
                            BigDecimal diem = diemBaoVeRepository
                                    .findByHoiDongIdAndGiangVienId(hd.getId(), tv.getGiangVien().getId())
                                    .map(DiemBaoVe::getDiem)
                                    .orElse(null);
                            if (diem != null) {
                                diem = diem.setScale(2, RoundingMode.HALF_UP);
                            }
                            return DeTaiResponse.ThanhVienInfo.builder()
                                    .hoTen(tv.getGiangVien().getHoTen())
                                    .vaiTro(tv.getVaiTro() != null ? tv.getVaiTro().name() : null)
                                    .diem(diem)
                                    .build();
                        })
                        .collect(Collectors.toList());
                builder.thanhVienHoiDongList(tvList);
            }
        }

        return builder.build();
    }
}

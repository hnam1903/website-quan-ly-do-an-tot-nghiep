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
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final DotDangKyRepository dotDangKyRepository;
    private final DeTaiRepository deTaiRepository;
    private final BoMonRepository boMonRepository;
    private final GiangVienRepository giangVienRepository;
    private final SinhVienRepository sinhVienRepository;
    private final KhoaRepository khoaRepository;
    private final TaiKhoanRepository taiKhoanRepository;
    private final DiemBaoVeRepository diemBaoVeRepository;

    private final AuthService authService;

    // ==================== Đợt đăng ký ====================
    
    @Transactional
    public DotDangKyResponse createDotDangKy(DotDangKyRequest request) {
        LocalDateTime ngayBatDau = LocalDate.parse(request.getNgayBatDau()).atStartOfDay();
        LocalDateTime ngayKetThuc = ngayBatDau.plusDays(7);

        DotDangKy dotDangKy = DotDangKy.builder()
                .tenDot(request.getTenDot())
                .namHoc(request.getNamHoc())
                .hocKy(request.getHocKy())
                .ngayBatDau(ngayBatDau)
                .ngayKetThuc(ngayKetThuc)
                .trangThai(TrangThaiDot.CHUONG_TRINH)
                .build();

        dotDangKy = dotDangKyRepository.save(dotDangKy);
        return mapToDotDangKyResponse(dotDangKy);
    }

    public List<DotDangKyResponse> getAllDotDangKy() {
        return dotDangKyRepository.findAllByOrderByNgayBatDauDesc()
                .stream()
                .map(this::mapToDotDangKyResponse)
                .collect(Collectors.toList());
    }

    public DotDangKyResponse getDotDangKyById(Long id) {
        DotDangKy dotDangKy = dotDangKyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt đăng ký"));
        return mapToDotDangKyResponse(dotDangKy);
    }

    @Transactional
    public DotDangKyResponse updateDotDangKy(Long id, DotDangKyRequest request) {
        DotDangKy dotDangKy = dotDangKyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt đăng ký"));

        dotDangKy.setTenDot(request.getTenDot());
        dotDangKy.setNamHoc(request.getNamHoc());
        dotDangKy.setHocKy(request.getHocKy());
        if (request.getNgayBatDau() != null) {
            LocalDateTime ngayBatDau = LocalDate.parse(request.getNgayBatDau()).atStartOfDay();
            dotDangKy.setNgayBatDau(ngayBatDau);
            dotDangKy.setNgayKetThuc(ngayBatDau.plusDays(7));
        }

        dotDangKy = dotDangKyRepository.save(dotDangKy);
        return mapToDotDangKyResponse(dotDangKy);
    }

    @Transactional
    public void deleteDotDangKy(Long id) {
        DotDangKy dotDangKy = dotDangKyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt đăng ký"));
        
        if (!deTaiRepository.findByDotDangKyId(id).isEmpty()) {
            throw new BadRequestException("Đợt đăng ký đã có sinh viên đăng ký, không thể xóa");
        }
        
        dotDangKyRepository.delete(dotDangKy);
    }

    // ==================== Gửi lên Bộ môn ====================

    public List<DeTaiResponse> getDeTaiDangKy(Long dotDangKyId, TrangThaiDeTai trangThai) {
        List<DeTai> deTais;
        if (trangThai != null) {
            if (dotDangKyId != null) {
                deTais = deTaiRepository.findByDotDangKyIdAndTrangThai(dotDangKyId, trangThai);
            } else {
                deTais = deTaiRepository.findByTrangThai(trangThai);
            }
        } else if (dotDangKyId != null) {
            deTais = deTaiRepository.findByDotDangKyId(dotDangKyId);
        } else {
            deTais = deTaiRepository.findAll();
        }
        return deTais.stream()
                .map(this::mapToDeTaiResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<DeTaiResponse> guiNhieuLenBoMon(List<Long> ids) {
        List<DeTai> deTais = deTaiRepository.findAllById(ids);
        if (deTais.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy đề tài nào");
        }

        List<DeTaiResponse> results = new ArrayList<>();
        for (DeTai deTai : deTais) {
            if (deTai.getTrangThai() != TrangThaiDeTai.CHO_DUYET) {
                throw new BadRequestException("Chỉ có thể gửi đề tài đang chờ duyệt lên Bộ môn");
            }
            deTai.setTrangThai(TrangThaiDeTai.DA_GUI_BO_MON);
            DeTai saved = deTaiRepository.save(deTai);
            results.add(mapToDeTaiResponse(saved));
        }

        return results;
    }

    @Transactional
    public DeTaiResponse guiLenBoMon(Long id) {
        DeTai deTai = deTaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        if (deTai.getTrangThai() != TrangThaiDeTai.CHO_DUYET) {
            throw new BadRequestException("Chỉ có thể gửi đề tài đang chờ duyệt lên Bộ môn");
        }

        deTai.setTrangThai(TrangThaiDeTai.DA_GUI_BO_MON);
        deTai = deTaiRepository.save(deTai);

        return mapToDeTaiResponse(deTai);
    }

    // ==================== Đề tài bị từ chối ====================

    public List<DeTaiResponse> getDeTaiBiTuChoi(Long dotDangKyId) {
        List<DeTai> deTais;
        if (dotDangKyId != null) {
            deTais = deTaiRepository.findByDotDangKyIdAndTrangThai(dotDangKyId, TrangThaiDeTai.BI_TU_CHOI);
        } else {
            deTais = deTaiRepository.findByTrangThai(TrangThaiDeTai.BI_TU_CHOI);
        }
        return deTais.stream()
                .map(this::mapToDeTaiResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void xoaDeTaiBiTuChoi(Long id) {
        DeTai deTai = deTaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        if (deTai.getTrangThai() != TrangThaiDeTai.BI_TU_CHOI) {
            throw new BadRequestException("Chỉ có thể xóa đề tài bị từ chối");
        }

        deTaiRepository.delete(deTai);
    }

    @Transactional
    public void xoaNhieuDeTaiBiTuChoi(List<Long> ids) {
        List<DeTai> deTais = deTaiRepository.findAllById(ids);
        if (deTais.isEmpty()) {
            throw new ResourceNotFoundException("Không tìm thấy đề tài nào");
        }

        for (DeTai deTai : deTais) {
            if (deTai.getTrangThai() != TrangThaiDeTai.BI_TU_CHOI) {
                throw new BadRequestException("Chỉ có thể xóa đề tài bị từ chối");
            }
        }

        deTaiRepository.deleteAll(deTais);
    }

    // ==================== Bộ môn ====================

    @Transactional
    public BoMonResponse createBoMon(BoMonRequest request) {
        if (boMonRepository.findByMaBoMon(request.getMaBoMon()).isPresent()) {
            throw new BadRequestException("Mã bộ môn đã tồn tại");
        }

        Khoa khoa = khoaRepository.findById(request.getKhoaId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khoa"));

        BoMon boMon = BoMon.builder()
                .tenBoMon(request.getTenBoMon())
                .maBoMon(request.getMaBoMon())
                .khoa(khoa)
                .build();

        boMon = boMonRepository.save(boMon);
        return mapToBoMonResponse(boMon);
    }

    public List<BoMonResponse> getAllBoMon() {
        return boMonRepository.findAll()
                .stream()
                .map(this::mapToBoMonResponse)
                .collect(Collectors.toList());
    }

    public BoMonResponse getBoMonById(Long id) {
        BoMon boMon = boMonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ môn"));
        return mapToBoMonResponse(boMon);
    }

    @Transactional
    public BoMonResponse updateBoMon(Long id, BoMonRequest request) {
        BoMon boMon = boMonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ môn"));

        boMon.setTenBoMon(request.getTenBoMon());
        boMon.setMaBoMon(request.getMaBoMon());

        boMon = boMonRepository.save(boMon);
        return mapToBoMonResponse(boMon);
    }

    @Transactional
    public void deleteBoMon(Long id) {
        BoMon boMon = boMonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ môn"));
        
        if (!boMon.getGiangViens().isEmpty() || !boMon.getSinhViens().isEmpty()) {
            throw new BadRequestException("Bộ môn đã có giảng viên hoặc sinh viên, không thể xóa");
        }
        
        boMonRepository.delete(boMon);
    }

    // ==================== Giảng viên ====================

    public List<GiangVienResponse> getAllGiangVien(Long boMonId) {
        List<GiangVien> giangViens;
        if (boMonId != null) {
            giangViens = giangVienRepository.findAllByBoMonId(boMonId);
        } else {
            giangViens = giangVienRepository.findAll();
        }
        return giangViens.stream().map(this::mapToGiangVienResponse).collect(Collectors.toList());
    }

    public GiangVienResponse getGiangVienById(Long id) {
        GiangVien giangVien = giangVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));
        return mapToGiangVienResponse(giangVien);
    }

    @Transactional
    public GiangVienResponse updateGiangVien(Long id, GiangVienRequest request) {
        GiangVien giangVien = giangVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        giangVien.setHoTen(request.getHoTen());
        giangVien.setHocVi(request.getHocVi());
        
        if (request.getBoMonId() != null) {
            BoMon boMon = boMonRepository.findById(request.getBoMonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ môn"));
            giangVien.setBoMon(boMon);
        }

        giangVien = giangVienRepository.save(giangVien);
        return mapToGiangVienResponse(giangVien);
    }

    @Transactional
    public GiangVienResponse setLanhDaoBoMon(Long id, Boolean isLanhDao) {
        GiangVien giangVien = giangVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        giangVien.setLaLanhDao(isLanhDao);
        
        // Update role if needed
        TaiKhoan taiKhoan = giangVien.getTaiKhoan();
        if (isLanhDao && taiKhoan.getRole() == Role.GIANG_VIEN) {
            taiKhoan.setRole(Role.LANH_DAO_BO_MON);
            taiKhoanRepository.save(taiKhoan);
        } else if (!isLanhDao && taiKhoan.getRole() == Role.LANH_DAO_BO_MON) {
            taiKhoan.setRole(Role.GIANG_VIEN);
            taiKhoanRepository.save(taiKhoan);
        }

        giangVien = giangVienRepository.save(giangVien);
        return mapToGiangVienResponse(giangVien);
    }

    @Transactional
    public void deleteGiangVien(Long id) {
        GiangVien giangVien = giangVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));
        
        TaiKhoan taiKhoan = giangVien.getTaiKhoan();
        giangVienRepository.delete(giangVien);
        if (taiKhoan != null) {
            taiKhoanRepository.delete(taiKhoan);
        }
    }

    // ==================== Sinh viên ====================

    public List<SinhVienResponse> getAllSinhVien(Long boMonId) {
        List<SinhVien> sinhViens;
        if (boMonId != null) {
            sinhViens = sinhVienRepository.findAllByBoMonId(boMonId);
        } else {
            sinhViens = sinhVienRepository.findAll();
        }
        return sinhViens.stream().map(this::mapToSinhVienResponse).collect(Collectors.toList());
    }

    public SinhVienResponse getSinhVienById(Long id) {
        SinhVien sinhVien = sinhVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên"));
        return mapToSinhVienResponse(sinhVien);
    }

    @Transactional
    public SinhVienResponse updateSinhVien(Long id, SinhVienRequest request) {
        SinhVien sinhVien = sinhVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên"));

        sinhVien.setHoTen(request.getHoTen());
        sinhVien.setMaSinhVien(request.getMaSinhVien());
        sinhVien.setLop(request.getLop());
        
        if (request.getBoMonId() != null) {
            BoMon boMon = boMonRepository.findById(request.getBoMonId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy bộ môn"));
            sinhVien.setBoMon(boMon);
        }

        sinhVien = sinhVienRepository.save(sinhVien);
        return mapToSinhVienResponse(sinhVien);
    }

    @Transactional
    public void deleteSinhVien(Long id) {
        SinhVien sinhVien = sinhVienRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy sinh viên"));
        
        TaiKhoan taiKhoan = sinhVien.getTaiKhoan();
        sinhVienRepository.delete(sinhVien);
        if (taiKhoan != null) {
            taiKhoanRepository.delete(taiKhoan);
        }
    }

    // ==================== Dashboard ====================

    public DashboardResponse getDashboard() {
        return DashboardResponse.builder()
                .tongSoGiangVien(giangVienRepository.count())
                .tongSoSinhVien(sinhVienRepository.count())
                .tongSoDeTai(deTaiRepository.count())
                .deTaiChoDuyet(deTaiRepository.countByTrangThai(TrangThaiDeTai.CHO_DUYET))
                .deTaiDangThucHien(deTaiRepository.countByTrangThai(TrangThaiDeTai.DANG_THUC_HIEN) +
                        deTaiRepository.countByTrangThai(TrangThaiDeTai.DA_NOP_BAO_CAO))
                .deTaiHoanThanh(deTaiRepository.countByTrangThai(TrangThaiDeTai.HOAN_THANH))
                .deTaiKhongDat(deTaiRepository.countByTrangThai(TrangThaiDeTai.KHONG_DAT))
                .build();
    }

    // ==================== Thống kê ====================

    public List<DeTaiResponse> getThongKeTongHop(Long dotDangKyId, Long boMonId) {
        List<DeTai> deTais;

        // Lọc theo điều kiện
        if (dotDangKyId != null && boMonId != null) {
            deTais = deTaiRepository.findByDotDangKyId(dotDangKyId).stream()
                    .filter(dt -> dt.getSinhVien() != null &&
                                  dt.getSinhVien().getBoMon() != null &&
                                  dt.getSinhVien().getBoMon().getId().equals(boMonId))
                    .collect(Collectors.toList());
        } else if (dotDangKyId != null) {
            deTais = deTaiRepository.findByDotDangKyId(dotDangKyId);
        } else if (boMonId != null) {
            deTais = deTaiRepository.findAll().stream()
                    .filter(dt -> dt.getSinhVien() != null &&
                                  dt.getSinhVien().getBoMon() != null &&
                                  dt.getSinhVien().getBoMon().getId().equals(boMonId))
                    .collect(Collectors.toList());
        } else {
            deTais = deTaiRepository.findAll();
        }

        // Chỉ lấy các đề tài có sinh viên (đã gán)
        deTais = deTais.stream()
                .filter(dt -> dt.getSinhVien() != null)
                .collect(Collectors.toList());

        return deTais.stream()
                .map(this::mapToThongKeResponse)
                .collect(Collectors.toList());
    }

    private DeTaiResponse mapToThongKeResponse(DeTai dt) {
        DeTaiResponse.DeTaiResponseBuilder builder = DeTaiResponse.builder()
                .id(dt.getId())
                .tenDeTai(dt.getTenDeTai())
                .noiDungDuKien(dt.getNoiDungDuKien())
                .congNgheSuDung(dt.getCongNgheSuDung())
                .trangThai(dt.getTrangThai())
                .ghiChu(dt.getGhiChu())
                .createdAt(dt.getCreatedAt());

        // Sinh viên
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

        // GV hướng dẫn
        if (dt.getPhanCongHuongDan() != null && dt.getPhanCongHuongDan().getGiangVien() != null) {
            builder.giangVienHuongDanId(dt.getPhanCongHuongDan().getGiangVien().getId())
                   .hoTenGiangVienHuongDan(dt.getPhanCongHuongDan().getGiangVien().getHoTen());
        }

        // GV phản biện
        if (dt.getPhanCongPhanBien() != null && dt.getPhanCongPhanBien().getGiangVien() != null) {
            builder.giangVienPhanBienId(dt.getPhanCongPhanBien().getGiangVien().getId())
                   .hoTenGiangVienPhanBien(dt.getPhanCongPhanBien().getGiangVien().getHoTen());
        }

        // Điểm hướng dẫn
        if (dt.getDiemHuongDan() != null) {
            builder.diemHuongDan(dt.getDiemHuongDan().getDiem());
        }

        // Điểm phản biện
        if (dt.getDiemPhanBien() != null) {
            builder.diemPhanBien(dt.getDiemPhanBien().getDiem());
        }

        // Điểm bảo vệ (từ hội đồng - trung bình từ bảng diem_bao_ve)
        if (dt.getHoiDongBaoVe() != null) {
            BigDecimal avgDiemBV = diemBaoVeRepository.calculateAverageDiemByHoiDongId(dt.getHoiDongBaoVe().getId());
            if (avgDiemBV != null) {
                avgDiemBV = avgDiemBV.setScale(2, RoundingMode.HALF_UP);
            }
            builder.diemBaoVe(avgDiemBV);
        }

        return builder.build();
    }

    // ==================== Mappers ====================

    private DotDangKyResponse mapToDotDangKyResponse(DotDangKy dotDangKy) {
        return DotDangKyResponse.builder()
                .id(dotDangKy.getId())
                .tenDot(dotDangKy.getTenDot())
                .namHoc(dotDangKy.getNamHoc())
                .hocKy(dotDangKy.getHocKy())
                .ngayBatDau(dotDangKy.getNgayBatDau())
                .ngayKetThuc(dotDangKy.getNgayKetThuc())
                .trangThai(dotDangKy.getTrangThai())
                .soLuongDangKy(dotDangKy.getDeTais() != null ? dotDangKy.getDeTais().size() : 0)
                .build();
    }

    private BoMonResponse mapToBoMonResponse(BoMon boMon) {
        return BoMonResponse.builder()
                .id(boMon.getId())
                .tenBoMon(boMon.getTenBoMon())
                .maBoMon(boMon.getMaBoMon())
                .khoaId(boMon.getKhoa() != null ? boMon.getKhoa().getId() : null)
                .tenKhoa(boMon.getKhoa() != null ? boMon.getKhoa().getTenKhoa() : null)
                .soLuongGiangVien(boMon.getGiangViens() != null ? boMon.getGiangViens().size() : 0)
                .soLuongSinhVien(boMon.getSinhViens() != null ? boMon.getSinhViens().size() : 0)
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

    private SinhVienResponse mapToSinhVienResponse(SinhVien sv) {
        return SinhVienResponse.builder()
                .id(sv.getId())
                .hoTen(sv.getHoTen())
                .maSinhVien(sv.getMaSinhVien())
                .lop(sv.getLop())
                .email(sv.getTaiKhoan() != null ? sv.getTaiKhoan().getEmail() : null)
                .boMonId(sv.getBoMon() != null ? sv.getBoMon().getId() : null)
                .tenBoMon(sv.getBoMon() != null ? sv.getBoMon().getTenBoMon() : null)
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

        if (dt.getDiemHuongDan() != null) {
            builder.diemHuongDan(dt.getDiemHuongDan().getDiem());
        }

        if (dt.getDiemPhanBien() != null) {
            builder.diemPhanBien(dt.getDiemPhanBien().getDiem());
        }

        return builder.build();
    }
}

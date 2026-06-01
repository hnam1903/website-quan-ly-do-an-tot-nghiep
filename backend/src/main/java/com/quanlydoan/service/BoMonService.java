package com.quanlydoan.service;

import com.quanlydoan.dto.request.*;
import com.quanlydoan.dto.response.*;
import com.quanlydoan.entity.*;
import com.quanlydoan.enums.*;
import com.quanlydoan.exception.BadRequestException;
import com.quanlydoan.exception.ResourceNotFoundException;
import com.quanlydoan.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BoMonService {

    private final DeTaiRepository deTaiRepository;
    private final GiangVienRepository giangVienRepository;
    private final PhanCongHuongDanRepository phanCongHuongDanRepository;
    private final PhanCongPhanBienRepository phanCongPhanBienRepository;
    private final HoiDongBaoVeRepository hoiDongBaoVeRepository;
    private final ThanhVienHoiDongRepository thanhVienHoiDongRepository;
    private final SinhVienRepository sinhVienRepository;
    private final BoMonRepository boMonRepository;
    private final BaoCaoRepository baoCaoRepository;
    private final DiemBaoVeRepository diemBaoVeRepository;
    private final DotDangKyRepository dotDangKyRepository;
    private final DiemHuongDanRepository diemHuongDanRepository;
    private final DiemPhanBienRepository diemPhanBienRepository;
    private final AuthService authService;
    private final DiemBaoVeService diemBaoVeService;

    public List<BoMonResponse> getAllBoMon() {
        return boMonRepository.findAll().stream().map(this::mapToBoMonResponse).collect(Collectors.toList());
    }

    public List<DotDangKyResponse> getAllDotDangKy() {
        return dotDangKyRepository.findAllByOrderByNgayBatDauDesc()
                .stream()
                .map(this::mapToDotDangKyResponse)
                .collect(Collectors.toList());
    }

    public List<BaoCaoResponse> getBaoCaoByBoMon(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findAllByBoMonId(boMonId);
        List<BaoCaoResponse> responses = new ArrayList<>();

        for (DeTai dt : deTais) {
            if (dt.getBaoCao() != null) {
                BaoCao bc = dt.getBaoCao();
                BaoCaoResponse.BaoCaoResponseBuilder builder = BaoCaoResponse.builder()
                        .id(bc.getId())
                        .deTaiId(dt.getId())
                        .tenDeTai(dt.getTenDeTai())
                        .fileBaoCao(bc.getFileBaoCao())
                        .ngayNop(bc.getNgayNop())
                        .trangThai(bc.getTrangThai());

                if (dt.getSinhVien() != null) {
                    builder.hoTenSinhVien(dt.getSinhVien().getHoTen())
                           .maSinhVien(dt.getSinhVien().getMaSinhVien());
                }

                responses.add(builder.build());
            }
        }

        return responses;
    }

    public BaoCaoResponse getBaoCaoByDeTaiId(Long deTaiId) {
        DeTai deTai = deTaiRepository.findById(deTaiId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        if (deTai.getBaoCao() == null) {
            return null;
        }

        BaoCao bc = deTai.getBaoCao();
        BaoCaoResponse.BaoCaoResponseBuilder builder = BaoCaoResponse.builder()
                .id(bc.getId())
                .deTaiId(deTai.getId())
                .tenDeTai(deTai.getTenDeTai())
                .fileBaoCao(bc.getFileBaoCao())
                .ngayNop(bc.getNgayNop())
                .trangThai(bc.getTrangThai());

        if (deTai.getSinhVien() != null) {
            builder.hoTenSinhVien(deTai.getSinhVien().getHoTen())
                   .maSinhVien(deTai.getSinhVien().getMaSinhVien());
        }

        return builder.build();
    }

    public List<DeTaiResponse> getDeTaiByBoMon(Long boMonId) {
        log.info("getDeTaiByBoMon called with boMonId: {}", boMonId);
        List<DeTai> deTais = deTaiRepository.findAllByBoMonId(boMonId);
        log.info("Found {} de tai for boMonId: {}", deTais.size(), boMonId);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiByBoMon(Long boMonId, Long dotDangKyId) {
        log.info("getDeTaiByBoMon called with boMonId: {}, dotDangKyId: {}", boMonId, dotDangKyId);
        List<DeTai> deTais;
        if (dotDangKyId != null) {
            deTais = deTaiRepository.findByBoMonIdAndDotDangKyId(boMonId, dotDangKyId);
        } else {
            deTais = deTaiRepository.findAllByBoMonId(boMonId);
        }
        log.info("Found {} de tai", deTais.size());
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiByTrangThai(Long boMonId, TrangThaiDeTai trangThai) {
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, trangThai);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiByTrangThai(Long boMonId, TrangThaiDeTai trangThai, Long dotDangKyId) {
        List<DeTai> deTais;
        if (dotDangKyId != null) {
            deTais = deTaiRepository.findByBoMonIdAndTrangThaiAndDotDangKyId(boMonId, trangThai, dotDangKyId);
        } else {
            deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, trangThai);
        }
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    // Lấy đề tài đang chờ bộ môn duyệt (sinh viên vừa đăng ký)
    public List<DeTaiResponse> getDeTaiChoBoMonDuyet(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, TrangThaiDeTai.CHO_BO_MON_DUYET);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    @Transactional
    public DeTaiResponse duyetDeTaiBoMon(Long id) {
        DeTai deTai = deTaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        if (deTai.getTrangThai() != TrangThaiDeTai.CHO_BO_MON_DUYET) {
            throw new BadRequestException("Đề tài chưa được sinh viên đăng ký hoặc đã được duyệt");
        }

        if (deTai.getGiangVienDuKien() != null) {
            PhanCongHuongDan phanCong = PhanCongHuongDan.builder()
                    .deTai(deTai)
                    .giangVien(deTai.getGiangVienDuKien())
                    .trangThai(TrangThaiPhanCong.CHO_DUYET)
                    .ngayPhanCong(LocalDateTime.now())
                    .build();
            phanCong = phanCongHuongDanRepository.save(phanCong);
            deTai.setPhanCongHuongDan(phanCong);
            deTai.setTrangThai(TrangThaiDeTai.CHO_GV_DUYET);
        } else {
            deTai.setTrangThai(TrangThaiDeTai.CHO_GV_PHAN_CONG);
        }

        deTai = deTaiRepository.save(deTai);
        return mapToDeTaiResponse(deTai);
    }

    @Transactional
    public DeTaiResponse tuChoiDeTaiBoMon(Long id, String ghiChu) {
        DeTai deTai = deTaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        if (deTai.getTrangThai() != TrangThaiDeTai.CHO_BO_MON_DUYET) {
            throw new BadRequestException("Đề tài chưa được sinh viên đăng ký hoặc đã được duyệt");
        }

        deTai.setTrangThai(TrangThaiDeTai.BI_TU_CHOI);
        deTai.setGhiChu(ghiChu != null ? ghiChu.trim() : "");
        deTai = deTaiRepository.save(deTai);

        return mapToDeTaiResponse(deTai);
    }

    public List<DeTaiResponse> getDeTaiHoanThanh(Long boMonId, Long dotDangKyId) {
        List<DeTai> deTais;
        if (dotDangKyId != null) {
            deTais = deTaiRepository.findByBoMonIdAndTrangThaiAndDotDangKyId(boMonId, TrangThaiDeTai.HOAN_THANH, dotDangKyId);
        } else {
            deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, TrangThaiDeTai.HOAN_THANH);
        }
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiKhongDat(Long boMonId, String loai, Long dotDangKyId) {
        List<TrangThaiDeTai> trangThais = new ArrayList<>();
        if ("HUONG_DAN".equals(loai)) {
            trangThais.add(TrangThaiDeTai.KHONG_DAT_GVHD);
        } else if ("PHAN_BIEN".equals(loai)) {
            trangThais.add(TrangThaiDeTai.KHONG_DAT_PHAN_BIEN);
        } else {
            trangThais.add(TrangThaiDeTai.KHONG_DAT_BAO_VE);
        }
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThaiIn(boMonId, trangThais);
        if (dotDangKyId != null) {
            deTais = deTais.stream().filter(dt -> dt.getDotDangKy() != null && dt.getDotDangKy().getId().equals(dotDangKyId)).collect(Collectors.toList());
        }
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<GiangVienResponse> getGiangVienByBoMon(Long boMonId) {
        List<GiangVien> giangViens = giangVienRepository.findAllByBoMonId(boMonId);
        return giangViens.stream().map(this::mapToGiangVienResponse).collect(Collectors.toList());
    }

    public List<SinhVienResponse> getSinhVienByBoMon(Long boMonId) {
        List<SinhVien> sinhViens = sinhVienRepository.findAllByBoMonId(boMonId);
        return sinhViens.stream().map(this::mapToSinhVienResponse).collect(Collectors.toList());
    }

    public List<SinhVienResponse> getAllSinhVien(Long boMonId) {
        List<SinhVien> sinhViens;
        if (boMonId != null) {
            sinhViens = sinhVienRepository.findAllByBoMonId(boMonId);
        } else {
            sinhViens = sinhVienRepository.findAll();
        }
        return sinhViens.stream().map(this::mapToSinhVienResponse).collect(Collectors.toList());
    }

    @Transactional
    public GiangVienResponse capNhatGioiHanDeTai(Long giangVienId, Integer soDeTaiToiDa) {
        GiangVien gv = giangVienRepository.findById(giangVienId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        gv.setSoDeTaiToiDa(soDeTaiToiDa);
        gv = giangVienRepository.save(gv);

        return mapToGiangVienResponse(gv);
    }

    @Transactional
    public PhanCongHuongDanResponse phanCongHuongDan(PhanCongHuongDanRequest request) {
        DeTai deTai = deTaiRepository.findById(request.getDeTaiId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));
        GiangVien giangVien = giangVienRepository.findById(request.getGiangVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        TrangThaiDeTai currentStatus = deTai.getTrangThai();
        if (currentStatus != TrangThaiDeTai.CHO_GV_PHAN_CONG &&
            currentStatus != TrangThaiDeTai.GV_TU_CHOI &&
            currentStatus != TrangThaiDeTai.CHO_BO_MON_PHAN_CONG) {
            throw new BadRequestException("Đề tài không ở trạng thái cho phép phân công GVHD");
        }

        if (giangVien.getSoDeTaiToiDa() != null) {
            long soDeTaiDangHuongDan = phanCongHuongDanRepository
                    .countDangThucHienByGiangVienId(giangVien.getId(), TrangThaiPhanCong.DUYET);

            if (soDeTaiDangHuongDan >= giangVien.getSoDeTaiToiDa()) {
                throw new BadRequestException(
                    "Giảng viên " + giangVien.getHoTen() +
                    " đã đạt số đề tài tối đa (" + giangVien.getSoDeTaiToiDa() + "). Không thể phân công thêm.");
            }
        }

        PhanCongHuongDan phanCong = deTai.getPhanCongHuongDan();
        if (phanCong == null) {
            phanCong = PhanCongHuongDan.builder()
                    .deTai(deTai)
                    .giangVien(giangVien)
                    .trangThai(TrangThaiPhanCong.DUYET)
                    .ngayPhanCong(LocalDateTime.now())
                    .build();
        } else {
            phanCong.setGiangVien(giangVien);
            phanCong.setTrangThai(TrangThaiPhanCong.DUYET);
            phanCong.setNgayPhanCong(LocalDateTime.now());
        }
        phanCong = phanCongHuongDanRepository.save(phanCong);

        deTai.setTrangThai(TrangThaiDeTai.DANG_THUC_HIEN);
        deTai.setPhanCongHuongDan(phanCong);
        deTaiRepository.save(deTai);

        return mapToPhanCongHuongDanResponse(phanCong);
    }

    public List<PhanCongHuongDanResponse> getDeTaiChoGVDuyet(Long boMonId) {
        List<PhanCongHuongDanResponse> responses = new ArrayList<>();

        // Lấy các đề tài cần GVHD duyệt:
        List<DeTai> deTais = deTaiRepository.findAll().stream()
                .filter(dt -> dt.getSinhVien() != null &&
                             dt.getSinhVien().getBoMon() != null &&
                             dt.getSinhVien().getBoMon().getId().equals(boMonId))
                .filter(dt -> {
                    if (dt.getTrangThai() == TrangThaiDeTai.CHO_GV_DUYET && dt.getPhanCongHuongDan() != null) {
                        return true;
                    }
                    if (dt.getTrangThai() == TrangThaiDeTai.GV_TU_CHOI) {
                        return true;
                    }
                    if (dt.getTrangThai() == TrangThaiDeTai.CHO_BO_MON_PHAN_CONG) {
                        return true;
                    }
                    return false;
                })
                .collect(Collectors.toList());

        for (DeTai dt : deTais) {
            PhanCongHuongDanResponse.PhanCongHuongDanResponseBuilder builder = PhanCongHuongDanResponse.builder()
                    .id(dt.getPhanCongHuongDan() != null ? dt.getPhanCongHuongDan().getId() : dt.getId())
                    .deTaiId(dt.getId())
                    .tenDeTai(dt.getTenDeTai())
                    .noiDungDuKien(dt.getNoiDungDuKien())
                    .congNgheSuDung(dt.getCongNgheSuDung())
                    .trangThai(dt.getPhanCongHuongDan() != null ? dt.getPhanCongHuongDan().getTrangThai() : TrangThaiPhanCong.CHO_DUYET)
                    .sinhVienId(dt.getSinhVien().getId())
                    .hoTenSinhVien(dt.getSinhVien().getHoTen())
                    .maSinhVien(dt.getSinhVien().getMaSinhVien())
                    .lopSinhVien(dt.getSinhVien().getLop())
                    .tenBoMon(dt.getSinhVien().getBoMon().getTenBoMon())
                    .deTaiTrangThai(dt.getTrangThai() != null ? dt.getTrangThai().name() : null);

            // GVHD dự kiến hoặc GVHD đã được phân công
            if (dt.getPhanCongHuongDan() != null && dt.getPhanCongHuongDan().getGiangVien() != null) {
                builder.giangVienId(dt.getPhanCongHuongDan().getGiangVien().getId())
                       .hoTenGiangVien(dt.getPhanCongHuongDan().getGiangVien().getHoTen());
            }

            responses.add(builder.build());
        }

        return responses;
    }

    public List<PhanCongHuongDanResponse> getDanhSachGvhd(Long boMonId, Long dotDangKyId) {
        List<PhanCongHuongDan> phanCongs = phanCongHuongDanRepository.findAll().stream()
                .filter(pc -> pc.getDeTai() != null &&
                              pc.getDeTai().getSinhVien() != null &&
                              pc.getDeTai().getSinhVien().getBoMon() != null &&
                              pc.getDeTai().getSinhVien().getBoMon().getId().equals(boMonId) &&
                              pc.getTrangThai() == TrangThaiPhanCong.DUYET)
                .collect(Collectors.toList());

        if (dotDangKyId != null) {
            phanCongs = phanCongs.stream()
                    .filter(pc -> pc.getDeTai().getDotDangKy() != null &&
                                  pc.getDeTai().getDotDangKy().getId().equals(dotDangKyId))
                    .collect(Collectors.toList());
        }

        return phanCongs.stream()
                .map(this::mapToPhanCongHuongDanResponse)
                .collect(Collectors.toList());
    }

    public List<PhanCongPhanBienResponse> getDanhSachGvpb(Long boMonId, Long dotDangKyId) {
        List<PhanCongPhanBien> phanCongs = phanCongPhanBienRepository.findAll().stream()
                .filter(pc -> pc.getDeTai() != null &&
                              pc.getDeTai().getSinhVien() != null &&
                              pc.getDeTai().getSinhVien().getBoMon() != null &&
                              pc.getDeTai().getSinhVien().getBoMon().getId().equals(boMonId))
                .collect(Collectors.toList());

        // Lọc theo đợt đăng ký nếu có
        if (dotDangKyId != null) {
            phanCongs = phanCongs.stream()
                    .filter(pc -> pc.getDeTai().getDotDangKy() != null &&
                                  pc.getDeTai().getDotDangKy().getId().equals(dotDangKyId))
                    .collect(Collectors.toList());
        }

        return phanCongs.stream()
                .map(this::mapToPhanCongPhanBienResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public PhanCongPhanBienResponse phanCongPhanBien(PhanCongPhanBienRequest request) {
        DeTai deTai = deTaiRepository.findById(request.getDeTaiId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));
        GiangVien giangVien = giangVienRepository.findById(request.getGiangVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        if (deTai.getPhanCongHuongDan() != null &&
            deTai.getPhanCongHuongDan().getGiangVien() != null) {
            Long gvhdId = deTai.getPhanCongHuongDan().getGiangVien().getId();
            if (gvhdId.equals(request.getGiangVienId())) {
                throw new BadRequestException("Giảng viên phản biện không được trùng với giảng viên hướng dẫn");
            }
        }

        if (deTai.getPhanCongPhanBien() != null) {
            throw new BadRequestException("Đề tài này đã có giảng viên phản biện");
        }

        PhanCongPhanBien phanCong = PhanCongPhanBien.builder()
                .deTai(deTai)
                .giangVien(giangVien)
                .build();

        phanCong = phanCongPhanBienRepository.save(phanCong);

        deTai.setTrangThai(TrangThaiDeTai.CHO_PHAN_BIEN);
        deTai.setPhanCongPhanBien(phanCong);
        deTaiRepository.save(deTai);

        return mapToPhanCongPhanBienResponse(phanCong);
    }

    @Transactional
    public HoiDongBaoVeResponse taoHoiDong(HoiDongRequest request) {
        DeTai deTai = deTaiRepository.findById(request.getDeTaiId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        LocalDate ngayBaoVe = null;
        if (request.getNgayBaoVe() != null && !request.getNgayBaoVe().isEmpty()) {
            try {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
                ngayBaoVe = LocalDate.parse(request.getNgayBaoVe(), formatter);
            } catch (Exception e) {
                throw new BadRequestException("Ngày bảo vệ không đúng định dạng: " + request.getNgayBaoVe());
            }
        }

        HoiDongBaoVe hoiDong = HoiDongBaoVe.builder()
                .deTai(deTai)
                .ngayBaoVe(ngayBaoVe)
                .diaDiem(request.getDiaDiem())
                .trangThai(TrangThaiHoiDong.CHO_BAO_VE)
                .build();

        hoiDong = hoiDongBaoVeRepository.save(hoiDong);

        // Thêm thành viên hội đồng
        for (ThanhVienRequest tvRequest : request.getThanhViens()) {
            GiangVien gv = giangVienRepository.findById(tvRequest.getGiangVienId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

            ThanhVienHoiDong thanhVien = ThanhVienHoiDong.builder()
                    .hoiDong(hoiDong)
                    .giangVien(gv)
                    .vaiTro(tvRequest.getVaiTro())
                    .build();
            thanhVienHoiDongRepository.save(thanhVien);
        }

        deTai.setTrangThai(TrangThaiDeTai.DANG_BAO_VE);
        deTai.setHoiDongBaoVe(hoiDong);
        deTaiRepository.save(deTai);

        return mapToHoiDongBaoVeResponse(hoiDong);
    }

    // Mappers
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
                   .tenDotDangKy(dt.getDotDangKy().getTenDot())
                   .namHoc(dt.getDotDangKy().getNamHoc());
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

        if (dt.getPhanCongHuongDan() != null && dt.getPhanCongHuongDan().getGiangVien() != null) {
            builder.giangVienHuongDanId(dt.getPhanCongHuongDan().getGiangVien().getId())
                   .hoTenGiangVienHuongDan(dt.getPhanCongHuongDan().getGiangVien().getHoTen());
        }

        if (dt.getPhanCongPhanBien() != null && dt.getPhanCongPhanBien().getGiangVien() != null) {
            builder.giangVienPhanBienId(dt.getPhanCongPhanBien().getGiangVien().getId())
                   .hoTenGiangVienPhanBien(dt.getPhanCongPhanBien().getGiangVien().getHoTen());
        }

        if (dt.getGiangVienDuKien() != null) {
            builder.giangVienDuKienId(dt.getGiangVienDuKien().getId())
                   .hoTenGiangVienDuKien(dt.getGiangVienDuKien().getHoTen());
        }

        if (dt.getDiemHuongDan() != null) builder.diemHuongDan(dt.getDiemHuongDan().getDiem());
        if (dt.getDiemPhanBien() != null) builder.diemPhanBien(dt.getDiemPhanBien().getDiem());

        if (dt.getHoiDongBaoVe() != null) {
            HoiDongBaoVe hd = dt.getHoiDongBaoVe();
            if (hd.getThanhViens() != null && !hd.getThanhViens().isEmpty()) {
                String allTen = hd.getThanhViens().stream()
                        .map(tv -> tv.getGiangVien().getHoTen())
                        .collect(Collectors.joining(", "));
                builder.hoTenGiangVienHoiDong(allTen);

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

            BigDecimal sumDiemHoiDong = diemBaoVeRepository.calculateSumDiemByHoiDongId(hd.getId());
            if (sumDiemHoiDong != null && sumDiemHoiDong.compareTo(BigDecimal.ZERO) > 0) {
                builder.diemBaoVe(sumDiemHoiDong.setScale(1, RoundingMode.HALF_UP));
                builder.diemTongBaoVe(dt.getDiemTongBaoVe());
            }
        }

        // Thông tin báo cáo
        if (dt.getBaoCao() != null) {
            builder.coBaoCao(true)
                   .trangThaiBaoCao(dt.getBaoCao().getTrangThai().name())
                   .ngayNopBaoCao(dt.getBaoCao().getNgayNop());
        } else {
            builder.coBaoCao(false)
                   .trangThaiBaoCao("CHUA_NOP");
        }

        return builder.build();
    }

    private GiangVienResponse mapToGiangVienResponse(GiangVien gv) {
        // Đếm số đề tài đang hướng dẫn
        long soDeTaiDangHuongDan = 0;
        if (phanCongHuongDanRepository != null) {
            soDeTaiDangHuongDan = phanCongHuongDanRepository
                    .countDangThucHienByGiangVienId(gv.getId(), TrangThaiPhanCong.DUYET);
        }

        int soDeTaiToiDa = gv.getSoDeTaiToiDa() != null ? gv.getSoDeTaiToiDa() : 5;
        int soDeTaiConLai = (int) Math.max(0, soDeTaiToiDa - soDeTaiDangHuongDan);

        return GiangVienResponse.builder()
                .id(gv.getId())
                .hoTen(gv.getHoTen())
                .hocVi(gv.getHocVi())
                .email(gv.getTaiKhoan() != null ? gv.getTaiKhoan().getEmail() : null)
                .boMonId(gv.getBoMon() != null ? gv.getBoMon().getId() : null)
                .tenBoMon(gv.getBoMon() != null ? gv.getBoMon().getTenBoMon() : null)
                .laLanhDao(gv.getLaLanhDao())
                .soDeTaiToiDa(soDeTaiToiDa)
                .soDeTaiDangHuongDan((int) soDeTaiDangHuongDan)
                .soDeTaiConLai(soDeTaiConLai)
                .build();
    }

    private SinhVienResponse mapToSinhVienResponse(SinhVien sv) {
        SinhVienResponse.SinhVienResponseBuilder builder = SinhVienResponse.builder()
                .id(sv.getId())
                .hoTen(sv.getHoTen())
                .maSinhVien(sv.getMaSinhVien())
                .lop(sv.getLop())
                .email(sv.getTaiKhoan() != null ? sv.getTaiKhoan().getEmail() : null)
                .boMonId(sv.getBoMon() != null ? sv.getBoMon().getId() : null)
                .tenBoMon(sv.getBoMon() != null ? sv.getBoMon().getTenBoMon() : null);

        if (sv.getDeTais() != null && !sv.getDeTais().isEmpty()) {
            // Lấy đề tài mới nhất (id lớn nhất) — thứ tự List OneToMany không được đảm bảo
            DeTai deTai = sv.getDeTais().stream()
                    .max(Comparator.comparing(DeTai::getId))
                    .orElse(sv.getDeTais().get(0));
            builder.deTaiId(deTai.getId())
                   .deTaiTen(deTai.getTenDeTai())
                   .deTaiTrangThai(deTai.getTrangThai() != null ? deTai.getTrangThai().name() : null);
        }

        return builder.build();
    }

    private PhanCongHuongDanResponse mapToPhanCongHuongDanResponse(PhanCongHuongDan pc) {
        return PhanCongHuongDanResponse.builder()
                .id(pc.getId())
                .deTaiId(pc.getDeTai().getId())
                .tenDeTai(pc.getDeTai().getTenDeTai())
                .giangVienId(pc.getGiangVien().getId())
                .hoTenGiangVien(pc.getGiangVien().getHoTen())
                .trangThai(pc.getTrangThai())
                .ngayPhanCong(pc.getNgayPhanCong())
                .sinhVienId(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getId() : null)
                .hoTenSinhVien(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getHoTen() : null)
                .maSinhVien(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getMaSinhVien() : null)
                .lopSinhVien(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getLop() : null)
                .tenBoMon(pc.getDeTai().getSinhVien() != null && pc.getDeTai().getSinhVien().getBoMon() != null ? pc.getDeTai().getSinhVien().getBoMon().getTenBoMon() : null)
                .deTaiTrangThai(pc.getDeTai().getTrangThai() != null ? pc.getDeTai().getTrangThai().name() : null)
                .build();
    }

    private PhanCongPhanBienResponse mapToPhanCongPhanBienResponse(PhanCongPhanBien pc) {
        DeTai deTai = pc.getDeTai();
        SinhVien sinhVien = deTai.getSinhVien();
        return PhanCongPhanBienResponse.builder()
                .id(pc.getId())
                .deTaiId(deTai.getId())
                .tenDeTai(deTai.getTenDeTai())
                .hoTenSinhVien(sinhVien != null ? sinhVien.getHoTen() : null)
                .maSinhVien(sinhVien != null ? sinhVien.getMaSinhVien() : null)
                .lopSinhVien(sinhVien != null ? sinhVien.getLop() : null)
                .giangVienId(pc.getGiangVien().getId())
                .hoTenGiangVien(pc.getGiangVien().getHoTen())
                .deTaiTrangThai(deTai.getTrangThai() != null ? deTai.getTrangThai().name() : null)
                .build();
    }

    public List<HoiDongBaoVeResponse> getHoiDongByBoMon(Long boMonId, Long dotId) {
        List<DeTai> deTais = deTaiRepository.findAllByBoMonId(boMonId);
        
        // Lọc theo đợt đăng ký nếu có
        if (dotId != null) {
            deTais = deTais.stream()
                    .filter(dt -> dt.getDotDangKy() != null && dt.getDotDangKy().getId().equals(dotId))
                    .collect(Collectors.toList());
        }
        
        return deTais.stream()
                .filter(dt -> dt.getHoiDongBaoVe() != null)
                .map(dt -> {
                    HoiDongBaoVe hd = dt.getHoiDongBaoVe();
                    HoiDongBaoVeResponse response = mapToHoiDongBaoVeResponse(hd);
                    response.setSinhVien(dt.getSinhVien().getHoTen());
                    response.setMaSinhVien(dt.getSinhVien().getMaSinhVien());
                    response.setDeTai(dt.getTenDeTai());
                    return response;
                })
                .collect(Collectors.toList());
    }

    private HoiDongBaoVeResponse mapToHoiDongBaoVeResponse(HoiDongBaoVe hd) {
        List<ThanhVienResponse> thanhViens = hd.getThanhViens() != null ?
            hd.getThanhViens().stream().map(tv -> {
                ThanhVienResponse.ThanhVienResponseBuilder builder = ThanhVienResponse.builder()
                    .id(tv.getId())
                    .giangVienId(tv.getGiangVien().getId())
                    .hoTenGiangVien(tv.getGiangVien().getHoTen())
                    .hocVi(tv.getGiangVien().getHocVi())
                    .vaiTro(tv.getVaiTro());

                // Lấy điểm từ bảng DiemBaoVe
                diemBaoVeRepository.findByHoiDongIdAndGiangVienId(hd.getId(), tv.getGiangVien().getId())
                    .ifPresent(dbv -> {
                        builder.diem(dbv.getDiem());
                    });

                return builder.build();
            }).collect(Collectors.toList()) : new ArrayList<>();

        // Lấy thông tin sinh viên từ đề tài
        String hoTenSinhVien = null;
        String maSinhVien = null;
        Long sinhVienId = null;
        if (hd.getDeTai() != null && hd.getDeTai().getSinhVien() != null) {
            hoTenSinhVien = hd.getDeTai().getSinhVien().getHoTen();
            maSinhVien = hd.getDeTai().getSinhVien().getMaSinhVien();
            sinhVienId = hd.getDeTai().getSinhVien().getId();
        }

        // Tính điểm bảo vệ = tổng điểm 3 thành viên hội đồng (không chia)
        BigDecimal diemBV = diemBaoVeRepository.calculateSumDiemByHoiDongId(hd.getId());
        if (diemBV != null) {
            diemBV = diemBV.setScale(1, RoundingMode.HALF_UP);
        }

        return HoiDongBaoVeResponse.builder()
                .id(hd.getId())
                .deTaiId(hd.getDeTai().getId())
                .tenDeTai(hd.getDeTai().getTenDeTai())
                .sinhVienId(sinhVienId)
                .hoTenSinhVien(hoTenSinhVien)
                .maSinhVien(maSinhVien)
                .ngayBaoVe(hd.getNgayBaoVe())
                .diaDiem(hd.getDiaDiem())
                .trangThai(hd.getTrangThai())
                .trangThaiDeTai(hd.getDeTai().getTrangThai().name())
                .thanhViens(thanhViens)
                .diemBaoVe(diemBV)
                .nhanXetCham(hd.getNhanXetBaoVe())
                .build();
    }

    private BoMonResponse mapToBoMonResponse(BoMon boMon) {
        long soLuongDeTai = deTaiRepository.countByBoMonId(boMon.getId());
        
        return BoMonResponse.builder()
                .id(boMon.getId())
                .tenBoMon(boMon.getTenBoMon())
                .maBoMon(boMon.getMaBoMon())
                .khoaId(boMon.getKhoa() != null ? boMon.getKhoa().getId() : null)
                .tenKhoa(boMon.getKhoa() != null ? boMon.getKhoa().getTenKhoa() : null)
                .soLuongGiangVien(boMon.getGiangViens() != null ? boMon.getGiangViens().size() : 0)
                .soLuongSinhVien(boMon.getSinhViens() != null ? boMon.getSinhViens().size() : 0)
                .soLuongDeTai((int) soLuongDeTai)
                .build();
    }

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

@Transactional
    public HoiDongBaoVeResponse importDiemBaoVe(DiemBaoVeRequest request) {
        List<DiemBaoVeResponse> diemBaoVes = diemBaoVeService.importDiemBaoVe(request);

        HoiDongBaoVe hoiDong = hoiDongBaoVeRepository.findById(request.getHoiDongId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội đồng"));

        hoiDong.setNhanXetBaoVe(request.getNhanXet());
        hoiDong = hoiDongBaoVeRepository.save(hoiDong);

        java.math.BigDecimal sumDiemHoiDong = diemBaoVeRepository.calculateSumDiemByHoiDongId(hoiDong.getId());

        DeTai deTai = deTaiRepository.findById(hoiDong.getDeTai().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        if (sumDiemHoiDong != null && sumDiemHoiDong.compareTo(java.math.BigDecimal.ZERO) > 0) {
            int soLuongThanhVien = hoiDong.getThanhViens() != null ? hoiDong.getThanhViens().size() : 3;

            if (deTai.getDiemPhanBien() != null && deTai.getDiemPhanBien().getDiem() != null) {
                java.math.BigDecimal tongDiem = sumDiemHoiDong.add(deTai.getDiemPhanBien().getDiem());
                java.math.BigDecimal diemTongBaoVe = tongDiem.divide(java.math.BigDecimal.valueOf(soLuongThanhVien + 1), 2, RoundingMode.HALF_UP);
                diemTongBaoVe = diemTongBaoVe.setScale(1, RoundingMode.HALF_UP);
                deTai.setDiemTongBaoVe(diemTongBaoVe);

                if (diemTongBaoVe.compareTo(java.math.BigDecimal.valueOf(5)) >= 0) {
                    deTai.setTrangThai(TrangThaiDeTai.HOAN_THANH);
                } else {
                    deTai.setTrangThai(TrangThaiDeTai.KHONG_DAT_BAO_VE);
                }
            } else {
                deTai.setDiemTongBaoVe(sumDiemHoiDong.setScale(1, RoundingMode.HALF_UP));
            }
        }
        deTaiRepository.save(deTai);

        return mapToHoiDongBaoVeResponse(hoiDong);
    }

    public List<DiemBaoVeResponse> getDiemBaoVeByHoiDong(Long hoiDongId) {
        return diemBaoVeService.getDiemBaoVeByHoiDong(hoiDongId);
    }

    public List<DiemBaoVeResponse> getDiemBaoVeByDeTai(Long deTaiId) {
        DeTai deTai = deTaiRepository.findById(deTaiId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));
        if (deTai.getHoiDongBaoVe() == null) {
            return new java.util.ArrayList<>();
        }
        return diemBaoVeService.getDiemBaoVeByHoiDong(deTai.getHoiDongBaoVe().getId());
    }


    @Transactional
    public HoiDongBaoVeResponse updateDiemBaoVe(Long hoiDongId, DiemBaoVeRequest request) {
        HoiDongBaoVe hoiDong = hoiDongBaoVeRepository.findById(hoiDongId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội đồng"));

        // Cập nhật nhận xét
        hoiDong.setNhanXetBaoVe(request.getNhanXet());

        // Cập nhật điểm từng thành viên
        if (request.getDiemThanhViens() != null) {
            for (DiemBaoVeRequest.DiemThanhVien diemTV : request.getDiemThanhViens()) {
                diemBaoVeService.updateDiemByGiangVien(hoiDongId, diemTV.getGiangVienId(), diemTV.getDiem());
            }
        }

        // Kiểm tra đã chấm đủ điểm thì cập nhật trạng thái
        List<DiemBaoVe> diemBaoVes = diemBaoVeRepository.findByHoiDongId(hoiDongId);
        long countWithDiem = diemBaoVes.stream().filter(d -> d.getDiem() != null).count();

        if (countWithDiem > 0) {
            hoiDong.setTrangThai(TrangThaiHoiDong.DA_BAO_VE);

            java.math.BigDecimal sumDiemHoiDong = diemBaoVeRepository.calculateSumDiemByHoiDongId(hoiDongId);

            DeTai deTai = deTaiRepository.findById(hoiDong.getDeTai().getId())
                    .orElse(null);

            if (deTai != null && sumDiemHoiDong != null && sumDiemHoiDong.compareTo(java.math.BigDecimal.ZERO) > 0) {
                // Kiểm tra có điểm phản biện chưa
                if (deTai.getDiemPhanBien() != null && deTai.getDiemPhanBien().getDiem() != null) {
                    int soLuongThanhVien = hoiDong.getThanhViens() != null ? hoiDong.getThanhViens().size() : 3;
                    java.math.BigDecimal tongDiem = sumDiemHoiDong.add(deTai.getDiemPhanBien().getDiem());
                    java.math.BigDecimal diemTongBaoVe = tongDiem.divide(java.math.BigDecimal.valueOf(soLuongThanhVien + 1), 2, RoundingMode.HALF_UP);
                    diemTongBaoVe = diemTongBaoVe.setScale(1, RoundingMode.HALF_UP);

                    deTai.setDiemTongBaoVe(diemTongBaoVe);

                    if (diemTongBaoVe.compareTo(java.math.BigDecimal.valueOf(5)) >= 0) {
                        deTai.setTrangThai(TrangThaiDeTai.HOAN_THANH);
                    } else {
                        deTai.setTrangThai(TrangThaiDeTai.KHONG_DAT_BAO_VE);
                    }
                } else {
                    deTai.setDiemTongBaoVe(sumDiemHoiDong.setScale(1, RoundingMode.HALF_UP));
                }
                deTaiRepository.save(deTai);
            }
        }

        hoiDong = hoiDongBaoVeRepository.save(hoiDong);
        return mapToHoiDongBaoVeResponse(hoiDong);
    }

    public ThongKeDiemResponse getThongKeDiem(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findAllByBoMonId(boMonId);
        
        long tongDeTai = deTais.size();
        long deTaiCoDiemHD = 0;
        long deTaiCoDiemPB = 0;
        long deTaiCoDiemBV = 0;
        long deTaiHoanThanh = 0;
        
        double sumDiemHD = 0;
        double sumDiemPB = 0;
        double sumDiemBV = 0;
        
        double maxDiemHD = 0;
        double maxDiemPB = 0;
        double maxDiemBV = 0;
        
        double minDiemHD = 10;
        double minDiemPB = 10;
        double minDiemBV = 10;

        // Điểm tổng bảo vệ
        long deTaiCoDiemTongBV = 0;
        double sumDiemTongBV = 0;
        double maxDiemTongBV = 0;
        double minDiemTongBV = 10;

        for (DeTai dt : deTais) {
            // Điểm hướng dẫn
            if (dt.getDiemHuongDan() != null) {
                double diem = dt.getDiemHuongDan().getDiem().doubleValue();
                deTaiCoDiemHD++;
                sumDiemHD += diem;
                maxDiemHD = Math.max(maxDiemHD, diem);
                minDiemHD = Math.min(minDiemHD, diem);
            }
            
            // Điểm phản biện
            if (dt.getDiemPhanBien() != null) {
                double diem = dt.getDiemPhanBien().getDiem().doubleValue();
                deTaiCoDiemPB++;
                sumDiemPB += diem;
                maxDiemPB = Math.max(maxDiemPB, diem);
                minDiemPB = Math.min(minDiemPB, diem);
            }
            
            // Điểm bảo vệ
            if (dt.getHoiDongBaoVe() != null) {
                BigDecimal avgDiem = diemBaoVeRepository.calculateAverageDiemByHoiDongId(dt.getHoiDongBaoVe().getId());
                if (avgDiem != null && avgDiem.doubleValue() > 0) {
                    double diem = avgDiem.doubleValue();
                    deTaiCoDiemBV++;
                    sumDiemBV += diem;
                    maxDiemBV = Math.max(maxDiemBV, diem);
                    minDiemBV = Math.min(minDiemBV, diem);
                }
            }
            
            // Hoàn thành
            if (dt.getTrangThai() == TrangThaiDeTai.HOAN_THANH) {
                deTaiHoanThanh++;
            }

            // Điểm tổng bảo vệ
            if (dt.getDiemTongBaoVe() != null && dt.getDiemTongBaoVe().compareTo(BigDecimal.ZERO) > 0) {
                double diem = dt.getDiemTongBaoVe().doubleValue();
                deTaiCoDiemTongBV++;
                sumDiemTongBV += diem;
                maxDiemTongBV = Math.max(maxDiemTongBV, diem);
                minDiemTongBV = Math.min(minDiemTongBV, diem);
            }
        }

        return ThongKeDiemResponse.builder()
                .tongDeTai(tongDeTai)
                .deTaiCoDiemHuongDan(deTaiCoDiemHD)
                .deTaiCoDiemPhanBien(deTaiCoDiemPB)
                .deTaiCoDiemBaoVe(deTaiCoDiemBV)
                .deTaiHoanThanh(deTaiHoanThanh)
                .diemHuongDanTrungBinh(deTaiCoDiemHD > 0 ? Math.round(sumDiemHD / deTaiCoDiemHD * 100.0) / 100.0 : 0)
                .diemPhanBienTrungBinh(deTaiCoDiemPB > 0 ? Math.round(sumDiemPB / deTaiCoDiemPB * 100.0) / 100.0 : 0)
                .diemBaoVeTrungBinh(deTaiCoDiemBV > 0 ? Math.round(sumDiemBV / deTaiCoDiemBV * 100.0) / 100.0 : 0)
                .diemHuongDanCaoNhat(maxDiemHD)
                .diemPhanBienCaoNhat(maxDiemPB)
                .diemBaoVeCaoNhat(maxDiemBV)
                .diemHuongDanThapNhat(minDiemHD == 10 ? 0 : minDiemHD)
                .diemPhanBienThapNhat(minDiemPB == 10 ? 0 : minDiemPB)
                .diemBaoVeThapNhat(minDiemBV == 10 ? 0 : minDiemBV)
                .diemTongBaoVeTrungBinh(deTaiCoDiemTongBV > 0 ? Math.round(sumDiemTongBV / deTaiCoDiemTongBV * 100.0) / 100.0 : 0)
                .diemTongBaoVeCaoNhat(maxDiemTongBV)
                .diemTongBaoVeThapNhat(minDiemTongBV == 10 ? 0 : minDiemTongBV)
                .build();
    }

    public ThongKePhanCongResponse getThongKePhanCong(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findAllByBoMonId(boMonId);

        // Các trạng thái cần phân công HD (sau khi đề tài được duyệt bởi bộ môn)
        List<TrangThaiDeTai> canPhanCongHDStatuses = Arrays.asList(
                TrangThaiDeTai.CHO_GV_DUYET,
                TrangThaiDeTai.CHO_GV_PHAN_CONG,
                TrangThaiDeTai.CHO_BO_MON_PHAN_CONG,
                TrangThaiDeTai.GV_TU_CHOI
        );

        // Các trạng thái cần phân công PB (sau khi đã có GVHD được duyệt)
        List<TrangThaiDeTai> canPhanCongPBStatuses = Arrays.asList(
                TrangThaiDeTai.CHO_GV_PHAN_CONG,
                TrangThaiDeTai.CHO_BO_MON_PHAN_CONG,
                TrangThaiDeTai.CHO_PHAN_BIEN
        );

        int svDaPhanCongHuongDan = 0;
        int svDaPhanCongPhanBien = 0;
        int svChoLapHoiDong = 0;
        int svCanPhanCongHD = 0;
        int svCanPhanCongPB = 0;

        for (DeTai dt : deTais) {
            if (dt.getSinhVien() == null) continue;
            TrangThaiDeTai trangThai = dt.getTrangThai();

            // === Đếm đề tài CẦN phân công HD ===
            if (canPhanCongHDStatuses.contains(trangThai)) {
                if (dt.getPhanCongHuongDan() != null && dt.getPhanCongHuongDan().getGiangVien() != null) {
                    svDaPhanCongHuongDan++;
                } else {
                    svCanPhanCongHD++;
                }
            }

            // === Đếm đề tài CẦN phân công PB ===
            if (canPhanCongPBStatuses.contains(trangThai)) {
                if (dt.getPhanCongPhanBien() != null && dt.getPhanCongPhanBien().getGiangVien() != null) {
                    svDaPhanCongPhanBien++;
                } else {
                    svCanPhanCongPB++;
                }
            }

            // === Chờ lập hội đồng: đã đạt phản biện nhưng chưa có hội đồng ===
            if (trangThai == TrangThaiDeTai.DAT_PHAN_BIEN && dt.getHoiDongBaoVe() == null) {
                svChoLapHoiDong++;
            }
        }

        return ThongKePhanCongResponse.builder()
                .svDaPhanCongHuongDan(svDaPhanCongHuongDan)
                .svChuaPhanCongHuongDan(svCanPhanCongHD)
                .svDaPhanCongPhanBien(svDaPhanCongPhanBien)
                .svChuaPhanCongPhanBien(svCanPhanCongPB)
                .svChoLapHoiDong(svChoLapHoiDong)
                .build();
    }

    public List<QuanLyDiemResponse> getQuanLyDiem(Long boMonId, Long dotId) {
        List<DeTai> deTais = deTaiRepository.findAllByBoMonId(boMonId);

        // Lọc theo đợt đăng ký nếu có
        if (dotId != null) {
            deTais = deTais.stream()
                    .filter(dt -> dt.getDotDangKy() != null && dt.getDotDangKy().getId().equals(dotId))
                    .collect(Collectors.toList());
        }

        return deTais.stream()
                .filter(dt -> dt.getSinhVien() != null)
                .map(this::mapToQuanLyDiemResponse)
                .collect(Collectors.toList());
    }

    private QuanLyDiemResponse mapToQuanLyDiemResponse(DeTai dt) {
        SinhVien sv = dt.getSinhVien();

        BigDecimal diemHD = dt.getDiemHuongDan() != null ? dt.getDiemHuongDan().getDiem() : null;
        BigDecimal diemPB = dt.getDiemPhanBien() != null ? dt.getDiemPhanBien().getDiem() : null;

        List<QuanLyDiemResponse.ThanhVienHoiDongDiem> thanhVienDiemList = null;

        if (dt.getHoiDongBaoVe() != null) {
            HoiDongBaoVe hoiDong = dt.getHoiDongBaoVe();

            if (hoiDong.getThanhViens() != null && !hoiDong.getThanhViens().isEmpty()) {
                thanhVienDiemList = hoiDong.getThanhViens().stream()
                    .map(tv -> {
                        BigDecimal diem = null;
                        if (hoiDong.getDiemBaoVes() != null) {
                            diem = hoiDong.getDiemBaoVes().stream()
                                .filter(dbv -> dbv.getGiangVien().getId().equals(tv.getGiangVien().getId()))
                                .findFirst()
                                .map(DiemBaoVe::getDiem)
                                .orElse(null);
                        }
                        return QuanLyDiemResponse.ThanhVienHoiDongDiem.builder()
                            .hoTen(tv.getGiangVien().getHoTen())
                            .vaiTro(tv.getVaiTro() != null ? tv.getVaiTro().name() : null)
                            .diem(diem)
                            .build();
                    })
                    .collect(Collectors.toList());
            }
        }

        return QuanLyDiemResponse.builder()
                .sinhVienId(sv.getId())
                .hoTen(sv.getHoTen())
                .maSinhVien(sv.getMaSinhVien())
                .lop(sv.getLop())
                .tenBoMon(sv.getBoMon() != null ? sv.getBoMon().getTenBoMon() : null)
                .boMonId(sv.getBoMon() != null ? sv.getBoMon().getId() : null)
                .tenDeTai(dt.getTenDeTai())
                .deTaiId(dt.getId())
                .diemHuongDan(diemHD)
                .diemPhanBien(diemPB)
                .diemTongBaoVe(dt.getDiemTongBaoVe())
                .thanhVienHoiDongList(thanhVienDiemList)
                .build();
    }
}

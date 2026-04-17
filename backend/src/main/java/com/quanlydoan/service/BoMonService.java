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
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
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
    private final AuthService authService;
    private final DiemBaoVeService diemBaoVeService;

    public List<BoMonResponse> getAllBoMon() {
        return boMonRepository.findAll().stream().map(this::mapToBoMonResponse).collect(Collectors.toList());
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
                        .fileSourceCode(bc.getFileSourceCode())
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
                .fileSourceCode(bc.getFileSourceCode())
                .ngayNop(bc.getNgayNop())
                .trangThai(bc.getTrangThai());

        if (deTai.getSinhVien() != null) {
            builder.hoTenSinhVien(deTai.getSinhVien().getHoTen())
                   .maSinhVien(deTai.getSinhVien().getMaSinhVien());
        }

        return builder.build();
    }

    public List<DeTaiResponse> getDeTaiByBoMon(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findAllByBoMonId(boMonId);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiByTrangThai(Long boMonId, TrangThaiDeTai trangThai) {
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, trangThai);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiDuDieuKien(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, TrangThaiDeTai.DU_DIEU_KIEN);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiDangThucHien(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, TrangThaiDeTai.DANG_THUC_HIEN);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiDaGuiBoMon(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, TrangThaiDeTai.DA_GUI_BO_MON);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiChoBoMonDuyet(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, TrangThaiDeTai.CHO_BO_MON_DUYET);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    @Transactional
    public DeTaiResponse duyetDeTaiBoMon(Long id) {
        DeTai deTai = deTaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        if (deTai.getTrangThai() != TrangThaiDeTai.DA_GUI_BO_MON &&
            deTai.getTrangThai() != TrangThaiDeTai.CHO_BO_MON_DUYET) {
            throw new BadRequestException("Đề tài chưa được gửi từ Khoa hoặc đã được duyệt");
        }

        // Duyệt → Đưa vào danh sách đang thực hiện (chờ phân công GVHD)
        deTai.setTrangThai(TrangThaiDeTai.DANG_THUC_HIEN);
        deTai = deTaiRepository.save(deTai);

        return mapToDeTaiResponse(deTai);
    }

    @Transactional
    public DeTaiResponse tuChoiDeTaiBoMon(Long id, String ghiChu) {
        DeTai deTai = deTaiRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        if (deTai.getTrangThai() != TrangThaiDeTai.DA_GUI_BO_MON &&
            deTai.getTrangThai() != TrangThaiDeTai.CHO_BO_MON_DUYET) {
            throw new BadRequestException("Đề tài chưa được gửi từ Khoa hoặc đã được duyệt");
        }

        // Reset về trạng thái bị từ chối để sinh viên đăng ký lại
        deTai.setTrangThai(TrangThaiDeTai.BI_TU_CHOI);
        deTai.setGhiChu(ghiChu != null ? ghiChu.trim() : "");
        deTai = deTaiRepository.save(deTai);

        return mapToDeTaiResponse(deTai);
    }

    public List<DeTaiResponse> getDeTaiDatGVHD(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, TrangThaiDeTai.DAT_GVHD);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiDatPhanBien(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, TrangThaiDeTai.DAT_PHAN_BIEN);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiHoanThanh(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, TrangThaiDeTai.HOAN_THANH);
        return deTais.stream().map(this::mapToDeTaiResponse).collect(Collectors.toList());
    }

    public List<DeTaiResponse> getDeTaiKhongDat(Long boMonId, String loai) {
        List<TrangThaiDeTai> trangThais = new ArrayList<>();
        if ("HUONG_DAN".equals(loai)) {
            trangThais.add(TrangThaiDeTai.KHONG_DAT_GVHD);
        } else if ("PHAN_BIEN".equals(loai)) {
            trangThais.add(TrangThaiDeTai.KHONG_DAT_PHAN_BIEN);
        } else {
            trangThais.add(TrangThaiDeTai.KHONG_DAT_BAO_VE);
        }
        List<DeTai> deTais = deTaiRepository.findByBoMonIdAndTrangThaiIn(boMonId, trangThais);
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
    public PhanCongHuongDanResponse phanCongHuongDan(PhanCongHuongDanRequest request) {
        DeTai deTai = deTaiRepository.findById(request.getDeTaiId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));
        GiangVien giangVien = giangVienRepository.findById(request.getGiangVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        // Kiểm tra nếu đã có phân công thì cập nhật lại, không tạo mới
        PhanCongHuongDan phanCong = deTai.getPhanCongHuongDan();
        if (phanCong == null) {
            phanCong = PhanCongHuongDan.builder()
                    .deTai(deTai)
                    .giangVien(giangVien)
                    .trangThai(TrangThaiPhanCong.CHO_DUYET)
                    .ngayPhanCong(LocalDateTime.now())
                    .build();
            phanCong = phanCongHuongDanRepository.save(phanCong);
        } else {
            // Cập nhật giảng viên mới
            phanCong.setGiangVien(giangVien);
            phanCong.setTrangThai(TrangThaiPhanCong.CHO_DUYET);
            phanCong.setNgayPhanCong(LocalDateTime.now());
            phanCong = phanCongHuongDanRepository.save(phanCong);
        }

        // Cập nhật trạng thái đề tài
        deTai.setTrangThai(TrangThaiDeTai.CHO_GV_DUYET);
        deTai.setPhanCongHuongDan(phanCong);
        deTaiRepository.save(deTai);

        return mapToPhanCongHuongDanResponse(phanCong);
    }

    public List<PhanCongHuongDanResponse> getDeTaiChoGVDuyet(Long boMonId) {
        List<PhanCongHuongDanResponse> responses = new ArrayList<>();

        // Lấy các đề tài trong bộ môn chờ GV duyệt (bao gồm cả bị từ chối cần phân công lại)
        List<DeTai> deTais = deTaiRepository.findAll().stream()
                .filter(dt -> dt.getSinhVien() != null &&
                             dt.getSinhVien().getBoMon() != null &&
                             dt.getSinhVien().getBoMon().getId().equals(boMonId) &&
                             (dt.getTrangThai() == TrangThaiDeTai.CHO_GV_DUYET ||
                              dt.getTrangThai() == TrangThaiDeTai.CHO_GV_DUYET_LAI))
                .collect(Collectors.toList());

        for (DeTai dt : deTais) {
            PhanCongHuongDanResponse.PhanCongHuongDanResponseBuilder builder = PhanCongHuongDanResponse.builder()
                    .id(dt.getId())
                    .deTaiId(dt.getId())
                    .tenDeTai(dt.getTenDeTai())
                    .noiDungDuKien(dt.getNoiDungDuKien())
                    .congNgheSuDung(dt.getCongNgheSuDung())
                    .trangThai(dt.getTrangThai() == TrangThaiDeTai.CHO_GV_DUYET_LAI 
                               ? TrangThaiPhanCong.TU_CHOI 
                               : TrangThaiPhanCong.CHO_DUYET)
                    .sinhVienId(dt.getSinhVien().getId())
                    .hoTenSinhVien(dt.getSinhVien().getHoTen())
                    .maSinhVien(dt.getSinhVien().getMaSinhVien())
                    .lopSinhVien(dt.getSinhVien().getLop())
                    .tenBoMon(dt.getSinhVien().getBoMon().getTenBoMon());

            // Nếu có giangVienDuKien (trường hợp CHO_GV_DUYET), lấy thông tin GV
            if (dt.getGiangVienDuKien() != null) {
                builder.giangVienId(dt.getGiangVienDuKien().getId())
                       .hoTenGiangVien(dt.getGiangVienDuKien().getHoTen());
            }

            responses.add(builder.build());
        }

        return responses;
    }

    @Transactional
    public PhanCongPhanBienResponse phanCongPhanBien(PhanCongPhanBienRequest request) {
        DeTai deTai = deTaiRepository.findById(request.getDeTaiId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));
        GiangVien giangVien = giangVienRepository.findById(request.getGiangVienId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        PhanCongPhanBien phanCong = PhanCongPhanBien.builder()
                .deTai(deTai)
                .giangVien(giangVien)
                .build();

        phanCong = phanCongPhanBienRepository.save(phanCong);

        // Cập nhật trạng thái đề tài
        deTai.setTrangThai(TrangThaiDeTai.CHO_PHAN_BIEN);
        deTai.setPhanCongPhanBien(phanCong);
        deTaiRepository.save(deTai);

        return mapToPhanCongPhanBienResponse(phanCong);
    }

    @Transactional
    public HoiDongBaoVeResponse taoHoiDong(HoiDongRequest request) {
        DeTai deTai = deTaiRepository.findById(request.getDeTaiId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        // Parse ngày bảo vệ với format cụ thể
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

        // Cập nhật trạng thái đề tài
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
                // Ghép tên tất cả thành viên
                String allTen = hd.getThanhViens().stream()
                        .map(tv -> tv.getGiangVien().getHoTen())
                        .collect(Collectors.joining(", "));
                builder.hoTenGiangVienHoiDong(allTen);

                // Danh sách chi tiết từng thành viên + điểm
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
            BigDecimal avgDiemBV = diemBaoVeRepository.calculateAverageDiemByHoiDongId(hd.getId());
            if (avgDiemBV != null) {
                avgDiemBV = avgDiemBV.setScale(2, RoundingMode.HALF_UP);
            }
            builder.diemBaoVe(avgDiemBV);
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
                .build();
    }

    private PhanCongPhanBienResponse mapToPhanCongPhanBienResponse(PhanCongPhanBien pc) {
        return PhanCongPhanBienResponse.builder()
                .id(pc.getId())
                .deTaiId(pc.getDeTai().getId())
                .tenDeTai(pc.getDeTai().getTenDeTai())
                .giangVienId(pc.getGiangVien().getId())
                .hoTenGiangVien(pc.getGiangVien().getHoTen())
                .build();
    }

    public List<HoiDongBaoVeResponse> getHoiDongByBoMon(Long boMonId) {
        List<DeTai> deTais = deTaiRepository.findAllByBoMonId(boMonId);
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

        BigDecimal avgDiem = diemBaoVeRepository.calculateAverageDiemByHoiDongId(hd.getId());
        if (avgDiem != null) {
            avgDiem = avgDiem.setScale(2, RoundingMode.HALF_UP);
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
                .diemBaoVe(avgDiem)
                .nhanXetCham(hd.getNhanXetBaoVe())
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

@Transactional
    public HoiDongBaoVeResponse importDiemBaoVe(DiemBaoVeRequest request) {
        // Sử dụng DiemBaoVeService để lưu điểm của từng giảng viên
        List<DiemBaoVeResponse> diemBaoVes = diemBaoVeService.importDiemBaoVe(request);

        // Lấy hội đồng đã cập nhật
        HoiDongBaoVe hoiDong = hoiDongBaoVeRepository.findById(request.getHoiDongId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội đồng"));

        // Cập nhật nhận xét vào hội đồng
        hoiDong.setNhanXetBaoVe(request.getNhanXet());
        hoiDong = hoiDongBaoVeRepository.save(hoiDong);

        // Tính điểm trung bình của hội đồng
        java.math.BigDecimal avgDiem = diemBaoVeRepository.calculateAverageDiemByHoiDongId(hoiDong.getId());

        // Cập nhật trạng thái đề tài dựa trên điểm trung bình
        DeTai deTai = hoiDong.getDeTai();
        if (avgDiem != null && avgDiem.compareTo(java.math.BigDecimal.valueOf(5)) >= 0) {
            deTai.setTrangThai(TrangThaiDeTai.HOAN_THANH);
        } else {
            deTai.setTrangThai(TrangThaiDeTai.KHONG_DAT_BAO_VE);
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

            // Tính điểm trung bình của hội đồng
            java.math.BigDecimal avgDiem = diemBaoVeRepository.calculateAverageDiemByHoiDongId(hoiDongId);

            // Cập nhật trạng thái đề tài dựa trên điểm trung bình
            if (hoiDong.getDeTai() != null) {
                if (avgDiem != null && avgDiem.compareTo(java.math.BigDecimal.valueOf(5)) >= 0) {
                    hoiDong.getDeTai().setTrangThai(TrangThaiDeTai.HOAN_THANH);
                } else {
                    hoiDong.getDeTai().setTrangThai(TrangThaiDeTai.KHONG_DAT_BAO_VE);
                }
                deTaiRepository.save(hoiDong.getDeTai());
            }
        }

        hoiDong = hoiDongBaoVeRepository.save(hoiDong);
        return mapToHoiDongBaoVeResponse(hoiDong);
    }
}

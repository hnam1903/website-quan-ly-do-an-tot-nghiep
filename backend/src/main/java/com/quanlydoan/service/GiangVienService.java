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
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GiangVienService {

    @PersistenceContext
    private EntityManager entityManager;

    private final GiangVienRepository giangVienRepository;
    private final DeTaiRepository deTaiRepository;
    private final PhanCongHuongDanRepository phanCongHuongDanRepository;
    private final DiemHuongDanRepository diemHuongDanRepository;
    private final DiemPhanBienRepository diemPhanBienRepository;
    private final HoiDongBaoVeRepository hoiDongBaoVeRepository;
    private final ThanhVienHoiDongRepository thanhVienHoiDongRepository;
    private final BaoCaoRepository baoCaoRepository;
    private final DiemBaoVeRepository diemBaoVeRepository;
    private final DotBaoCaoTienDoRepository dotBaoCaoTienDoRepository;
    private final BaoCaoTienDoRepository baoCaoTienDoRepository;
    private final DotDangKyRepository dotDangKyRepository;

    public List<PhanCongHuongDanResponse> getDeTaiHuongDan(Long giangVienId, Long dotId) {
        List<PhanCongHuongDanResponse> responses = new ArrayList<>();

        // Lấy các phân công có trạng thái DUYET của GV này
        List<PhanCongHuongDan> phanCongs = phanCongHuongDanRepository.findAll().stream()
                .filter(pc -> pc.getGiangVien() != null &&
                             pc.getGiangVien().getId().equals(giangVienId) &&
                             pc.getTrangThai() == TrangThaiPhanCong.DUYET)
                .collect(Collectors.toList());

        if (dotId != null) {
            phanCongs = phanCongs.stream()
                    .filter(pc -> pc.getDeTai().getDotDangKy() != null &&
                                 pc.getDeTai().getDotDangKy().getId().equals(dotId))
                    .collect(Collectors.toList());
        }

        for (PhanCongHuongDan pc : phanCongs) {
            responses.add(mapToPhanCongHuongDanResponse(pc, giangVienId));
        }

        return responses;
    }

    public List<PhanCongHuongDanResponse> getDeTaiChoDuyet(Long giangVienId) {
        List<PhanCongHuongDanResponse> responses = new ArrayList<>();

        List<PhanCongHuongDan> phanCons = phanCongHuongDanRepository.findAll().stream()
                .filter(pc -> pc.getGiangVien() != null &&
                             pc.getGiangVien().getId().equals(giangVienId) &&
                             pc.getTrangThai() == TrangThaiPhanCong.CHO_DUYET)
                .collect(Collectors.toList());

        for (PhanCongHuongDan pc : phanCons) {
            DeTai dt = pc.getDeTai();
            PhanCongHuongDanResponse response = PhanCongHuongDanResponse.builder()
                    .id(pc.getId())
                    .deTaiId(dt.getId())
                    .tenDeTai(dt.getTenDeTai())
                    .noiDungDuKien(dt.getNoiDungDuKien())
                    .congNgheSuDung(dt.getCongNgheSuDung())
                    .giangVienId(pc.getGiangVien().getId())
                    .hoTenGiangVien(pc.getGiangVien().getHoTen())
                    .trangThai(pc.getTrangThai())
                    .deTaiTrangThai(dt.getTrangThai() != null ? dt.getTrangThai().name() : null)
                    .sinhVienId(dt.getSinhVien() != null ? dt.getSinhVien().getId() : null)
                    .hoTenSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getHoTen() : null)
                    .maSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getMaSinhVien() : null)
                    .lopSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getLop() : null)
                    .tenBoMon(dt.getSinhVien() != null && dt.getSinhVien().getBoMon() != null ? dt.getSinhVien().getBoMon().getTenBoMon() : null)
                    .dotDangKyId(dt.getDotDangKy() != null ? dt.getDotDangKy().getId() : null)
                    .tenDotDangKy(dt.getDotDangKy() != null ? dt.getDotDangKy().getTenDot() : null)
                    .namHoc(dt.getDotDangKy() != null ? dt.getDotDangKy().getNamHoc() : null)
                    .build();
            responses.add(response);
        }

        return responses;
    }

    @Transactional
    public PhanCongHuongDanResponse duyetSinhVienHuongDan(Long phanCongId, boolean duyet) {
        PhanCongHuongDan phanCong = phanCongHuongDanRepository.findById(phanCongId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phân công hướng dẫn"));

        DeTai deTai = deTaiRepository.findById(phanCong.getDeTai().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        if (duyet) {
            phanCong.setTrangThai(TrangThaiPhanCong.DUYET);
            phanCong.setNgayPhanCong(LocalDateTime.now());
            deTai.setTrangThai(TrangThaiDeTai.CHO_BO_MON_PHAN_CONG);
            deTaiRepository.save(deTai);
            phanCongHuongDanRepository.save(phanCong);
            return mapToPhanCongHuongDanResponse(phanCong, phanCong.getGiangVien().getId());
        } else {
            deTai.setTrangThai(TrangThaiDeTai.GV_TU_CHOI);
            deTai.setPhanCongHuongDan(null);
            deTaiRepository.save(deTai);

            phanCongHuongDanRepository.deleteById(phanCong.getId());
            return null;
        }
    }

    @Transactional
    public DiemHuongDanResponse chamDiemHuongDan(DiemHuongDanRequest request) {
        DeTai deTai = deTaiRepository.findById(request.getDeTaiId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        DiemHuongDan diem = diemHuongDanRepository.findByDeTaiId(deTai.getId())
                .orElse(DiemHuongDan.builder().deTai(deTai).build());

        diem.setDiem(request.getDiem().setScale(1, RoundingMode.HALF_UP));
        diem.setNhanXet(request.getNhanXet());
        diem.setNgayCham(LocalDateTime.now());

        if (request.getDiem().compareTo(BigDecimal.valueOf(5)) >= 0) {
            diem.setTrangThai(TrangThaiDiem.DU_DIEU_KIEN);
            deTai.setTrangThai(TrangThaiDeTai.DAT_GVHD);
        } else {
            diem.setTrangThai(TrangThaiDiem.KHONG_DU_DIEU_KIEN);
            deTai.setTrangThai(TrangThaiDeTai.KHONG_DAT_GVHD);
        }

        diem = diemHuongDanRepository.save(diem);
        deTaiRepository.save(deTai);

        return mapToDiemHuongDanResponse(diem);
    }

    public List<DeTaiResponse> getDeTaiPhanBien(Long giangVienId, Long dotId) {
        List<DeTai> deTais = deTaiRepository.findAll().stream()
                .filter(dt -> dt.getPhanCongPhanBien() != null && 
                             dt.getPhanCongPhanBien().getGiangVien().getId().equals(giangVienId))
                .collect(Collectors.toList());

        if (dotId != null) {
            deTais = deTais.stream()
                    .filter(dt -> dt.getDotDangKy() != null && dt.getDotDangKy().getId().equals(dotId))
                    .collect(Collectors.toList());
        }

        return deTais.stream().map(dt -> mapToDeTaiResponseForPhanBien(dt, giangVienId)).collect(Collectors.toList());
    }

    @Transactional
    public DiemPhanBienResponse chamDiemPhanBien(DiemPhanBienRequest request) {
        DeTai deTai = deTaiRepository.findById(request.getDeTaiId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        DiemPhanBien diem = diemPhanBienRepository.findByDeTaiId(deTai.getId())
                .orElse(DiemPhanBien.builder().deTai(deTai).build());

        diem.setDiem(request.getDiem().setScale(1, RoundingMode.HALF_UP));
        diem.setNhanXet(request.getNhanXet());
        diem.setNgayCham(LocalDateTime.now());

        if (request.getDiem().compareTo(BigDecimal.valueOf(5)) >= 0) {
            diem.setTrangThai(TrangThaiDiem.DU_DIEU_KIEN);
            deTai.setTrangThai(TrangThaiDeTai.DAT_PHAN_BIEN);

            if (deTai.getHoiDongBaoVe() != null) {
                java.math.BigDecimal sumDiemHoiDong = diemBaoVeRepository.calculateSumDiemByHoiDongId(deTai.getHoiDongBaoVe().getId());
                if (sumDiemHoiDong != null && sumDiemHoiDong.compareTo(java.math.BigDecimal.ZERO) > 0) {
                    int soLuongTV = deTai.getHoiDongBaoVe().getThanhViens() != null
                            ? deTai.getHoiDongBaoVe().getThanhViens().size() : 3;
                    java.math.BigDecimal tongDiem = sumDiemHoiDong.add(request.getDiem());
                    java.math.BigDecimal diemTongBaoVe = tongDiem.divide(
                            java.math.BigDecimal.valueOf(soLuongTV + 1), 2, RoundingMode.HALF_UP);
                    diemTongBaoVe = diemTongBaoVe.setScale(1, RoundingMode.HALF_UP);
                    deTai.setDiemTongBaoVe(diemTongBaoVe);
                }
            }
        } else {
            diem.setTrangThai(TrangThaiDiem.KHONG_DU_DIEU_KIEN);
            deTai.setTrangThai(TrangThaiDeTai.KHONG_DAT_PHAN_BIEN);
            deTai.setDiemTongBaoVe(null);
        }

        diem = diemPhanBienRepository.save(diem);
        deTaiRepository.save(deTai);

        return mapToDiemPhanBienResponse(diem);
    }

    public List<HoiDongBaoVeResponse> getHoiDongBaoVe(Long giangVienId, Long dotId) {
        List<HoiDongBaoVe> hoiDongs = hoiDongBaoVeRepository.findAllByGiangVienId(giangVienId);

        // Lọc theo đợt nếu có
        if (dotId != null) {
            hoiDongs = hoiDongs.stream()
                    .filter(hd -> hd.getDeTai().getDotDangKy() != null &&
                                 hd.getDeTai().getDotDangKy().getId().equals(dotId))
                    .collect(Collectors.toList());
        }

        return hoiDongs.stream().map(hd -> mapToHoiDongBaoVeResponseSimple(hd)).collect(Collectors.toList());
    }

    private HoiDongBaoVeResponse mapToHoiDongBaoVeResponseSimple(HoiDongBaoVe hd) {
        List<ThanhVienResponse> thanhViens = hd.getThanhViens() != null ?
            hd.getThanhViens().stream().map(tv -> ThanhVienResponse.builder()
                .id(tv.getId())
                .giangVienId(tv.getGiangVien().getId())
                .hoTenGiangVien(tv.getGiangVien().getHoTen())
                .hocVi(tv.getGiangVien().getHocVi())
                .vaiTro(tv.getVaiTro())
                .build()
            ).collect(Collectors.toList()) : new ArrayList<>();

        DeTai deTai = hd.getDeTai();
        SinhVien sv = deTai.getSinhVien();

        BigDecimal avgDiem = diemBaoVeRepository.calculateAverageDiemByHoiDongId(hd.getId());
        if (avgDiem != null) {
            avgDiem = avgDiem.setScale(2, java.math.RoundingMode.HALF_UP);
        }

        return HoiDongBaoVeResponse.builder()
                .id(hd.getId())
                .deTaiId(deTai.getId())
                .tenDeTai(deTai.getTenDeTai())
                .sinhVienId(sv != null ? sv.getId() : null)
                .hoTenSinhVien(sv != null ? sv.getHoTen() : null)
                .maSinhVien(sv != null ? sv.getMaSinhVien() : null)
                .lopSinhVien(sv != null ? sv.getLop() : null)
                .ngayBaoVe(hd.getNgayBaoVe())
                .diaDiem(hd.getDiaDiem())
                .trangThai(hd.getTrangThai())
                .trangThaiDeTai(deTai.getTrangThai() != null ? deTai.getTrangThai().name() : null)
                .thanhViens(thanhViens)
                .diemBaoVe(avgDiem)
                .nhanXetCham(hd.getNhanXetBaoVe())
                .dotDangKyId(deTai.getDotDangKy() != null ? deTai.getDotDangKy().getId() : null)
                .build();
    }

    private PhanCongHuongDanResponse mapToPhanCongHuongDanResponse(PhanCongHuongDan pc, Long giangVienId) {
        DiemHuongDan diemHD = diemHuongDanRepository.findByDeTaiId(pc.getDeTai().getId()).orElse(null);
        return PhanCongHuongDanResponse.builder()
                .id(pc.getId())
                .deTaiId(pc.getDeTai().getId())
                .tenDeTai(pc.getDeTai().getTenDeTai())
                .noiDungDuKien(pc.getDeTai().getNoiDungDuKien())
                .congNgheSuDung(pc.getDeTai().getCongNgheSuDung())
                .giangVienId(pc.getGiangVien().getId())
                .hoTenGiangVien(pc.getGiangVien().getHoTen())
                .trangThai(pc.getTrangThai())
                .deTaiTrangThai(pc.getDeTai().getTrangThai() != null ? pc.getDeTai().getTrangThai().name() : null)
                .ngayPhanCong(pc.getNgayPhanCong())
                .sinhVienId(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getId() : null)
                .hoTenSinhVien(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getHoTen() : null)
                .maSinhVien(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getMaSinhVien() : null)
                .lopSinhVien(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getLop() : null)
                .tenBoMon(pc.getDeTai().getSinhVien() != null && pc.getDeTai().getSinhVien().getBoMon() != null ? pc.getDeTai().getSinhVien().getBoMon().getTenBoMon() : null)
                .dotDangKyId(pc.getDeTai().getDotDangKy() != null ? pc.getDeTai().getDotDangKy().getId() : null)
                .tenDotDangKy(pc.getDeTai().getDotDangKy() != null ? pc.getDeTai().getDotDangKy().getTenDot() : null)
                .namHoc(pc.getDeTai().getDotDangKy() != null ? pc.getDeTai().getDotDangKy().getNamHoc() : null)
                .daChamDiem(diemHD != null && diemHD.getDiem() != null)
                .diemCham(diemHD != null ? diemHD.getDiem() : null)
                .nhanXetCham(diemHD != null ? diemHD.getNhanXet() : null)
                .build();
    }

    private DeTaiResponse mapToDeTaiResponse(DeTai dt) {
        return DeTaiResponse.builder()
                .id(dt.getId())
                .tenDeTai(dt.getTenDeTai())
                .noiDungDuKien(dt.getNoiDungDuKien())
                .congNgheSuDung(dt.getCongNgheSuDung())
                .trangThai(dt.getTrangThai())
                .sinhVienId(dt.getSinhVien() != null ? dt.getSinhVien().getId() : null)
                .hoTenSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getHoTen() : null)
                .maSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getMaSinhVien() : null)
                .build();
    }

    private DeTaiResponse mapToDeTaiResponseForPhanBien(DeTai dt, Long giangVienId) {
        DiemPhanBien diemPB = diemPhanBienRepository.findByDeTaiId(dt.getId()).orElse(null);
        Boolean daChamPB = diemPB != null && diemPB.getDiem() != null;
        return DeTaiResponse.builder()
                .id(dt.getId())
                .tenDeTai(dt.getTenDeTai())
                .trangThai(dt.getTrangThai())
                .sinhVienId(dt.getSinhVien() != null ? dt.getSinhVien().getId() : null)
                .hoTenSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getHoTen() : null)
                .maSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getMaSinhVien() : null)
                .lopSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getLop() : null)
                .tenBoMon(dt.getPhanCongHuongDan() != null && dt.getPhanCongHuongDan().getGiangVien() != null ?
                          dt.getPhanCongHuongDan().getGiangVien().getBoMon() != null ?
                          dt.getPhanCongHuongDan().getGiangVien().getBoMon().getTenBoMon() : null : null)
                .giangVienHuongDanId(dt.getPhanCongHuongDan() != null ? dt.getPhanCongHuongDan().getGiangVien().getId() : null)
                .hoTenGiangVienHuongDan(dt.getPhanCongHuongDan() != null ? dt.getPhanCongHuongDan().getGiangVien().getHoTen() : null)
                .daChamDiemPB(daChamPB)
                .diemPhanBien(diemPB != null ? diemPB.getDiem() : null)
                .nhanXetPhanBien(diemPB != null ? diemPB.getNhanXet() : null)
                .dotDangKyId(dt.getDotDangKy() != null ? dt.getDotDangKy().getId() : null)
                .tenDotDangKy(dt.getDotDangKy() != null ? dt.getDotDangKy().getTenDot() : null)
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

    // Lấy báo cáo của sinh viên mà GV đang hướng dẫn
    public List<BaoCaoResponse> getBaoCaoCuaSinhVien(Long giangVienId, Long dotId) {
        List<BaoCaoResponse> responses = new ArrayList<>();

        // Lấy các đề tài GV đang hướng dẫn
        List<PhanCongHuongDan> phanCongs = phanCongHuongDanRepository.findByGiangVienId(giangVienId);

        for (PhanCongHuongDan pc : phanCongs) {
            if (pc.getTrangThai() == TrangThaiPhanCong.DUYET) {
                DeTai deTai = pc.getDeTai();

                // Lọc theo đợt nếu có
                if (dotId != null) {
                    if (deTai.getDotDangKy() == null || !deTai.getDotDangKy().getId().equals(dotId)) {
                        continue;
                    }
                }

                if (deTai.getBaoCao() != null) {
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

                    responses.add(builder.build());
                }
            }
        }

        return responses;
    }

    // Lấy báo cáo theo deTaiId (để xem chi tiết)
    public BaoCaoResponse getBaoCaoByDeTaiId(Long deTaiId, Long giangVienId) {
        DeTai deTai = deTaiRepository.findById(deTaiId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));
        
        // Kiểm tra GV có phải là người hướng dẫn
        if (deTai.getPhanCongHuongDan() == null || 
            deTai.getPhanCongHuongDan().getGiangVien() == null ||
            !deTai.getPhanCongHuongDan().getGiangVien().getId().equals(giangVienId)) {
            throw new BadRequestException("Bạn không phải giảng viên hướng dẫn đề tài này");
        }
        
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

    // ==================== BÁO CÁO TIẾN ĐỘ ====================

    // Tạo đợt báo cáo tiến độ
    @Transactional
    public DotBaoCaoTienDoResponse taoDotBaoCaoTienDo(DotBaoCaoTienDoRequest request, Long giangVienId) {
        GiangVien giangVien = giangVienRepository.findById(giangVienId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        // Kiểm tra ngày hợp lệ
        if (request.getNgayKetThuc().isBefore(request.getNgayBatDau())) {
            throw new BadRequestException("Ngày kết thúc phải sau ngày bắt đầu");
        }

        // Tìm đợt đăng ký nếu có
        DotDangKy dotDangKy = null;
        if (request.getDotDangKyId() != null) {
            dotDangKy = dotDangKyRepository.findById(request.getDotDangKyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt đăng ký"));
        }

        DotBaoCaoTienDo dot = DotBaoCaoTienDo.builder()
                .giangVien(giangVien)
                .tenDot(request.getTenDot())
                .ngayBatDau(request.getNgayBatDau())
                .ngayKetThuc(request.getNgayKetThuc())
                .trangThai(TrangThaiDotBaoCao.MO)
                .dotDangKy(dotDangKy)
                .build();

        dot = dotBaoCaoTienDoRepository.save(dot);
        return mapToDotBaoCaoTienDoResponse(dot);
    }

    // Lấy danh sách đợt báo cáo tiến độ của GV
    public List<DotBaoCaoTienDoResponse> getDotBaoCaoTienDo(Long giangVienId) {
        List<DotBaoCaoTienDo> dots = dotBaoCaoTienDoRepository.findAllByGiangVien(giangVienId);
        return dots.stream().map(this::mapToDotBaoCaoTienDoResponse).collect(Collectors.toList());
    }

    // Cập nhật đợt báo cáo tiến độ (đóng/mở)
    @Transactional
    public DotBaoCaoTienDoResponse capNhatTrangThaiDot(Long dotId, TrangThaiDotBaoCao trangThai) {
        DotBaoCaoTienDo dot = dotBaoCaoTienDoRepository.findById(dotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt báo cáo"));
        dot.setTrangThai(trangThai);
        dot = dotBaoCaoTienDoRepository.save(dot);
        return mapToDotBaoCaoTienDoResponse(dot);
    }

    // Lấy danh sách báo cáo tiến độ theo đợt
    public List<BaoCaoTienDoResponse> getBaoCaoTienDoByDot(Long dotId, Long giangVienId) {
        DotBaoCaoTienDo dot = dotBaoCaoTienDoRepository.findById(dotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt báo cáo"));

        // Kiểm tra GV có quyền không
        if (!dot.getGiangVien().getId().equals(giangVienId)) {
            throw new BadRequestException("Bạn không có quyền xem đợt báo cáo này");
        }

        List<BaoCaoTienDo> baoCaos = baoCaoTienDoRepository.findAllByDotBaoCaoTienDoId(dotId);
        return baoCaos.stream().map(this::mapToBaoCaoTienDoResponse).collect(Collectors.toList());
    }

    // Nhận xét báo cáo tiến độ
    @Transactional
    public BaoCaoTienDoResponse nhanXetBaoCaoTienDo(NhanXetBaoCaoTienDoRequest request, Long giangVienId) {
        BaoCaoTienDo baoCao = baoCaoTienDoRepository.findById(request.getBaoCaoTienDoId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy báo cáo tiến độ"));

        // Kiểm tra quyền
        if (!baoCao.getDotBaoCaoTienDo().getGiangVien().getId().equals(giangVienId)) {
            throw new BadRequestException("Bạn không có quyền nhận xét báo cáo này");
        }

        baoCao.setNhanXet(request.getNhanXet());
        baoCao.setNgayNhanXet(LocalDateTime.now());

        if (request.getTrangThai() != null) {
            baoCao.setTrangThai(TrangThaiBaoCaoTienDo.valueOf(request.getTrangThai()));
        } else {
            baoCao.setTrangThai(TrangThaiBaoCaoTienDo.DA_NHAN_XET);
        }

        baoCao = baoCaoTienDoRepository.save(baoCao);
        return mapToBaoCaoTienDoResponse(baoCao);
    }

    // Xóa đợt báo cáo tiến độ (cascade xóa báo cáo của sinh viên)
    @Transactional
    public void xoaDotBaoCaoTienDo(Long dotId, Long giangVienId) {
        DotBaoCaoTienDo dot = dotBaoCaoTienDoRepository.findById(dotId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt báo cáo"));

        if (!dot.getGiangVien().getId().equals(giangVienId)) {
            throw new BadRequestException("Bạn không có quyền xóa đợt báo cáo này");
        }

        // Xóa cascade: xóa tất cả báo cáo tiến độ của sinh viên trước
        List<BaoCaoTienDo> baoCaos = baoCaoTienDoRepository.findAllByDotBaoCaoTienDoId(dotId);
        if (!baoCaos.isEmpty()) {
            baoCaoTienDoRepository.deleteAll(baoCaos);
        }

        dotBaoCaoTienDoRepository.delete(dot);
    }

    // Lấy danh sách sinh viên được hướng dẫn
    public List<SinhVienHuongDanResponse> getSinhVienHuongDan(Long giangVienId) {
        List<PhanCongHuongDan> phanCongs = phanCongHuongDanRepository.findAll().stream()
                .filter(pc -> pc.getGiangVien() != null &&
                             pc.getGiangVien().getId().equals(giangVienId) &&
                             pc.getTrangThai() == TrangThaiPhanCong.DUYET)
                .collect(Collectors.toList());

        return phanCongs.stream().map(pc -> {
            DeTai dt = pc.getDeTai();
            SinhVien sv = dt.getSinhVien();
            
            // Kiểm tra đã chấm điểm chưa
            Boolean daChamDiem = false;
            if (dt.getDiemHuongDan() != null && dt.getDiemHuongDan().getDiem() != null) {
                daChamDiem = true;
            }
            
            return SinhVienHuongDanResponse.builder()
                    .id(sv.getId())
                    .maSinhVien(sv.getMaSinhVien())
                    .hoTen(sv.getHoTen())
                    .lop(sv.getLop())
                    .tenDeTai(dt.getTenDeTai())
                    .daChamDiem(daChamDiem)
                    .dotDangKyId(dt.getDotDangKy() != null ? dt.getDotDangKy().getId() : null)
                    .build();
        }).collect(Collectors.toList());
    }

    // Lấy báo cáo tiến độ của một sinh viên
    public List<BaoCaoTienDoResponse> getBaoCaoTienDoBySinhVien(Long sinhVienId, Long giangVienId) {
        // Lấy tất cả báo cáo tiến độ của sinh viên này
        List<BaoCaoTienDo> baoCaos = baoCaoTienDoRepository.findAllBySinhVien(sinhVienId);
        
        // Lọc chỉ lấy báo cáo thuộc đợt của GV đang login
        return baoCaos.stream()
                .filter(bc -> bc.getDotBaoCaoTienDo().getGiangVien().getId().equals(giangVienId))
                .map(this::mapToBaoCaoTienDoResponse)
                .collect(Collectors.toList());
    }

    // Mapper
    private DotBaoCaoTienDoResponse mapToDotBaoCaoTienDoResponse(DotBaoCaoTienDo dot) {
        int soLuongNop = baoCaoTienDoRepository.findAllByDotBaoCaoTienDoId(dot.getId()).size();

        return DotBaoCaoTienDoResponse.builder()
                .id(dot.getId())
                .giangVienId(dot.getGiangVien().getId())
                .hoTenGiangVien(dot.getGiangVien().getHoTen())
                .tenDot(dot.getTenDot())
                .ngayBatDau(dot.getNgayBatDau())
                .ngayKetThuc(dot.getNgayKetThuc())
                .trangThai(dot.getTrangThai())
                .createdAt(dot.getCreatedAt())
                .soLuongSinhVienNop(soLuongNop)
                .dotDangKyId(dot.getDotDangKy() != null ? dot.getDotDangKy().getId() : null)
                .tenDotDangKy(dot.getDotDangKy() != null ? dot.getDotDangKy().getTenDot() : null)
                .namHoc(dot.getDotDangKy() != null ? dot.getDotDangKy().getNamHoc() : null)
                .hocKy(dot.getDotDangKy() != null ? dot.getDotDangKy().getHocKy() : null)
                .build();
    }

    private BaoCaoTienDoResponse mapToBaoCaoTienDoResponse(BaoCaoTienDo bc) {
        DeTai deTai = bc.getDeTai();
        SinhVien sv = deTai.getSinhVien();

        return BaoCaoTienDoResponse.builder()
                .id(bc.getId())
                .dotBaoCaoTienDoId(bc.getDotBaoCaoTienDo().getId())
                .tenDotBaoCao(bc.getDotBaoCaoTienDo().getTenDot())
                .deTaiId(deTai.getId())
                .tenDeTai(deTai.getTenDeTai())
                .sinhVienId(sv != null ? sv.getId() : null)
                .hoTenSinhVien(sv != null ? sv.getHoTen() : null)
                .maSinhVien(sv != null ? sv.getMaSinhVien() : null)
                .lopSinhVien(sv != null ? sv.getLop() : null)
                .fileBaoCao(bc.getFileBaoCao())
                .noiDung(bc.getNoiDung())
                .ngayNop(bc.getNgayNop())
                .trangThai(bc.getTrangThai())
                .nhanXet(bc.getNhanXet())
                .ngayNhanXet(bc.getNgayNhanXet())
                .build();
    }

    // Lấy danh sách đợt đăng ký theo bộ môn
    public List<DotDangKyResponse> getDotDangKyByBoMon(Long boMonId) {
        List<DotDangKy> dots = dotDangKyRepository.findByBoMonId(boMonId);

        return dots.stream().map(dot -> DotDangKyResponse.builder()
                .id(dot.getId())
                .tenDot(dot.getTenDot())
                .namHoc(dot.getNamHoc())
                .hocKy(dot.getHocKy())
                .ngayBatDau(dot.getNgayBatDau())
                .ngayKetThuc(dot.getNgayKetThuc())
                .trangThai(dot.getTrangThai())
                .build()).collect(Collectors.toList());
    }
}

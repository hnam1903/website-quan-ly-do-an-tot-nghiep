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
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GiangVienService {

    private final GiangVienRepository giangVienRepository;
    private final DeTaiRepository deTaiRepository;
    private final PhanCongHuongDanRepository phanCongHuongDanRepository;
    private final DiemHuongDanRepository diemHuongDanRepository;
    private final DiemPhanBienRepository diemPhanBienRepository;
    private final HoiDongBaoVeRepository hoiDongBaoVeRepository;
    private final DiemBaoVeRepository diemBaoVeRepository;
    private final ThanhVienHoiDongRepository thanhVienHoiDongRepository;
    private final BaoCaoRepository baoCaoRepository;

    // GV Hướng dẫn
    public List<PhanCongHuongDanResponse> getDeTaiHuongDan(Long giangVienId) {
        List<PhanCongHuongDanResponse> responses = new ArrayList<>();
        Set<Long> addedDeTaiIds = new HashSet<>();

        // 1. Lấy các đề tài có giangVienDuKien là GV hiện tại và chưa được phân công (SV tự chọn GV - chờ duyệt)
        List<DeTai> deTaiDuKien = deTaiRepository.findAll().stream()
                .filter(dt -> dt.getGiangVienDuKien() != null && 
                             dt.getGiangVienDuKien().getId().equals(giangVienId) &&
                             dt.getPhanCongHuongDan() == null)
                .collect(Collectors.toList());

        for (DeTai dt : deTaiDuKien) {
            responses.add(mapDeTaiToPhanCongResponse(dt, giangVienId));
            addedDeTaiIds.add(dt.getId());
        }

        // 2. Lấy các đề tài đã được phân công cho GV này (bộ môn phân công HOẶC đã duyệt)
        List<PhanCongHuongDan> phanCongs = phanCongHuongDanRepository.findByGiangVienId(giangVienId);
        for (PhanCongHuongDan pc : phanCongs) {
            if (!addedDeTaiIds.contains(pc.getDeTai().getId())) {
                responses.add(mapToPhanCongHuongDanResponse(pc, giangVienId));
                addedDeTaiIds.add(pc.getDeTai().getId());
            }
        }

        return responses;
    }

    @Transactional
    public PhanCongHuongDanResponse duyetSinhVienHuongDan(Long id, boolean duyet) {
        // Kiểm tra xem id là PhanCongHuongDan.id (bộ môn phân công) hay deTai.id (SV tự chọn GV)
        Optional<PhanCongHuongDan> existingPchd = phanCongHuongDanRepository.findById(id);

        if (existingPchd.isPresent()) {
            // Trường hợp 1: id là PhanCongHuongDan.id (bộ môn phân công)
            PhanCongHuongDan phanCong = existingPchd.get();
            DeTai deTai = phanCong.getDeTai();

            if (duyet) {
                phanCong.setTrangThai(TrangThaiPhanCong.DUYET);
                deTai.setTrangThai(TrangThaiDeTai.DANG_THUC_HIEN);
                phanCong = phanCongHuongDanRepository.save(phanCong);
                deTai.setPhanCongHuongDan(phanCong);
                deTaiRepository.save(deTai);
                return mapToPhanCongHuongDanResponse(phanCong, phanCong.getGiangVien().getId());
            } else {
                // Từ chối: xóa bản ghi phân công để bộ môn có thể phân công lại
                deTai.setPhanCongHuongDan(null);
                deTai.setTrangThai(TrangThaiDeTai.DU_DIEU_KIEN);
                deTaiRepository.save(deTai);
                phanCongHuongDanRepository.delete(phanCong);
                return PhanCongHuongDanResponse.builder()
                        .id(phanCong.getId())
                        .deTaiId(deTai.getId())
                        .tenDeTai(deTai.getTenDeTai())
                        .giangVienId(phanCong.getGiangVien().getId())
                        .hoTenGiangVien(phanCong.getGiangVien().getHoTen())
                        .trangThai(TrangThaiPhanCong.TU_CHOI)
                        .sinhVienId(deTai.getSinhVien() != null ? deTai.getSinhVien().getId() : null)
                        .hoTenSinhVien(deTai.getSinhVien() != null ? deTai.getSinhVien().getHoTen() : null)
                        .maSinhVien(deTai.getSinhVien() != null ? deTai.getSinhVien().getMaSinhVien() : null)
                        .lopSinhVien(deTai.getSinhVien() != null ? deTai.getSinhVien().getLop() : null)
                        .build();
            }
        } else {
            // Trường hợp 2: id là deTai.id (SV tự chọn GV dự kiến)
            DeTai deTai = deTaiRepository.findById(id)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));
            GiangVien giangVien = deTai.getGiangVienDuKien();

            PhanCongHuongDan phanCong;
            if (duyet) {
                phanCong = PhanCongHuongDan.builder()
                        .deTai(deTai)
                        .giangVien(giangVien)
                        .trangThai(TrangThaiPhanCong.DUYET)
                        .ngayPhanCong(LocalDateTime.now())
                        .build();
                deTai.setTrangThai(TrangThaiDeTai.DANG_THUC_HIEN);
            } else {
                phanCong = PhanCongHuongDan.builder()
                        .deTai(deTai)
                        .giangVien(giangVien)
                        .trangThai(TrangThaiPhanCong.TU_CHOI)
                        .ngayPhanCong(LocalDateTime.now())
                        .build();
                deTai.setGiangVienDuKien(null);
                deTai.setTrangThai(TrangThaiDeTai.CHO_DUYET);
            }

            phanCong = phanCongHuongDanRepository.save(phanCong);
            deTai.setPhanCongHuongDan(phanCong);
            deTaiRepository.save(deTai);
            return mapToPhanCongHuongDanResponse(phanCong, giangVien.getId());
        }
    }

    @Transactional
    public DiemHuongDanResponse chamDiemHuongDan(DiemHuongDanRequest request) {
        DeTai deTai = deTaiRepository.findById(request.getDeTaiId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        DiemHuongDan diem = diemHuongDanRepository.findByDeTaiId(deTai.getId())
                .orElse(DiemHuongDan.builder().deTai(deTai).build());

        diem.setDiem(request.getDiem());
        diem.setNhanXet(request.getNhanXet());
        diem.setNgayCham(LocalDateTime.now());

        // Kiểm tra điều kiện
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

    // GV Phản biện
    public List<DeTaiResponse> getDeTaiPhanBien(Long giangVienId) {
        List<DeTai> deTais = deTaiRepository.findAll().stream()
                .filter(dt -> dt.getPhanCongPhanBien() != null && 
                             dt.getPhanCongPhanBien().getGiangVien().getId().equals(giangVienId))
                .collect(Collectors.toList());
        return deTais.stream().map(dt -> mapToDeTaiResponseForPhanBien(dt, giangVienId)).collect(Collectors.toList());
    }

    @Transactional
    public DiemPhanBienResponse chamDiemPhanBien(DiemPhanBienRequest request) {
        DeTai deTai = deTaiRepository.findById(request.getDeTaiId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đề tài"));

        DiemPhanBien diem = diemPhanBienRepository.findByDeTaiId(deTai.getId())
                .orElse(DiemPhanBien.builder().deTai(deTai).build());

        diem.setDiem(request.getDiem());
        diem.setNhanXet(request.getNhanXet());
        diem.setNgayCham(LocalDateTime.now());

        // Kiểm tra điều kiện
        if (request.getDiem().compareTo(BigDecimal.valueOf(5)) >= 0) {
            diem.setTrangThai(TrangThaiDiem.DU_DIEU_KIEN);
            deTai.setTrangThai(TrangThaiDeTai.DAT_PHAN_BIEN);
        } else {
            diem.setTrangThai(TrangThaiDiem.KHONG_DU_DIEU_KIEN);
            deTai.setTrangThai(TrangThaiDeTai.KHONG_DAT_PHAN_BIEN);
        }

        diem = diemPhanBienRepository.save(diem);
        deTaiRepository.save(deTai);

        return mapToDiemPhanBienResponse(diem);
    }

    // GV Hội đồng
    public List<HoiDongBaoVeResponse> getHoiDongBaoVe(Long giangVienId) {
        List<HoiDongBaoVe> hoiDongs = hoiDongBaoVeRepository.findAllByGiangVienId(giangVienId);
        return hoiDongs.stream().map(hd -> mapToHoiDongBaoVeResponse(hd, giangVienId)).collect(Collectors.toList());
    }

    @Transactional
    public DiemBaoVeResponse chamDiemBaoVe(DiemBaoVeRequest request, Long giangVienId) {
        HoiDongBaoVe hoiDong = hoiDongBaoVeRepository.findById(request.getHoiDongId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội đồng"));

        GiangVien giangVien = giangVienRepository.findById(giangVienId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        DiemBaoVe diem = diemBaoVeRepository.findByHoiDongIdAndGiangVienId(hoiDong.getId(), giangVienId)
                .orElse(DiemBaoVe.builder().hoiDong(hoiDong).giangVien(giangVien).build());

        diem.setDiem(request.getDiem());
        diem.setNhanXet(request.getNhanXet());
        diem = diemBaoVeRepository.save(diem);

        // Cập nhật trạng thái hội đồng nếu tất cả đã chấm
        List<DiemBaoVe> allDiems = diemBaoVeRepository.findByHoiDongId(hoiDong.getId());
        List<ThanhVienHoiDong> thanhViens = thanhVienHoiDongRepository.findByHoiDongId(hoiDong.getId());
        if (thanhViens.size() > 0 && allDiems.size() == thanhViens.size()) {
            hoiDong.setTrangThai(TrangThaiHoiDong.DA_BAO_VE);
        }
        hoiDongBaoVeRepository.save(hoiDong);

        return mapToDiemBaoVeResponse(diem);
    }

    private PhanCongHuongDanResponse mapDeTaiToPhanCongResponse(DeTai dt, Long giangVienId) {
        Boolean daChamDiem = diemHuongDanRepository.findByDeTaiId(dt.getId())
                .map(d -> d.getDiem() != null)
                .orElse(false);
        return PhanCongHuongDanResponse.builder()
                .id(dt.getId())
                .deTaiId(dt.getId())
                .tenDeTai(dt.getTenDeTai())
                .noiDungDuKien(dt.getNoiDungDuKien())
                .congNgheSuDung(dt.getCongNgheSuDung())
                .giangVienId(dt.getGiangVienDuKien().getId())
                .hoTenGiangVien(dt.getGiangVienDuKien().getHoTen())
                .trangThai(TrangThaiPhanCong.CHO_DUYET)
                .ngayPhanCong(LocalDateTime.now())
                .sinhVienId(dt.getSinhVien().getId())
                .hoTenSinhVien(dt.getSinhVien().getHoTen())
                .maSinhVien(dt.getSinhVien().getMaSinhVien())
                .lopSinhVien(dt.getSinhVien().getLop())
                .tenBoMon(dt.getSinhVien().getBoMon() != null ? dt.getSinhVien().getBoMon().getTenBoMon() : null)
                .daChamDiem(daChamDiem)
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
                .ngayPhanCong(pc.getNgayPhanCong())
                .sinhVienId(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getId() : null)
                .hoTenSinhVien(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getHoTen() : null)
                .maSinhVien(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getMaSinhVien() : null)
                .lopSinhVien(pc.getDeTai().getSinhVien() != null ? pc.getDeTai().getSinhVien().getLop() : null)
                .tenBoMon(pc.getDeTai().getSinhVien() != null && pc.getDeTai().getSinhVien().getBoMon() != null ? pc.getDeTai().getSinhVien().getBoMon().getTenBoMon() : null)
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

    private HoiDongBaoVeResponse mapToHoiDongBaoVeResponse(HoiDongBaoVe hd, Long giangVienId) {
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

        DiemBaoVe diemCuaToi = diemBaoVeRepository.findByHoiDongIdAndGiangVienId(hd.getId(), giangVienId).orElse(null);
        boolean daChamDiem = diemCuaToi != null && diemCuaToi.getDiem() != null;

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
                .thanhViens(thanhViens)
                .daChamDiem(daChamDiem)
                .diemCham(diemCuaToi != null ? diemCuaToi.getDiem() : null)
                .nhanXetCham(diemCuaToi != null ? diemCuaToi.getNhanXet() : null)
                .build();
    }

    private DiemBaoVeResponse mapToDiemBaoVeResponse(DiemBaoVe diem) {
        return DiemBaoVeResponse.builder()
                .id(diem.getId())
                .hoiDongId(diem.getHoiDong().getId())
                .giangVienId(diem.getGiangVien().getId())
                .hoTenGiangVien(diem.getGiangVien().getHoTen())
                .diem(diem.getDiem())
                .nhanXet(diem.getNhanXet())
                .createdAt(diem.getCreatedAt())
                .build();
    }

    // Lấy báo cáo của sinh viên mà GV đang hướng dẫn
    public List<BaoCaoResponse> getBaoCaoCuaSinhVien(Long giangVienId) {
        List<BaoCaoResponse> responses = new ArrayList<>();
        
        // Lấy các đề tài GV đang hướng dẫn
        List<PhanCongHuongDan> phanCongs = phanCongHuongDanRepository.findByGiangVienId(giangVienId);
        
        for (PhanCongHuongDan pc : phanCongs) {
            if (pc.getTrangThai() == TrangThaiPhanCong.DUYET) {
                DeTai deTai = pc.getDeTai();
                if (deTai.getBaoCao() != null) {
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
                .fileSourceCode(bc.getFileSourceCode())
                .ngayNop(bc.getNgayNop())
                .trangThai(bc.getTrangThai());
        
        if (deTai.getSinhVien() != null) {
            builder.hoTenSinhVien(deTai.getSinhVien().getHoTen())
                   .maSinhVien(deTai.getSinhVien().getMaSinhVien());
        }
        
        return builder.build();
    }
}

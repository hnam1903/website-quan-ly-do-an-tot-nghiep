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
    private final ThanhVienHoiDongRepository thanhVienHoiDongRepository;
    private final BaoCaoRepository baoCaoRepository;
    private final DiemBaoVeRepository diemBaoVeRepository;

    // GV Hướng dẫn - Chỉ hiển thị sinh viên đã được duyệt hướng dẫn
    public List<PhanCongHuongDanResponse> getDeTaiHuongDan(Long giangVienId) {
        List<PhanCongHuongDanResponse> responses = new ArrayList<>();

        // Lấy các phân công có trạng thái DUYET của GV này
        List<PhanCongHuongDan> phanCongs = phanCongHuongDanRepository.findAll().stream()
                .filter(pc -> pc.getGiangVien() != null &&
                             pc.getGiangVien().getId().equals(giangVienId) &&
                             pc.getTrangThai() == TrangThaiPhanCong.DUYET)
                .collect(Collectors.toList());

        for (PhanCongHuongDan pc : phanCongs) {
            responses.add(mapToPhanCongHuongDanResponse(pc, giangVienId));
        }

        return responses;
    }

    // Lấy đề tài chờ GV duyệt (từ bảng phanCongHuongDan có trạng thái CHO_DUYET)
    public List<PhanCongHuongDanResponse> getDeTaiChoDuyet(Long giangVienId) {
        List<PhanCongHuongDanResponse> responses = new ArrayList<>();

        // Lấy các phân công có trạng thái CHO_DUYET của GV này
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
                    .sinhVienId(dt.getSinhVien() != null ? dt.getSinhVien().getId() : null)
                    .hoTenSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getHoTen() : null)
                    .maSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getMaSinhVien() : null)
                    .lopSinhVien(dt.getSinhVien() != null ? dt.getSinhVien().getLop() : null)
                    .tenBoMon(dt.getSinhVien() != null && dt.getSinhVien().getBoMon() != null ? dt.getSinhVien().getBoMon().getTenBoMon() : null)
                    .build();
            responses.add(response);
        }

        return responses;
    }

    @Transactional
    public PhanCongHuongDanResponse duyetSinhVienHuongDan(Long phanCongId, boolean duyet) {
        // id là phanCong.id (phân công hướng dẫn)
        PhanCongHuongDan phanCong = phanCongHuongDanRepository.findById(phanCongId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy phân công hướng dẫn"));
        DeTai deTai = phanCong.getDeTai();

        if (duyet) {
            // GV đồng ý
            phanCong.setTrangThai(TrangThaiPhanCong.DUYET);
            phanCong.setNgayPhanCong(LocalDateTime.now());
            deTai.setTrangThai(TrangThaiDeTai.DANG_THUC_HIEN);
            phanCongHuongDanRepository.save(phanCong);
        } else {
            // GV từ chối - chỉ xóa phân công cũ, giữ lại giangVienDuKien để hiển thị ai từ chối
            deTai.setPhanCongHuongDan(null);
            deTai.setTrangThai(TrangThaiDeTai.CHO_GV_DUYET_LAI);
            deTaiRepository.save(deTai);
            phanCongHuongDanRepository.delete(phanCong);
            return null; // Trả về null vì đã xóa
        }

        deTaiRepository.save(deTai);
        return mapToPhanCongHuongDanResponse(phanCong, phanCong.getGiangVien().getId());
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

    // GV Hội đồng - chỉ xem danh sách, không chấm điểm
    public List<HoiDongBaoVeResponse> getHoiDongBaoVe(Long giangVienId) {
        List<HoiDongBaoVe> hoiDongs = hoiDongBaoVeRepository.findAllByGiangVienId(giangVienId);
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
                .thanhViens(thanhViens)
                .diemBaoVe(avgDiem)
                .nhanXetCham(hd.getNhanXetBaoVe())
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
                .nhanXetPhanBien(diemPB != null ? diemPB.getNhanXet() : null)
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

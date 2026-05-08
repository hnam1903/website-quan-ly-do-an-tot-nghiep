package com.quanlydoan.service;

import com.quanlydoan.dto.request.*;
import com.quanlydoan.dto.response.*;
import com.quanlydoan.entity.*;
import com.quanlydoan.enums.*;
import com.quanlydoan.exception.BadRequestException;
import com.quanlydoan.exception.ResourceNotFoundException;
import com.quanlydoan.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
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
    private final HoiDongBaoVeRepository hoiDongBaoVeRepository;
    private final PhanCongHuongDanRepository phanCongHuongDanRepository;
    private final PhanCongPhanBienRepository phanCongPhanBienRepository;
    private final DiemHuongDanRepository diemHuongDanRepository;
    private final DiemPhanBienRepository diemPhanBienRepository;
    private final BaoCaoRepository baoCaoRepository;
    private final BaoCaoTienDoRepository baoCaoTienDoRepository;
    private final ThanhVienHoiDongRepository thanhVienHoiDongRepository;

    private final AuthService authService;

    // ==================== Đợt đăng ký ====================
    
    @Transactional
    public DotDangKyResponse createDotDangKy(DotDangKyRequest request) {
        LocalDateTime ngayBatDau = LocalDate.parse(request.getNgayBatDau()).atStartOfDay();
        LocalDateTime ngayKetThuc = LocalDate.parse(request.getNgayKetThuc()).atTime(23, 59, 59);

        DotDangKy dotDangKy = DotDangKy.builder()
                .tenDot(request.getTenDot())
                .namHoc(request.getNamHoc())
                .hocKy(request.getHocKy())
                .ngayBatDau(ngayBatDau)
                .ngayKetThuc(ngayKetThuc)
                .trangThai(TrangThaiDot.DANG_MO)
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
            dotDangKy.setNgayBatDau(LocalDate.parse(request.getNgayBatDau()).atStartOfDay());
        }
        if (request.getNgayKetThuc() != null) {
            dotDangKy.setNgayKetThuc(LocalDate.parse(request.getNgayKetThuc()).atTime(23, 59, 59));
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

    @Transactional
    public DotDangKyResponse dongDotDangKy(Long id) {
        DotDangKy dotDangKy = dotDangKyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt đăng ký"));
        
        if (dotDangKy.getTrangThai() == TrangThaiDot.KET_THUC) {
            throw new BadRequestException("Đợt đăng ký đã kết thúc rồi");
        }
        
        dotDangKy.setTrangThai(TrangThaiDot.KET_THUC);
        dotDangKy = dotDangKyRepository.save(dotDangKy);
        return mapToDotDangKyResponse(dotDangKy);
    }

    @Transactional
    public DotDangKyResponse moLaiDotDangKy(Long id) {
        DotDangKy dotDangKy = dotDangKyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt đăng ký"));
        
        if (dotDangKy.getTrangThai() == TrangThaiDot.DANG_MO) {
            throw new BadRequestException("Đợt đăng ký đang mở rồi");
        }
        
        dotDangKy.setTrangThai(TrangThaiDot.DANG_MO);
        dotDangKy = dotDangKyRepository.save(dotDangKy);
        return mapToDotDangKyResponse(dotDangKy);
    }

    public List<SinhVienResponse> getSinhVienByDotDangKy(Long dotDangKyId) {
        DotDangKy dotDangKy = dotDangKyRepository.findById(dotDangKyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt đăng ký"));
        
        // Lấy danh sách sinh viên đã đăng ký đề tài trong đợt này
        List<DeTai> deTais = deTaiRepository.findByDotDangKyId(dotDangKyId);
        
        List<SinhVienResponse> allSinhVien = sinhVienRepository.findAll().stream()
                .map(this::mapToSinhVienResponse)
                .collect(Collectors.toList());
        
        // Sinh viên đã đăng ký
        List<SinhVienResponse> daDangKy = deTais.stream()
                .filter(dt -> dt.getSinhVien() != null)
                .map(dt -> mapToSinhVienResponse(dt.getSinhVien()))
                .distinct()
                .collect(Collectors.toList());
        
        // Sinh viên chưa đăng ký (loại bỏ những SV đã đăng ký)
        List<SinhVienResponse> chuaDangKy = allSinhVien.stream()
                .filter(sv -> daDangKy.stream().noneMatch(dadk -> dadk.getId().equals(sv.getId())))
                .collect(Collectors.toList());
        
        // Trả về danh sách kết hợp: [đã đăng ký, chưa đăng ký]
        List<SinhVienResponse> result = new ArrayList<>();
        result.addAll(daDangKy);
        result.addAll(chuaDangKy);
        return result;
    }

    public DanhSachSinhVienDotDangKyResponse getDanhSachSinhVienByDotDangKy(Long dotDangKyId) {
        DotDangKy dotDangKy = dotDangKyRepository.findById(dotDangKyId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đợt đăng ký"));

        List<DeTai> deTaisCuaDot = deTaiRepository.findByDotDangKyId(dotDangKyId);
        List<SinhVienResponse> allSinhVien = sinhVienRepository.findAll().stream()
                .map(this::mapToSinhVienResponse)
                .collect(Collectors.toList());

        List<SinhVienResponse> daDangKy = deTaisCuaDot.stream()
                .filter(dt -> dt.getSinhVien() != null)
                .map(dt -> mapToSinhVienResponse(dt.getSinhVien()))
                .distinct()
                .collect(Collectors.toList());

        // Lấy ID sinh viên có đề tài chưa hoàn thành quy trình (không được đăng ký đề tài mới)
        // Chỉ được đăng ký lại khi đề tài ở trạng thái KHONG_DAT_GVHD, KHONG_DAT_PHAN_BIEN, KHONG_DAT_BAO_VE, BI_TU_CHOI
        List<TrangThaiDeTai> trangThaiChuaHoanThanh = Arrays.asList(
                TrangThaiDeTai.CHO_BO_MON_DUYET,
                TrangThaiDeTai.CHO_GV_DUYET,
                TrangThaiDeTai.GV_TU_CHOI,
                TrangThaiDeTai.DANG_THUC_HIEN,
                TrangThaiDeTai.DA_NOP_BAO_CAO,
                TrangThaiDeTai.DAT_GVHD,
                TrangThaiDeTai.CHO_PHAN_BIEN,
                TrangThaiDeTai.DAT_PHAN_BIEN,
                TrangThaiDeTai.DANG_BAO_VE,
                TrangThaiDeTai.HOAN_THANH
        );
        List<Long> svCoDeTaiChuaHoanThanhIds = deTaiRepository.findAll().stream()
                .filter(dt -> dt.getSinhVien() != null)
                .filter(dt -> trangThaiChuaHoanThanh.contains(dt.getTrangThai()))
                .map(dt -> dt.getSinhVien().getId())
                .distinct()
                .collect(Collectors.toList());

        // Sinh viên chưa đăng ký đợt này VÀ không có đề tài chưa hoàn thành
        List<SinhVienResponse> chuaDangKy = allSinhVien.stream()
                .filter(sv -> daDangKy.stream().noneMatch(dadk -> dadk.getId().equals(sv.getId())))
                .filter(sv -> !svCoDeTaiChuaHoanThanhIds.contains(sv.getId()))
                .collect(Collectors.toList());

        return DanhSachSinhVienDotDangKyResponse.builder()
                .sinhVienDaDangKy(daDangKy)
                .sinhVienChuaDangKy(chuaDangKy)
                .tongSoSinhVien(allSinhVien.size())
                .soLuongDaDangKy(daDangKy.size())
                .soLuongChuaDangKy(chuaDangKy.size())
                .build();
    }

    // ==================== Đề tài ====================

    // Lấy danh sách đề tài (filter theo đợt, trạng thái, bộ môn)
    public List<DeTaiResponse> getDeTaiDangKy(Long dotDangKyId, TrangThaiDeTai trangThai, Long boMonId) {
        List<DeTai> deTais;

        if (boMonId != null) {
            if (trangThai != null) {
                deTais = deTaiRepository.findByBoMonIdAndTrangThai(boMonId, trangThai);
            } else {
                deTais = deTaiRepository.findAllByBoMonId(boMonId);
            }
        } else if (trangThai != null) {
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

    // ==================== Đề tài không đạt ====================

    public List<DeTaiResponse> getDeTaiKhongDat(Long dotDangKyId) {
        List<TrangThaiDeTai> trangThaiKhongDat = Arrays.asList(
                TrangThaiDeTai.KHONG_DAT_GVHD,
                TrangThaiDeTai.KHONG_DAT_PHAN_BIEN,
                TrangThaiDeTai.KHONG_DAT_BAO_VE,
                TrangThaiDeTai.BI_TU_CHOI
        );
        List<DeTai> deTais;
        if (dotDangKyId != null) {
            deTais = deTaiRepository.findByDotDangKyIdAndTrangThaiIn(dotDangKyId, trangThaiKhongDat);
        } else {
            deTais = deTaiRepository.findByTrangThaiIn(trangThaiKhongDat);
        }
        return deTais.stream()
                .map(this::mapToDeTaiResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void xoaDeTai(Long id) {
        if (!deTaiRepository.existsById(id)) {
            throw new ResourceNotFoundException("Không tìm thấy đề tài");
        }

        // Xóa các bản ghi liên quan theo thứ tự TỪ CON NHẤT đến CHA:
        
        // 1. Xóa hội đồng bảo vệ và các bản ghi con
        HoiDongBaoVe hoiDong = hoiDongBaoVeRepository.findByDeTaiId(id).orElse(null);
        if (hoiDong != null) {
            Long hoiDongId = hoiDong.getId();
            
            // 1.1 Xóa điểm bảo vệ (con của hoi_dong_bao_ve)
            List<DiemBaoVe> diemBaoVes = diemBaoVeRepository.findByHoiDongId(hoiDongId);
            if (!diemBaoVes.isEmpty()) {
                diemBaoVeRepository.deleteAll(diemBaoVes);
            }
            
            // 1.2 Xóa thành viên hội đồng (con của hoi_dong_bao_ve)
            List<ThanhVienHoiDong> thanhViens = thanhVienHoiDongRepository.findByHoiDongId(hoiDongId);
            if (!thanhViens.isEmpty()) {
                thanhVienHoiDongRepository.deleteAll(thanhViens);
            }
            
            // 1.3 Xóa hội đồng bảo vệ
            hoiDongBaoVeRepository.delete(hoiDong);
        }

        // 2. Xóa báo cáo tiến độ (con của de_tai)
        List<BaoCaoTienDo> dsBaoCaoTienDo = baoCaoTienDoRepository.findAllByDeTaiId(id);
        if (!dsBaoCaoTienDo.isEmpty()) {
            baoCaoTienDoRepository.deleteAll(dsBaoCaoTienDo);
        }

        // 3. Xóa điểm phản biện (con của de_tai)
        DiemPhanBien diemPB = diemPhanBienRepository.findByDeTaiId(id).orElse(null);
        if (diemPB != null) {
            diemPhanBienRepository.delete(diemPB);
        }

        // 4. Xóa điểm hướng dẫn (con của de_tai)
        DiemHuongDan diemHD = diemHuongDanRepository.findByDeTaiId(id).orElse(null);
        if (diemHD != null) {
            diemHuongDanRepository.delete(diemHD);
        }

        // 5. Xóa phân công phản biện (con của de_tai)
        PhanCongPhanBien pcpb = phanCongPhanBienRepository.findByDeTaiId(id).orElse(null);
        if (pcpb != null) {
            phanCongPhanBienRepository.delete(pcpb);
        }

        // 6. Xóa phân công hướng dẫn (con của de_tai)
        PhanCongHuongDan pchd = phanCongHuongDanRepository.findByDeTaiId(id).orElse(null);
        if (pchd != null) {
            phanCongHuongDanRepository.delete(pchd);
        }

        // 7. Xóa báo cáo (con của de_tai)
        BaoCao baoCao = baoCaoRepository.findByDeTaiId(id).orElse(null);
        if (baoCao != null) {
            baoCaoRepository.delete(baoCao);
        }

        // 8. Cuối cùng xóa đề tài (bảng cha)
        deTaiRepository.deleteById(id);
    }

    // ==================== Bộ môn ====================

    @Transactional
    public BoMonResponse createBoMon(BoMonRequest request) {
        if (boMonRepository.findByMaBoMon(request.getMaBoMon()).isPresent()) {
            throw new BadRequestException("Mã bộ môn đã tồn tại");
        }

        // Tìm hoặc tạo khoa mặc định "Công nghệ Thông tin"
        Khoa khoa = khoaRepository.findByMaKhoa("CNTT")
                .orElseGet(() -> {
                    Khoa newKhoa = Khoa.builder()
                            .tenKhoa("Công nghệ Thông tin")
                            .maKhoa("CNTT")
                            .build();
                    return khoaRepository.save(newKhoa);
                });

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

    // ==================== Quản lý điểm ====================

    public List<QuanLyDiemResponse> getQuanLyDiem(Long boMonId, Long dotDangKyId) {
        List<DeTai> deTais;

        if (boMonId != null || dotDangKyId != null) {
            deTais = deTaiRepository.findAll().stream()
                    .filter(dt -> dt.getSinhVien() != null)
                    .filter(dt -> boMonId == null ||
                            (dt.getSinhVien().getBoMon() != null &&
                             dt.getSinhVien().getBoMon().getId().equals(boMonId)))
                    .filter(dt -> dotDangKyId == null ||
                            (dt.getDotDangKy() != null &&
                             dt.getDotDangKy().getId().equals(dotDangKyId)))
                    .collect(Collectors.toList());
        } else {
            deTais = deTaiRepository.findAll().stream()
                    .filter(dt -> dt.getSinhVien() != null)
                    .collect(Collectors.toList());
        }

        return deTais.stream()
                .map(this::mapToQuanLyDiemResponse)
                .collect(Collectors.toList());
    }

    private QuanLyDiemResponse mapToQuanLyDiemResponse(DeTai dt) {
        SinhVien sv = dt.getSinhVien();

        // Lấy điểm
        BigDecimal diemHD = dt.getDiemHuongDan() != null ? dt.getDiemHuongDan().getDiem() : null;
        BigDecimal diemPB = dt.getDiemPhanBien() != null ? dt.getDiemPhanBien().getDiem() : null;

        // Tính điểm bảo vệ = tổng điểm 3 thành viên hội đồng
        BigDecimal diemBV = null;
        List<QuanLyDiemResponse.ThanhVienHoiDongDiem> thanhVienDiemList = null;
        
        if (dt.getHoiDongBaoVe() != null) {
            HoiDongBaoVe hoiDong = dt.getHoiDongBaoVe();
            BigDecimal sumDiemHoiDong = diemBaoVeRepository.calculateSumDiemByHoiDongId(hoiDong.getId());
            if (sumDiemHoiDong != null && sumDiemHoiDong.compareTo(BigDecimal.ZERO) > 0) {
                diemBV = sumDiemHoiDong.setScale(1, RoundingMode.HALF_UP);
            }
            
            // Lấy điểm từng thành viên hội đồng
            if (hoiDong.getThanhViens() != null && !hoiDong.getThanhViens().isEmpty()) {
                // Map từ thanhViens và tìm điểm tương ứng
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
                .diemBaoVe(diemBV)
                .diemTongBaoVe(dt.getDiemTongBaoVe())
                .thanhVienHoiDongList(thanhVienDiemList)
                .build();
    }

    // ==================== Dashboard ====================

    public DashboardResponse getDashboard() {
        return DashboardResponse.builder()
                .tongSoGiangVien(giangVienRepository.count())
                .tongSoSinhVien(sinhVienRepository.count())
                .tongSoDeTai(deTaiRepository.count())
                .deTaiChoDuyet(deTaiRepository.countByTrangThai(TrangThaiDeTai.CHO_BO_MON_DUYET))
                .deTaiDangThucHien(deTaiRepository.countByTrangThai(TrangThaiDeTai.DANG_THUC_HIEN) +
                        deTaiRepository.countByTrangThai(TrangThaiDeTai.DA_NOP_BAO_CAO))
                .deTaiHoanThanh(deTaiRepository.countByTrangThai(TrangThaiDeTai.HOAN_THANH))
                .deTaiKhongDat(deTaiRepository.countByTrangThai(TrangThaiDeTai.KHONG_DAT_BAO_VE))
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

        // Đợt đăng ký
        if (dt.getDotDangKy() != null) {
            builder.dotDangKyId(dt.getDotDangKy().getId())
                   .tenDotDangKy(dt.getDotDangKy().getTenDot())
                   .namHoc(dt.getDotDangKy().getNamHoc());
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

        // Điểm bảo vệ - lấy chi tiết từng thành viên HĐ từ bảng DiemBaoVe
        if (dt.getHoiDongBaoVe() != null && dt.getHoiDongBaoVe().getDiemBaoVes() != null) {
            List<DiemBaoVe> diemBaoVes = dt.getHoiDongBaoVe().getDiemBaoVes();

            // Lấy vai trò từ ThanhVienHoiDong (nếu có)
            Map<Long, VaiTroHoiDong> vaiTroMap = new java.util.HashMap<>();
            if (dt.getHoiDongBaoVe().getThanhViens() != null) {
                dt.getHoiDongBaoVe().getThanhViens().forEach(tv -> {
                    if (tv.getGiangVien() != null) {
                        vaiTroMap.put(tv.getGiangVien().getId(), tv.getVaiTro());
                    }
                });
            }

            // Chi tiết từng thành viên HĐ
            List<DeTaiResponse.ThanhVienInfo> thanhViens = diemBaoVes.stream()
                    .filter(d -> d.getGiangVien() != null)
                    .map(d -> {
                        VaiTroHoiDong vaiTro = vaiTroMap.get(d.getGiangVien().getId());
                        return DeTaiResponse.ThanhVienInfo.builder()
                                .hoTen(d.getGiangVien().getHoTen())
                                .vaiTro(vaiTro != null ? vaiTro.name() : null)
                                .diem(d.getDiem())
                                .build();
                    })
                    .collect(Collectors.toList());
            builder.thanhVienHoiDongList(thanhViens);
        }

        // Điểm tổng bảo vệ
        builder.diemTongBaoVe(dt.getDiemTongBaoVe());

        return builder.build();
    }

    // ==================== Mappers ====================

    // ==================== Quản lý Tài Khoản ====================

    public List<TaiKhoanResponse> getAllTaiKhoan() {
        return taiKhoanRepository.findAll().stream()
                .map(TaiKhoanResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public TaiKhoanResponse getTaiKhoanById(Long id) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));
        return TaiKhoanResponse.fromEntity(taiKhoan);
    }

    @Transactional
    public TaiKhoanResponse khoaTaiKhoan(Long id) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        taiKhoan.setTrangThai(false);
        taiKhoan = taiKhoanRepository.save(taiKhoan);

        return TaiKhoanResponse.fromEntity(taiKhoan);
    }

    @Transactional
    public TaiKhoanResponse moTaiKhoan(Long id) {
        TaiKhoan taiKhoan = taiKhoanRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy tài khoản"));

        taiKhoan.setTrangThai(true);
        taiKhoan = taiKhoanRepository.save(taiKhoan);

        return TaiKhoanResponse.fromEntity(taiKhoan);
    }

    // ==================== Mapping Methods ====================

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
                .taiKhoanId(gv.getTaiKhoan() != null ? gv.getTaiKhoan().getId() : null)
                .trangThaiTaiKhoan(gv.getTaiKhoan() != null ? gv.getTaiKhoan().getTrangThai() : null)
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
                .taiKhoanId(sv.getTaiKhoan() != null ? sv.getTaiKhoan().getId() : null)
                .trangThaiTaiKhoan(sv.getTaiKhoan() != null ? sv.getTaiKhoan().getTrangThai() : null)
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

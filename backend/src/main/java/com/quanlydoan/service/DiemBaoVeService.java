package com.quanlydoan.service;

import com.quanlydoan.dto.request.DiemBaoVeRequest;
import com.quanlydoan.dto.response.DiemBaoVeResponse;
import com.quanlydoan.entity.DiemBaoVe;
import com.quanlydoan.entity.GiangVien;
import com.quanlydoan.entity.HoiDongBaoVe;
import com.quanlydoan.enums.TrangThaiDiem;
import com.quanlydoan.exception.BadRequestException;
import com.quanlydoan.exception.ResourceNotFoundException;
import com.quanlydoan.repository.DiemBaoVeRepository;
import com.quanlydoan.repository.GiangVienRepository;
import com.quanlydoan.repository.HoiDongBaoVeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DiemBaoVeService {

    private final DiemBaoVeRepository diemBaoVeRepository;
    private final HoiDongBaoVeRepository hoiDongBaoVeRepository;
    private final GiangVienRepository giangVienRepository;

    public List<DiemBaoVeResponse> getDiemBaoVeByHoiDong(Long hoiDongId) {
        List<DiemBaoVe> diemBaoVes = diemBaoVeRepository.findByHoiDongId(hoiDongId);
        return diemBaoVes.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public DiemBaoVeResponse getDiemBaoVeById(Long id) {
        DiemBaoVe diemBaoVe = diemBaoVeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy điểm bảo vệ"));
        return mapToResponse(diemBaoVe);
    }

    public DiemBaoVeResponse getDiemBaoVeByHoiDongAndGiangVien(Long hoiDongId, Long giangVienId) {
        DiemBaoVe diemBaoVe = diemBaoVeRepository.findByHoiDongIdAndGiangVienId(hoiDongId, giangVienId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy điểm bảo vệ của giảng viên này"));
        return mapToResponse(diemBaoVe);
    }

    @Transactional
    public List<DiemBaoVeResponse> importDiemBaoVe(DiemBaoVeRequest request) {
        HoiDongBaoVe hoiDong = hoiDongBaoVeRepository.findById(request.getHoiDongId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội đồng"));

        List<DiemBaoVeResponse> results = new ArrayList<>();

        if (request.getDiemThanhViens() != null) {
            for (DiemBaoVeRequest.DiemThanhVien diemThanhVien : request.getDiemThanhViens()) {
                GiangVien giangVien = giangVienRepository.findById(diemThanhVien.getGiangVienId())
                        .orElseThrow(() -> new ResourceNotFoundException(
                                "Không tìm thấy giảng viên với ID: " + diemThanhVien.getGiangVienId()));

                DiemBaoVe diemBaoVe = diemBaoVeRepository
                        .findByHoiDongIdAndGiangVienId(request.getHoiDongId(), diemThanhVien.getGiangVienId())
                        .orElse(DiemBaoVe.builder()
                                .hoiDong(hoiDong)
                                .giangVien(giangVien)
                                .build());

                diemBaoVe.setDiem(diemThanhVien.getDiem());
                diemBaoVe.setTrangThai(TrangThaiDiem.DU_DIEU_KIEN);

                DiemBaoVe saved = diemBaoVeRepository.save(diemBaoVe);
                results.add(mapToResponse(saved));
            }
        }

        return results;
    }

    @Transactional
    public DiemBaoVeResponse chamDiem(Long hoiDongId, Long giangVienId, BigDecimal diem, String nhanXet) {
        HoiDongBaoVe hoiDong = hoiDongBaoVeRepository.findById(hoiDongId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội đồng"));

        GiangVien giangVien = giangVienRepository.findById(giangVienId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));

        DiemBaoVe diemBaoVe = diemBaoVeRepository.findByHoiDongIdAndGiangVienId(hoiDongId, giangVienId)
                .orElse(DiemBaoVe.builder()
                        .hoiDong(hoiDong)
                        .giangVien(giangVien)
                        .build());

        diemBaoVe.setDiem(diem);
        diemBaoVe.setTrangThai(diem != null ? TrangThaiDiem.DU_DIEU_KIEN : TrangThaiDiem.CHUA_CHAM);

        DiemBaoVe saved = diemBaoVeRepository.save(diemBaoVe);

        return mapToResponse(saved);
    }

    @Transactional
    public void updateDiemByGiangVien(Long hoiDongId, Long giangVienId, BigDecimal diem) {
        DiemBaoVe diemBaoVe = diemBaoVeRepository
                .findByHoiDongIdAndGiangVienId(hoiDongId, giangVienId)
                .orElseGet(() -> {
                    HoiDongBaoVe hoiDong = hoiDongBaoVeRepository.findById(hoiDongId)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy hội đồng"));
                    GiangVien giangVien = giangVienRepository.findById(giangVienId)
                            .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy giảng viên"));
                    return DiemBaoVe.builder()
                            .hoiDong(hoiDong)
                            .giangVien(giangVien)
                            .build();
                });

        diemBaoVe.setDiem(diem);
        diemBaoVe.setUpdatedAt(LocalDateTime.now());
        diemBaoVeRepository.save(diemBaoVe);
    }

    public long countChuaChamByHoiDong(Long hoiDongId) {
        return diemBaoVeRepository.countChuaChamByHoiDongId(hoiDongId);
    }

    public BigDecimal getAverageDiemByHoiDong(Long hoiDongId) {
        BigDecimal avg = diemBaoVeRepository.calculateAverageDiemByHoiDongId(hoiDongId);
        if (avg != null) {
            avg = avg.setScale(2, java.math.RoundingMode.HALF_UP);
        }
        return avg;
    }

    private DiemBaoVeResponse mapToResponse(DiemBaoVe diemBaoVe) {
        return DiemBaoVeResponse.builder()
                .id(diemBaoVe.getId())
                .hoiDongId(diemBaoVe.getHoiDong() != null ? diemBaoVe.getHoiDong().getId() : null)
                .giangVienId(diemBaoVe.getGiangVien() != null ? diemBaoVe.getGiangVien().getId() : null)
                .hoTenGiangVien(diemBaoVe.getGiangVien() != null ? diemBaoVe.getGiangVien().getHoTen() : null)
                .hocVi(diemBaoVe.getGiangVien() != null ? diemBaoVe.getGiangVien().getHocVi() : null)
                .diem(diemBaoVe.getDiem())
                .trangThai(diemBaoVe.getTrangThai())
                .createdAt(diemBaoVe.getCreatedAt())
                .updatedAt(diemBaoVe.getUpdatedAt())
                .build();
    }
}

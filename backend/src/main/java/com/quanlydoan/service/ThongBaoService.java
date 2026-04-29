package com.quanlydoan.service;

import com.quanlydoan.dto.request.ThongBaoRequest;
import com.quanlydoan.dto.response.ThongBaoResponse;
import com.quanlydoan.entity.ThongBao;
import com.quanlydoan.exception.BadRequestException;
import com.quanlydoan.repository.ThongBaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ThongBaoService {

    private final ThongBaoRepository thongBaoRepository;

    @Transactional(readOnly = true)
    public List<ThongBaoResponse> getAll() {
        return thongBaoRepository.findAllByOrderByNgayDangDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ThongBaoResponse> getAllHienThi() {
        return thongBaoRepository.findByTrangThaiTrueOrderByNgayDangDesc()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ThongBaoResponse getById(Long id) {
        ThongBao thongBao = thongBaoRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông báo với id: " + id));
        return toResponse(thongBao);
    }

    @Transactional
    public ThongBaoResponse create(ThongBaoRequest request) {
        ThongBao thongBao = ThongBao.builder()
                .tieuDe(request.getTieuDe())
                .noiDung(request.getNoiDung())
                .ngayDang(LocalDateTime.now())
                .trangThai(true)
                .build();
        return toResponse(thongBaoRepository.save(thongBao));
    }

    @Transactional
    public ThongBaoResponse update(Long id, ThongBaoRequest request) {
        ThongBao thongBao = thongBaoRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông báo với id: " + id));
        thongBao.setTieuDe(request.getTieuDe());
        thongBao.setNoiDung(request.getNoiDung());
        return toResponse(thongBaoRepository.save(thongBao));
    }

    @Transactional
    public void delete(Long id) {
        if (!thongBaoRepository.existsById(id)) {
            throw new BadRequestException("Không tìm thấy thông báo với id: " + id);
        }
        thongBaoRepository.deleteById(id);
    }

    @Transactional
    public ThongBaoResponse toggleTrangThai(Long id) {
        ThongBao thongBao = thongBaoRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Không tìm thấy thông báo với id: " + id));
        thongBao.setTrangThai(!thongBao.getTrangThai());
        return toResponse(thongBaoRepository.save(thongBao));
    }

    private ThongBaoResponse toResponse(ThongBao entity) {
        return ThongBaoResponse.builder()
                .id(entity.getId())
                .tieuDe(entity.getTieuDe())
                .noiDung(entity.getNoiDung())
                .ngayDang(entity.getNgayDang())
                .trangThai(entity.getTrangThai())
                .build();
    }
}

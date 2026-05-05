package com.quanlydoan.dto.response;

import com.quanlydoan.entity.TaiKhoan;
import com.quanlydoan.enums.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaiKhoanResponse {

    private Long id;
    private String email;
    private Role role;
    private Boolean trangThai;
    private String hoTen;
    private String maSinhVien;

    public static TaiKhoanResponse fromEntity(TaiKhoan taiKhoan) {
        TaiKhoanResponseBuilder builder = TaiKhoanResponse.builder()
                .id(taiKhoan.getId())
                .email(taiKhoan.getEmail())
                .role(taiKhoan.getRole())
                .trangThai(taiKhoan.getTrangThai());

        if (taiKhoan.getGiangVien() != null) {
            builder.hoTen(taiKhoan.getGiangVien().getHoTen());
        } else if (taiKhoan.getSinhVien() != null) {
            builder.hoTen(taiKhoan.getSinhVien().getHoTen());
            builder.maSinhVien(taiKhoan.getSinhVien().getMaSinhVien());
        }

        return builder.build();
    }
}

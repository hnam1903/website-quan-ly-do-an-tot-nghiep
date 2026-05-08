package com.quanlydoan.enums;

public enum TrangThaiDeTai {
    // Đăng ký & Duyệt
    CHO_BO_MON_DUYET,      // SV đăng ký, chờ BoMon duyệt
    BI_TU_CHOI,            // Bị BoMon từ chối
    
    // Phân công GVHD
    CHO_GV_DUYET,          // Đã gửi yêu cầu, chờ GVHD duyệt
    GV_TU_CHOI,            // GVHD từ chối
    CHO_GV_PHAN_CONG,      // Chờ phân công GVHD (chưa có GV dự kiến)
    CHO_BO_MON_PHAN_CONG,  // GV đồng ý, chờ BoMon xác nhận phân công
    DANG_THUC_HIEN,        // Đã phân công xong, đang thực hiện
    
    // Báo cáo
    DA_NOP_BAO_CAO,
    
    // Chấm điểm
    DAT_GVHD,
    KHONG_DAT_GVHD, 
    CHO_PHAN_BIEN,
    DAT_PHAN_BIEN,
    KHONG_DAT_PHAN_BIEN,
    DANG_BAO_VE,
    HOAN_THANH,
    KHONG_DAT_BAO_VE
}

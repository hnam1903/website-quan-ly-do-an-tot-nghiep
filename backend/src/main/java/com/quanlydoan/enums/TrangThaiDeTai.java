package com.quanlydoan.enums;

public enum TrangThaiDeTai {
    CHO_DUYET,          // Chờ Admin duyệt
    DA_GUI_BO_MON,      // Đã gửi lên Bộ môn
    BI_TU_CHOI,         // Bị Bộ môn từ chối, cần đăng ký lại
    CHO_BO_MON_DUYET,   // Chờ Bộ môn duyệt
    CHO_GV_DUYET,       // Chờ GV xác nhận
    CHO_GV_DUYET_LAI,   // GV từ chối, chờ đăng ký GV khác
    DANG_THUC_HIEN,     // Đang thực hiện
    DA_NOP_BAO_CAO,     // Đã nộp báo cáo
    DAT_GVHD,           // Đạt GV hướng dẫn
    KHONG_DAT_GVHD,     // Không đạt GV hướng dẫn
    CHO_PHAN_BIEN,      // Chờ phân công phản biện
    DAT_PHAN_BIEN,      // Đạt phản biện
    KHONG_DAT_PHAN_BIEN,// Không đạt phản biện
    CHO_HOI_DONG,       // Chờ thành lập hội đồng
    DANG_BAO_VE,        // Đang bảo vệ
    HOAN_THANH,         // Hoàn thành
    KHONG_DAT_BAO_VE,    // Không đạt bảo vệ
    DU_DIEU_KIEN,       // Đủ điều kiện
    KHONG_DU_DIEU_KIEN  // Không đủ điều kiện
}

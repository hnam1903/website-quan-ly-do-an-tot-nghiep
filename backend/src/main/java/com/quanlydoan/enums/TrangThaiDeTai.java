package com.quanlydoan.enums;

public enum TrangThaiDeTai {
    CHO_DUYET,          // Chờ Admin duyệt
    DA_GUI_BO_MON,      // Đã gửi lên Bộ môn
    BI_TU_CHOI,         // Bị Bộ môn từ chối, cần đăng ký lại
    CHO_BO_MON_DUYET,   // Chờ Bộ môn duyệt
    CHO_GV_DUYET,       // Chờ GV xác nhận
    DANG_THUC_HIEN,     // Đang thực hiện
    DA_NOP_BAO_CAO,     // Đã nộp báo cáo
    DAT_GVHD,           // Đạt GV hướng dẫn
    KHONG_DAT_GVHD,     // Không đạt GV hướng dẫn
    CHO_PHAN_BIEN,      // Chờ phân công phản biện
    CHO_GV_PB_DUYET,    // Chờ GV phản biện duyệt
    DAT_PHAN_BIEN,      // Đạt phản biện
    KHONG_DAT_PHAN_BIEN,// Không đạt phản biện
    CHO_HOI_DONG,       // Chờ thành lập hội đồng
    DA_GAP_HOI_DONG,    // Đã gặp hội đồng
    HOAN_THANH,         // Hoàn thành
    KHONG_DAT,          // Không đạt
    DU_DIEU_KIEN,       // Đủ điều kiện
    KHONG_DU_DIEU_KIEN  // Không đủ điều kiện
}

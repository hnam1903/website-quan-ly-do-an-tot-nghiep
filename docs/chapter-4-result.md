# CHƯƠNG 4. KẾT QUẢ THỰC NGHIỆM

## 4.1. Môi trường phát triển

### 4.1.1. Yêu cầu phần cứng

| Thành phần | Tối thiểu | Khuyến nghị |
|---|---|---|
| Bộ xử lý (CPU) | Intel Core i5 thế hệ 8 / AMD Ryzen 5 | Intel Core i7 thế hệ 10+ / AMD Ryzen 7 |
| Bộ nhớ RAM | 8 GB | 16 GB |
| Ổ cứng | 256 GB SSD | 512 GB SSD trở lên |
| Card đồ họa | Tích hợp Intel UHD 620 | NVIDIA GTX 1050 / AMD Radeon RX 560 |
| Màn hình | 1366 × 768 px | 1920 × 1080 px |
| Kết nối mạng | Ethernet 100 Mbps / Wi-Fi 802.11ac | Ethernet 1 Gbps / Wi-Fi 6 |

### 4.1.2. Yêu cầu phần mềm

| Công cụ | Phiên bản | Ghi chú |
|---|---|---|
| Java (JDK) | 17 | Backend |
| Spring Boot | 3.2.0 | Framework backend |
| Maven | 3.8+ | Build tool |
| MySQL | 8.0 | Cơ sở dữ liệu |
| Node.js | 18.x LTS / 20.x LTS | Runtime cho Angular |
| Angular CLI | 17.0.0 | Framework frontend |
| IntelliJ IDEA / VS Code / Cursor | Bản mới nhất | IDE phát triển |
| MySQL Workbench | 8.0 | Quản trị CSDL |
| Postman | 10.x | Kiểm thử API |
| Google Gemini API Key | — | Tích hợp AI chatbot |

### 4.1.3. Công nghệ sử dụng

Hệ thống **Quản lý Đồ án Khoá luận** được xây dựng trên kiến trúc **Spring Boot Microservices** kết hợp giao diện **Angular 17 Single Page Application (SPA)**, sử dụng các công nghệ hiện đại và phổ biến trong ngành phát triển phần mềm. Toàn bộ mã nguồn được tổ chức trong một repository với hai thư mục chính: `backend/` và `frontend/`.

**Phía Backend** sử dụng:

- **Java 17** — Ngôn ngữ lập trình chính, đảm bảo tính tương thích dài hạn và hiệu suất cao.
- **Spring Boot 3.x** — Framework khung chính, cung cấp sẵn các module như Spring Security, Spring Data JPA, Spring Web MVC. Cấu hình được tự động hóa thông qua các annotation `@Configuration`, giảm đáng kể mã boilerplate.
- **Spring Security 6.x** — Xác thực và phân quyền người dùng. Hệ thống sử dụng **JWT (JSON Web Token)** với thuật toán HMAC-SHA256 để tạo token không trạng thái (stateless), kết hợp **BCrypt** để mã hoá mật khẩu. Mỗi request HTTP đều phải qua `JwtAuthenticationFilter` để xác thực trước khi vào tầng xử lý nghiệp vụ.
- **Spring Data JPA** — Tầng truy xuất dữ liệu, ánh xạ quan hệ đối tượng-lớp (ORM) với MySQL 8.0.
- **MySQL 8.0** — Hệ quản trị cơ sở dữ liệu quan hệ, lưu trữ toàn bộ dữ liệu nghiệp vụ của hệ thống.
- **Spring AI + Google Gemini API** — Tích hợp AI để gợi ý đề tài đồ án thông minh. `GeminiChatService` sử dụng `ChatClient` của Spring AI để gọi Gemini 1.5 Flash qua HTTPS REST.
- **Apache POI 5.x** — Thư viện đọc/ghi file Excel (.xlsx), phục vụ chức năng import điểm bảo vệ hàng loạt từ file Excel.
- **Lombok** — Giảm mã lặp bằng các annotation như `@Data`, `@Builder`, `@RequiredArgsConstructor`.
- **Maven** — Công cụ quản lý dependency và build.

**Phía Frontend** sử dụng:

- **Angular 17** — Framework giao diện chính, tất cả component đều được triển khai theo mô hình **Standalone Component** (không dùng NgModule truyền thống), giúp giảm độ phức tạp và tăng tính module hoá.
- **TypeScript** — Ngôn ngữ lập trình cho Angular, kiểm tra kiểu tĩnh giúp phát hiện lỗi sớm.
- **Bootstrap 5.x** — Framework CSS chính để xây dựng bố cục responsive, hệ thống lưới (grid), và các component giao diện có sẵn (card, modal, table, form).
- **ng2-charts (Chart.js)** — Thư viện biểu đồ tích hợp Angular, phục vụ các biểu đồ tròn (doughnut) và biểu đồ cột (bar) trên trang dashboard.
- **ngx-toastr** — Thông báo người dùng dạng toast (thành công, lỗi, cảnh báo).
- **RxJS** — Xử lý bất đồng bộ (async) trong Angular thông qua Observable và Subject.

**Công cụ phát triển:**

- **IntelliJ IDEA** — IDE chính để phát triển backend Java.
- **Visual Studio Code / Cursor IDE** — IDE chính để phát triển frontend Angular.
- **MySQL Workbench** — Công cụ quản trị cơ sở dữ liệu trực quan.
- **Postman** — Công cụ kiểm thử API REST.

### 4.1.2. Cấu hình hệ thống

Bảng dưới đây tổng hợp các thông số cấu hình chính của hệ thống:

| Thành phần | Thông số | Giá trị |
|---|---|---|
| Cổng Backend | `server.port` | 8080 |
| Database | `spring.datasource.url` | jdbc:mysql://localhost:3306/quan_ly_do_an_khoa |
| Driver | `spring.datasource.driver-class-name` | com.mysql.cj.jdbc.Driver |
| JPA Provider | `spring.jpa.database-platform` | org.hibernate.dialect.MySQL8Dialect |
| JWT Secret | `jwt.secret` | Giá trị được cấu hình trong `.env` |
| JWT Expiration | `jwt.expiration` | 86400000 ms (= 24 giờ) |
| CORS Frontend | Allowed Origins | http://localhost:4200, :4201, :4202 |
| Upload Directory | `file.upload-dir` | ./uploads/ |
| Gemini API | Spring AI Endpoint | model = gemini-1.5-flash |

---

## 4.2. Kiến trúc hệ thống

### 4.2.1. Kiến trúc tổng quan

Hệ thống được thiết kế theo mô hình **3 tầng (Three-Tier Architecture)** phân tách rõ ràng giữa tầng giao diện người dùng (Presentation Layer), tầng xử lý nghiệp vụ (Business Logic Layer), và tầng lưu trữ dữ liệu (Data Layer). Hai tầng đầu giao tiếp qua giao thức **HTTP/REST JSON**, tầng sau sử dụng **Spring Data JPA** để truy vấn MySQL.

**Mô hình kiến trúc tổng quan:**

```
┌─────────────────────────────────────────────────────────────────┐
│                  TẦNG TRÌNH DIỄN (PRESENTATION)                 │
│  Angular 17 SPA — Material Symbols Icons + Bootstrap 5.x CSS     │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐ │
│  │ Admin Portal  │  │ Bộ môn      │  │ Giảng viên Portal   │ │
│  │  Dashboard    │  │  Dashboard   │  │  Dashboard           │ │
│  │  CRUD GV/SV  │  │  Duyệt đề tài│  │  Chấm điểm HD/PB   │ │
│  │  Báo cáo     │  │  Phân công   │  │  Báo cáo tiến độ   │ │
│  │  Thống kê    │  │  Hội đồng    │  │                      │ │
│  └──────────────┘  └──────────────┘  └──────────────────────┘ │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐ │
│  │ Sinh viên Portal         │  │ Landing Page (Public)      │ │
│  │  Đăng ký đề tài          │  │  AI Chatbot (Gemini)       │ │
│  │  Nộp báo cáo             │  │  Thông báo công khai      │ │
│  │  Xem kết quả             │  │  9 bước quy trình         │ │
│  └──────────────────────────┘  └──────────────────────────────┘ │
│                                                                 │
│  AuthService (JWT token management) — HttpClient                 │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP/REST JSON
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                 TẦNG XỬ LÝ NGHIỆP VỤ (BUSINESS)                 │
│                 Spring Boot 3.x + Spring Security 6               │
│                                                                  │
│  Controllers (REST API endpoints)                               │
│  ├── AuthController        POST /api/auth/login, /register       │
│  ├── AdminController       GET/POST/PUT/DELETE /api/admin/**    │
│  ├── BoMonController       GET/PUT /api/bo-mon/**               │
│  ├── SinhVienController    GET/POST /api/sinh-vien/**           │
│  ├── GiangVienController   GET/PUT /api/giang-vien/**           │
│  ├── ChatbotController     POST /api/chatbot/**                 │
│  ├── ImportController      POST /api/admin/import/**            │
│  ├── ThongBaoController    CRUD /api/admin/thong-bao, /public/** │
│  └── FileController        GET /api/files/download               │
│                                                                  │
│  Services (Business Logic Layer)                                  │
│  ├── AuthService           — Đăng nhập, đăng ký, JWT           │
│  ├── AdminService         — CRUD Khoa/Bộ môn/GV/SV, Dashboard  │
│  ├── BoMonService         — Duyệt, phân công, hội đồng, điểm   │
│  ├── SinhVienService      — Đăng ký, nộp báo cáo, kết quả     │
│  ├── GiangVienService     — Hướng dẫn, phản biện, BC tiến độ  │
│  ├── GeminiChatService    — Gọi Gemini API → gợi ý đề tài AI   │
│  ├── ImportExcelService   — Import điểm bảo vệ từ Excel        │
│  ├── ThongBaoService      — CRUD thông báo                       │
│  └── DiemBaoVeService     — Chấm & cập nhật điểm bảo vệ        │
│                                                                  │
│  Security Layer                                                  │
│  ├── SecurityConfig        CORS, filter chain, permitAll paths   │
│  ├── JwtAuthenticationFilter Xác thực JWT mỗi request            │
│  ├── JwtTokenProvider       Sinh & xác thực JWT                  │
│  └── BCryptPasswordEncoder Mã hoá mật khẩu                     │
└──────────────────────────────┬──────────────────────────────────┘
                               │ Spring Data JPA
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      TẦNG DỮ LIỆU (DATA)                        │
│                                                                  │
│  MySQL 8.0 — 18 bảng                                             │
│  ├── tai_khoan          Tài khoản đăng nhập (email, password, role)│
│  ├── khoa               Khoa                                    │
│  ├── bo_mon             Bộ môn (FK: khoa_id)                    │
│  ├── giang_vien         Giảng viên (FK: tai_khoan_id, bo_mon_id)│
│  ├── sinh_vien          Sinh viên (FK: tai_khoan_id, bo_mon_id) │
│  ├── dot_dang_ky       Đợt đăng ký                             │
│  ├── de_tai             Đề tài (FK: dot, sinh_vien, giang_vien_du_kien,...) │
│  ├── phan_cong_huong_dan Phân công hướng dẫn (FK: de_tai, giang_vien)│
│  ├── phan_cong_phan_bien Phân công phản biện (FK: de_tai, giang_vien)│
│  ├── bao_cao            Báo cáo cuối kỳ (FK: de_tai)           │
│  ├── diem_huong_dan     Điểm hướng dẫn (FK: de_tai)            │
│  ├── diem_phan_bien     Điểm phản biện (FK: de_tai)            │
│  ├── hoi_dong_bao_ve    Hội đồng bảo vệ (FK: de_tai)          │
│  ├── thanh_vien_hoi_dong Thành viên hội đồng (FK: hoi_dong, giang_vien)│
│  ├── diem_bao_ve        Điểm bảo vệ từng thành viên (FK: hoi_dong, giang_vien)│
│  ├── dot_bao_cao_tien_do Đợt báo cáo tiến độ (FK: giang_vien)  │
│  ├── bao_cao_tien_do    Báo cáo tiến độ (FK: dot, de_tai)      │
│  └── thong_bao           Thông báo                               │
│                                                                  │
│  File Storage — ./uploads/ (báo cáo cuối kỳ, báo cáo tiến độ) │
└──────────────────────────────────────────────────────────────────┘
```

### 4.2.2. Quan hệ giữa các bảng (Entity Relationships)

Hệ thống sử dụng 18 bảng trong MySQL với các mối quan hệ được thiết kế theo nghiệp vụ thực tế của quy trình quản lý đồ án. Bảng dưới đây mô tả chi tiết các mối quan hệ:

| Quan hệ | Kiểu | Khóa ngoại | Ràng buộc |
|---|---|---|---|
| Khoa → BoMon | 1 : N | `khoa_id` (trong `bo_mon`) | FK NULL |
| BoMon → GiangVien | 1 : N | `bo_mon_id` (trong `giang_vien`) | FK NULL |
| BoMon → SinhVien | 1 : N | `bo_mon_id` (trong `sinh_vien`) | FK NULL |
| TaiKhoan → GiangVien | 1 : 1 | `tai_khoan_id` (trong `giang_vien`) UNIQUE | CASCADE ALL |
| TaiKhoan → SinhVien | 1 : 1 | `tai_khoan_id` (trong `sinh_vien`) UNIQUE | CASCADE ALL |
| DotDangKy → DeTai | 1 : N | `dot_dang_ky_id` (trong `de_tai`) | FK NULL |
| SinhVien → DeTai | 1 : N | `sinh_vien_id` (trong `de_tai`) | FK NULL |
| DeTai → GiangVien (dự kiến) | N : 1 | `giang_vien_du_kien_id` (trong `de_tai`) | FK NULL |
| DeTai → PhanCongHuongDan | 1 : 1 | `de_tai_id` (trong `phan_cong_huong_dan`) UNIQUE | CASCADE ALL |
| DeTai → PhanCongPhanBien | 1 : 1 | `de_tai_id` (trong `phan_cong_phan_bien`) UNIQUE | CASCADE ALL |
| DeTai → BaoCao | 1 : 1 | `de_tai_id` (trong `bao_cao`) UNIQUE | CASCADE ALL |
| DeTai → DiemHuongDan | 1 : 1 | `de_tai_id` (trong `diem_huong_dan`) UNIQUE | CASCADE ALL |
| DeTai → DiemPhanBien | 1 : 1 | `de_tai_id` (trong `diem_phan_bien`) UNIQUE | CASCADE ALL |
| DeTai → HoiDongBaoVe | 1 : 1 | `de_tai_id` (trong `hoi_dong_bao_ve`) UNIQUE | CASCADE ALL |
| DeTai → BaoCaoTienDo | 1 : N | `de_tai_id` (trong `bao_cao_tien_do`) | FK NOT NULL |
| PhanCongHuongDan → GiangVien | N : 1 | `giang_vien_id` (trong `phan_cong_huong_dan`) | FK NULL |
| PhanCongPhanBien → GiangVien | N : 1 | `giang_vien_id` (trong `phan_cong_phan_bien`) | FK NULL |
| HoiDongBaoVe → ThanhVienHoiDong | 1 : N | `hoi_dong_id` (trong `thanh_vien_hoi_dong`) | FK NOT NULL |
| ThanhVienHoiDong → GiangVien | N : 1 | `giang_vien_id` (trong `thanh_vien_hoi_dong`) | FK NULL |
| HoiDongBaoVe → DiemBaoVe | 1 : N | `hoi_dong_id` (trong `diem_bao_ve`) | FK NOT NULL |
| DiemBaoVe → GiangVien | N : 1 | `giang_vien_id` (trong `diem_bao_ve`) | FK NULL |
| DotBaoCaoTienDo → GiangVien | N : 1 | `giang_vien_id` (trong `dot_bao_cao_tien_do`) | FK NOT NULL |
| DotBaoCaoTienDo → BaoCaoTienDo | 1 : N | `dot_bao_cao_tien_do_id` (trong `bao_cao_tien_do`) | FK NULL |

### 4.2.3. Kiến trúc bảo mật

Hệ thống bảo mật được xây dựng trên nền tảng **Spring Security 6.x** với các đặc điểm:

**JWT Authentication Flow:**
1. Người dùng gửi `POST /api/auth/login` với `{email, password}`.
2. `AuthenticationManager` xác thực thông qua `DaoAuthenticationProvider` — so sánh password đã hash BCrypt với password người dùng nhập.
3. Nếu thành công, `JwtTokenProvider.generateToken(email)` tạo JWT chứa email (subject) và thời hạn 24 giờ.
4. Token được trả về client dưới dạng `{token: "Bearer xxx", ...}`.
5. Mọi request tiếp theo đều mang header `Authorization: Bearer <token>`.
6. `JwtAuthenticationFilter` chặn mọi request, giải mã token, xác thực user, và thiết lập `SecurityContext`.
7. `@PreAuthorize("hasRole('ADMIN')")` kiểm tra quyền trước khi xử lý controller.

**Role-based Access Control (RBAC):**

| Vai trò | Role trong DB | Quyền truy cập |
|---|---|---|
| Quản trị viên | `ADMIN` | Toàn bộ API `/api/admin/**` |
| Lãnh đạo Bộ môn | `LANH_DAO_BO_MON` | `/api/bo-mon/**` |
| Giảng viên | `GIANG_VIEN` | `/api/giang-vien/**` |
| Sinh viên | `SINH_VIEN` | `/api/sinh-vien/**` |
| Công khai | (không cần đăng nhập) | `/api/auth/**`, `/api/public/**`, `/api/chatbot/**`, `/api/files/**` |

**CORS Configuration:** Backend cho phép origin `http://localhost:4200, :4201, :4202` (Angular dev server), với các method `GET, POST, PUT, DELETE, PATCH, OPTIONS` và header `Authorization, Content-Type, X-Requested-With`. Credential cookies được hỗ trợ.

---

## 4.3. Giao diện hệ thống

### 4.3.1. Trang chủ (Landing Page)

Trang chủ là giao diện công khai dành cho mọi đối tượng, bao gồm cả khách vãng lai chưa đăng nhập. Trang được thiết kế theo phong cách hiện đại với bố cục full-page, sử dụng Bootstrap 5.x grid và Material Symbols làm bộ icon chuẩn.

**Các khu vực chính của Landing Page:**

- **Header**: Logo Trường Đại học Mỏ - Địa Chất ở góc trái, nút "Đăng nhập / Đăng xuất" ở góc phải. Nếu người dùng đã đăng nhập, hiển thị thêm vai trò và tên người dùng.
- **Hero Section**: Nền tảng xanh gradient với tiêu đề "Quản lý đồ án tốt nghiệp cho khoa CNTT", phụ đề mô tả hệ thống, và hình ảnh minh hoạ.
- **Chatbot AI (FAB)**: Nút tròn nổi ở góc dưới bên phải màn hình. Khi click, mở ra một panel chat cho phép sinh viên nhập mô tả đề tài mong muốn (ví dụ: "web bán hàng sử dụng React"). Hệ thống gọi Google Gemini API qua Spring AI và trả về 5 đề tài gợi ý với tên, mô tả, công nghệ đề xuất, và đánh giá thực tiễn. Panel có nút đóng, thanh cuộn, và các message bubble xanh (user) / trắng (AI).
- **Thông báo công khai**: Lưới 4 card thông báo, mỗi card có icon, ngày đăng, tiêu đề, và nút "Xem chi tiết" mở modal toàn bộ nội dung. Icon và màu nền card được luân chuyển qua 4 biến thể (thông báo, cảnh báo, thành công, sự kiện).
- **Quy trình 9 bước**: Section trình bày toàn bộ workflow đồ án dưới dạng 9 card ngang: (1) Tạo đợt đăng ký → (2) SV đăng ký đề tài → (3) Duyệt đề tài → (4) Phân công GVHD → (5) Thực hiện → (6) Theo dõi → (7) Phản biện → (8) Lập hội đồng → (9) Bảo vệ.
- **Footer**: Logo trường, tên trường, địa chỉ, số điện thoại, email liên hệ.

### 4.3.2. Trang Dashboard

Hệ thống cung cấp 4 dashboard riêng biệt cho 4 nhóm người dùng, mỗi dashboard tập trung vào các chỉ số và thao tác phù hợp với vai trò.

**Admin Dashboard** (`/admin`):
- 4 summary card ở đầu trang: Tổng số Giảng viên, Tổng số Sinh viên, Tổng số Đề tài, Đề tài chờ duyệt — mỗi card có icon, số liệu lớn, và liên kết "Xem chi tiết".
- Biểu đồ doughnut (Chart.js) phân bổ trạng thái đề tài: đang chờ, đang thực hiện, hoàn thành, không đạt.
- Lưới 4 tile màu thể hiện 4 trạng thái đề tài chính.

**Lãnh đạo Bộ môn Dashboard** (`/bo-mon`):
- 4 card thống kê: Tổng đề tài, Giảng viên, Sinh viên, Hội đồng.
- 3 alert card điều hướng: SV cần phân công HD (màu vàng), SV cần phân công PB (màu xanh dương), SV cần lập hội đồng (màu đỏ).
- Biểu đồ cột (Chart.js) thống kê điểm trung bình theo 3 giai đoạn: Điểm HD, Điểm PB, Điểm BV — kèm bảng chi tiết điểm cao nhất/thấp nhất/trung bình.
- Nút hành động nhanh: Phân công HD, Phân công PB, Lập hội đồng.

**Giảng viên Dashboard** (`/giang-vien`):
- 4 card đếm: SV chờ duyệt (badge), SV đang hướng dẫn, SV phản biện (badge), Hội đồng bảo vệ.
- Thanh alert về đợt báo cáo tiến độ đang mở: tên đợt, ngày bắt đầu, số SV đã nộp, badge trạng thái (Đang mở/Đã đóng).
- Panel điểm chờ chấm: danh sách SV chưa chấm điểm HD, danh sách SV chưa chấm điểm PB — mỗi dòng có badge số lượng.

**Sinh viên Dashboard** (`/sinh-vien`):
- Banner trạng thái đề tài: tên trạng thái (badge màu), tên đề tài, tên GVHD, tên Bộ môn. Nếu chưa đăng ký hiển thị nút "Đăng ký ngay".
- 3 card điểm số cạnh nhau: Điểm Hướng dẫn, Điểm Phản biện, Điểm Bảo vệ — mỗi card hiển thị số điểm lớn, ngày chấm, nhận xét (nếu có), badge Đạt/Không đạt.
- Card lịch bảo vệ: ngày giờ, địa điểm (nếu đã được lập hội đồng).

### 4.3.3. Giao diện quản trị (Admin)

Giao diện quản trị bao gồm 11 màn hình chính, tất cả đều có header chung "QUẢN TRỊ HỆ THỐNG" và bố cục layout sidebar điều hướng.

**Quản lý Đề tài** (`/admin/de-tai`): Bảng danh sách đề tài chờ duyệt với filter theo Bộ môn. Mỗi dòng có checkbox chọn nhiều, nút "Xem chi tiết" mở modal hiển thị đầy đủ thông tin sinh viên và đề tài. Nút "Gửi lên Bộ môn" ở đầu bảng để gửi hàng loạt. Nếu không có đề tài nào chờ duyệt, hiển thị trạng thái rỗng.

**Quản lý Giảng viên** (`/admin/giang-vien`): Bảng danh sách với filter Bộ môn và tìm kiếm theo tên. Các cột: Họ tên, Học vị, Email, Bộ môn, Lãnh đạo BM (checkbox), Trạng thái tài khoản. Thao tác: Thêm mới (modal form), Sửa, Xoá, Toggle Lãnh đạo BM, Khóa/Mở tài khoản, Import từ Excel (modal upload file hiển thị số thành công/số lỗi).

**Quản lý Sinh viên** (`/admin/sinh-vien`): Tương tự quản lý giảng viên. Thêm cột Mã sinh viên, Lớp. Modal Thêm/Sửa bao gồm: Mã SV, Họ tên, Lớp, Email, Mật khẩu, Bộ môn. Import Excel hỗ trợ các cột `masv` / `masinhvien`, `hoten`, `email`, `lop`, `bomon`.

**Quản lý Bộ môn** (`/admin/bo-mon`): Lưới card hiển thị theo dạng 3 cột, mỗi card có tên, mã, số giảng viên, số sinh viên. Modal Thêm/Sửa gồm: Tên Bộ môn, Mã Bộ môn.

**Quản lý Đợt đăng ký** (`/admin/dot-dang-ky`): Bảng đợt đăng ký với cột: Tên đợt, Năm học, Học kỳ, Ngày bắt đầu, Ngày kết thúc, Trạng thái (Đang mở badge xanh / Đã kết thúc badge đỏ), Số lượng đăng ký. Modal Tạo/Edit gồm: Tên đợt, Năm học, Học kỳ (HK1/HK2/HK3), Ngày bắt đầu, Ngày kết thúc. Các nút hành động: Đóng đợt, Mở lại, Sửa, Xoá.

**Quản lý Thông báo** (`/admin/thong-bao`): Bảng thông báo với tiêu đề, nội dung rút gọn, ngày đăng, trạng thái hiển thị (switch toggle). Modal Tạo/Sửa gồm: Tiêu đề, Nội dung textarea, Toggle hiển thị/ẩn.

**Thống kê Tổng hợp** (`/admin/thong-ke`): Filter theo Đợt đăng ký và Bộ môn. Bảng toàn bộ đề tài với đầy đủ cột: Đợt, Sinh viên, Mã SV, Lớp, Bộ môn, Đề tài, GVHD, GVPB, Trạng thái. Nút "Chi tiết" mở modal 4 phần: Thông tin SV, Thông tin đề tài, Thông tin giảng viên, Điểm số (HD, PB, từng thành viên HĐ, tổng BV). Nút Export Excel tải toàn bộ dữ liệu.

**Quản lý Điểm** (`/admin/quan-ly-diem`): Filter theo Bộ môn và tìm kiếm. Bảng: Sinh viên, Mã SV, Lớp, Bộ môn, Đề tài, Điểm HD, Điểm PB, Điểm từng thành viên HĐ (Chủ tịch/Thư ký/Ủy viên), Tổng điểm BV. Export Excel.

**Danh sách Đợt đăng ký** (`/admin/danh-sach-dot-dang-ky`): Bảng danh sách đợt (clickable rows). Khi click một đợt, hiển thị bên dưới: 3 summary card (Tổng, Đã đăng ký, Chưa đăng ký), bảng 2 cột — cột trái: danh sách SV đã đăng ký, cột phải: danh sách SV chưa đăng ký.

### 4.3.4. Giao diện Bộ môn (Lãnh đạo)

**Duyệt Đề tài** (`/bo-mon/duyet-de-tai`): Bảng đề tài chờ duyệt với đầy đủ thông tin: sinh viên, mã, lớp, tên đề tài, GV dự kiến. Nút "Duyệt" với confirmation modal (nội dung: "Bạn có chắc chắn muốn duyệt đề tài này?"), nút "Từ chối" với modal nhập lý do từ chối.

**Phân công Hướng dẫn** (`/bo-mon/phan-cong`): Bảng sinh viên đang thực hiện hoặc chờ GV duyệt lại. Mỗi dòng có dropdown chọn giảng viên và nút "Phân công". Hệ thống tự động chuyển trạng thái đề tài sang `CHO_GV_DUYET` sau khi phân công.

**Phân công Phản biện** (`/bo-mon/phan-cong-phan-bien`): Bảng đề tài đã đạt GVHD, filter `DAT_GVHD`. Mỗi dòng có dropdown GV phản biện và nút "Phân công". Sau khi phân công, trạng thái chuyển sang `CHO_PHAN_BIEN`.

**Lập Hội đồng** (`/bo-mon/hoi-dong`): Bảng đề tài đã đạt phản biện, filter `DAT_PHAN_BIEN`. Modal lập hội đồng gồm: Ngày bảo vệ (input date), Địa điểm, và 3 dòng thành viên — mỗi dòng có dropdown giảng viên và select vai trò (Chủ tịch / Thư ký / Ủy viên).

**Danh sách Hội đồng** (`/bo-mon/danh-sach-hoi-dong`): Collapsible accordion card, mỗi card đại diện cho một đề tài, hiển thị sinh viên, đề tài, ngày, địa điểm. Khi expand hiển thị danh sách 3 thành viên với vai trò.

**Danh sách GVHD / GVPB** (`/bo-mon/danh-sach-gvhd`, `/danh-sach-gvpb`): Accordion nhóm theo tên giảng viên. Header: tên GV + số SV được phân công. Body: bảng con gồm Mã SV, Lớp, Đề tài, Trạng thái.

**Bảng Đề tài Bộ môn** (`/bo-mon/de-tai`): Giao diện tab với 3 tab: **Đang thực hiện** (nhiều trạng thái), **Hoàn thành**, **Không đạt** (3 loại: do HD, do PB, do BV). Mỗi dòng hiển thị: sinh viên, mã, lớp, đề tài, đợt, badge trạng thái, icon báo cáo (nếu đã nộp). Modal chi tiết hiển thị toàn bộ thông tin đề tài và điểm số. Modal báo cáo hiển thị ngày nộp và nút tải file.

**Chấm điểm Bảo vệ** (`/bo-mon/cham-diem-bao-ve`): Bảng hội đồng: Sinh viên, Đề tài, Ngày, Địa điểm, Trạng thái, Điểm, nút Sửa. Modal nhập điểm gồm 3 input (0–10) cho Chủ tịch, Thư ký, Ủy viên, và textarea Nhận xét. Nút Import Excel để nhập điểm hàng loạt.

**Import Điểm BV** (`/bo-mon/import-diem-bao-ve`): Nút "Tải template Excel" và nút "Upload file". Card hướng dẫn giải thích cấu trúc file Excel: cột MSV, Họ tên SV, Đề tài, Điểm Chủ tịch, Điểm Thư ký, Điểm Ủy viên, Nhận xét.

### 4.3.5. Giao diện Giảng viên

**Duyệt Hướng dẫn** (`/giang-vien/huong-dan/duyet`): Bảng sinh viên chờ duyệt với đầy đủ thông tin và nút Duyệt / Từ chối. Sau khi duyệt, trạng thái đề tài chuyển sang `DANG_THUC_HIEN`. Sau khi từ chối, phân công bị xoá và trạng thái chuyển sang `CHO_GV_DUYET_LAI`.

**Danh sách SV được HD** (`/giang-vien/huong-dan/danh-sach`): Bảng sinh viên đã được duyệt, nút Chi tiết mở modal hiển thị đầy đủ thông tin đề tài.

**Chấm điểm HD** (`/giang-vien/huong-dan/cham-diem`): Bảng SV với cột Điểm (hiển thị màu xanh nếu đã chấm, vàng nếu chưa). Mỗi dòng có nút "Chấm điểm" mở rộng form inline gồm: input số điểm (0–10), textarea nhận xét, nút Lưu và Hủy. Nếu điểm ≥ 5 → trạng thái `DAT_GVHD`; điểm < 5 → `KHONG_DAT_GVHD`.

**Phản biện — Danh sách** (`/giang-vien/phan-bien/danh-sach`): Bảng đề tài được phân công phản biện, cột Điểm, Trạng thái, nút Chi tiết.

**Phản biện — Chấm điểm** (`/giang-vien/phan-bien/cham-diem`): Tương tự chấm điểm HD, điểm ≥ 5 → `DAT_PHAN_BIEN`, điểm < 5 → `KHONG_DAT_PHAN_BIEN`.

**Hội đồng BV** (`/giang-vien/hoi-dong/danh-sach`): Bảng hội đồng mà GV tham gia (với vai trò thành viên). Nút "Xem thành viên" mở modal chi tiết.

**Báo cáo Tiến độ** (`/giang-vien/bao-cao-tien-do`): Hai sub-page:
- **Tạo đợt**: Bảng đợt hiện có, nút Tạo đợt mới (modal: tên, ngày bắt đầu, ngày kết thúc), toggle Mở/Đóng, nút Xoá.
- **Danh sách**: Accordion nhóm theo sinh viên, mỗi dòng hiển thị đợt BC, ngày nộp, trạng thái, nút Tải file. Modal Nhận xét: textarea nội dung, select trạng thái, nút Lưu.

**Xem Báo cáo** (`/giang-vien/bao-cao`): Bảng sinh viên đã nộp báo cáo cuối kỳ, cột Ngày nộp, Trạng thái, nút Xem chi tiết mở modal với thông tin SV, đề tài, ngày nộp, và nút Tải file.

### 4.3.6. Giao diện Sinh viên

**Đăng ký Đề tài** (`/sinh-vien/de-tai/dang-ky`): Form đăng ký gồm: dropdown chọn Đợt đăng ký (chỉ hiện đợt đang mở), input Tên đề tài, dropdown Giảng viên dự kiến (lọc theo Bộ môn của SV), textarea Nội dung dự kiến, input Công nghệ sử dụng. Nút "Đăng ký" có confirmation. Sau khi đăng ký, form thay bằng trạng thái hiển thị đề tài đã đăng ký. Nếu bị từ chối, hiển thị lý do và nút "Đăng ký lại" mở modal pre-filled dữ liệu cũ.

**Nộp Báo cáo** (`/sinh-vien/nop-bao-cao`): Form upload file (`.doc`, `.docx`, `.pdf`, `.zip`, `.rar`, `.7z`). Cảnh báo "Bạn chỉ được nộp một lần duy nhất, hãy kiểm tra kỹ trước khi nộp!". Sau khi nộp, hiển thị thông tin: ngày nộp, tên file, nút Tải lại file.

**Báo cáo Tiến độ** (`/sinh-vien/bao-cao-tien-do`): Hiển thị các đợt BC mà SV có thể nộp: card thông tin đợt (tên, GVHD, ngày bắt đầu, deadline, badge trạng thái), nút "Nộp báo cáo" mở modal: textarea Nội dung, upload file tùy chọn, nút Nộp. Bảng lịch sử: Đợt, Ngày nộp, Trạng thái, Nhận xét, nút Tải file.

**Kết quả** (`/sinh-vien/ket-qua`): 3 card cạnh nhau, mỗi card hiển thị: tiêu đề (Điểm Hướng dẫn / Phản biện / Bảo vệ), số điểm lớn (màu theo đạt/không), ngày chấm, nhận xét, badge Đạt (xanh)/Không đạt (đỏ). Nếu chưa có điểm, hiển thị "Chưa có kết quả".

**Lịch Bảo vệ** (`/sinh-vien/lich-bao-ve`): Thông tin đề tài, ngày bảo vệ, địa điểm, danh sách thành viên hội đồng (mỗi người hiển thị: họ tên, học vị, vai trò trong hội đồng). Nếu chưa có lịch, hiển thị "Chưa có lịch bảo vệ".

---

## 4.4. Các chức năng chính

### 4.4.1. Quản lý người dùng và phân quyền

Hệ thống hỗ trợ 4 vai trò người dùng với luồng đăng nhập tập trung qua `AuthController`.

**Đăng nhập:** Người dùng nhập email và mật khẩu tại giao diện đăng nhập (nằm trong Landing Page). Backend xác thực thông qua `AuthenticationManager`, tạo JWT và trả về token cùng thông tin user (id, email, role, Bộ môn nếu có). Frontend lưu token vào `localStorage` và gắn vào mọi request qua `HttpInterceptor`.

**Đăng ký:** Admin có thể đăng ký giảng viên hoặc sinh viên mới. Mỗi lần đăng ký đều tạo đồng thời một bản ghi `TaiKhoan` và bản ghi `GiangVien` hoặc `SinhVien` liên kết 1-1. Import hàng loạt từ Excel cho phép upload một file `.xlsx` chứa danh sách giảng viên hoặc sinh viên — hệ thống tự tạo tài khoản với mật khẩu mặc định `123456` và báo lỗi chi tiết theo dòng cho các bản ghi không hợp lệ (trùng email, thiếu cột bắt buộc).

**Phân quyền Lãnh đạo Bộ môn:** Admin có thể toggle vai trò Lãnh đạo Bộ môn cho một giảng viên. Khi bật, role trong bảng `TaiKhoan` tự động chuyển từ `GIANG_VIEN` sang `LANH_DAO_BO_MON`, giảng viên đó có quyền truy cập thêm toàn bộ API `/api/bo-mon/**`.

**Khóa/Mở tài khoản:** Admin có thể khóa bất kỳ tài khoản nào. Khi bị khóa (`trang_thai = false`), `CustomUserDetailsService` trả về tài khoản bị disabled và Spring Security từ chối đăng nhập.

### 4.4.2. Quản lý đợt đăng ký

**Tạo đợt:** Admin nhập tên đợt, năm học, học kỳ, ngày bắt đầu và kết thúc. Đợt mới được tạo với trạng thái mặc định `DANG_MO`.

**Đóng/Mở lại:** Admin có thể đóng đợt đăng ký khi hết thời gian hoặc mở lại nếu cần điều chỉnh. Sinh viên chỉ có thể đăng ký đề tài trong các đợt có trạng thái `DANG_MO`.

**Xem danh sách SV:** Mỗi đợt hiển thị số SV đã đăng ký, số SV chưa đăng ký. Danh sách chia làm 2 cột: SV đã đăng ký và SV chưa đăng ký — giúp Admin dễ dàng theo dõi tiến độ.

### 4.4.3. Đăng ký và duyệt đề tài

**Luồng đăng ký của Sinh viên:**
1. SV chọn đợt đăng ký đang mở.
2. Nhập tên đề tài, chọn GV dự kiến (filter theo Bộ môn của SV), nhập nội dung và công nghệ.
3. Hệ thống tạo bản ghi `DeTai` với trạng thái `CHO_DUYET`.
4. SV không thể đăng ký thêm nếu đã có đề tài ở trạng thái hoạt động.

**Luồng duyệt của Admin:**
1. Admin xem danh sách đề tài chờ duyệt.
2. Có thể duyệt từng đề tài hoặc chọn nhiều và gửi hàng loạt lên Bộ môn.
3. Khi gửi lên Bộ môn, trạng thái chuyển thành `DA_GUI_BO_MON` / `CHO_BO_MON_DUYET`.

**Luồng duyệt của Lãnh đạo Bộ môn:**
1. Lãnh đạo xem đề tài được gửi lên.
2. Duyệt → trạng thái `DANG_THUC_HIEN` (chờ phân công GVHD).
3. Từ chối → trạng thái `BI_TU_CHOI`, SV nhìn thấy lý do và có thể đăng ký lại với cùng bản ghi hoặc tạo mới.

### 4.4.4. Phân công hướng dẫn và phản biện

**Phân công GVHD:**
1. Lãnh đạo Bộ môn chọn giảng viên từ dropdown cho từng sinh viên.
2. Hệ thống tạo bản ghi `PhanCongHuongDan` với trạng thái `CHO_DUYET`.
3. Trạng thái đề tài chuyển sang `CHO_GV_DUYET`.
4. GV đăng nhập, xem danh sách SV chờ duyệt, chọn Duyệt hoặc Từ chối.
5. Duyệt → trạng thái `DUYET`, đề tài chuyển sang `DANG_THUC_HIEN`.
6. Từ chối → bản ghi `PhanCongHuongDan` bị xóa, trạng thái `CHO_GV_DUYET_LAI`, Lãnh đạo phải phân công lại.

**Phân công GV Phản biện:**
1. Sau khi đề tài có trạng thái `DAT_GVHD`, Lãnh đạo chọn GV phản biện.
2. Hệ thống tạo `PhanCongPhanBien`.
3. Trạng thái đề tài chuyển sang `CHO_PHAN_BIEN`.

### 4.4.5. Lập hội đồng bảo vệ

1. Lãnh đạo Bộ môn chọn đề tài đã đạt phản biện (`DAT_PHAN_BIEN`).
2. Nhập ngày bảo vệ, địa điểm.
3. Thêm 3 thành viên: mỗi thành viên chọn giảng viên và vai trò (Chủ tịch / Thư ký / Ủy viên).
4. Hệ thống tạo `HoiDongBaoVe` và 3 bản ghi `ThanhVienHoiDong`.
5. Trạng thái đề tài chuyển sang `DANG_BAO_VE`.

### 4.4.6. Chấm điểm và tính điểm tổng

**Điểm Hướng dẫn:** GVHD nhập điểm (0–10) và nhận xét cho từng SV được phân công. Điểm ≥ 5 → đạt, trạng thái `DAT_GVHD`. Điểm < 5 → không đạt, trạng thái `KHONG_DAT_GVHD`.

**Điểm Phản biện:** GV phản biện nhập điểm và nhận xét. Điểm ≥ 5 → đạt, trạng thái `DAT_PHAN_BIEN`. Điểm < 5 → không đạt, trạng thái `KHONG_DAT_PHAN_BIEN`.

**Điểm Bảo vệ:** Lãnh đạo nhập điểm cho 3 thành viên hội đồng (mỗi người 0–10). Có thể nhập thủ công từng dòng hoặc **Import từ Excel** — file Excel có cấu trúc: MSV, Họ tên, Đề tài, Điểm Chủ tịch, Điểm Thư ký, Điểm Ủy viên, Nhận xét. Apache POI đọc file, tìm SV theo MSV, tìm hội đồng theo đề tài, tìm thành viên theo vai trò, và lưu vào bảng `DiemBaoVe`.

**Công thức tính điểm tổng bảo vệ:**

Khi cả điểm hội đồng và điểm phản biện đã có:
```
Điểm Tổng BV = (Tổng điểm 3 thành viên HĐ + Điểm PB) / (3 + 1)
```
Điểm Tổng BV ≥ 5 → Hoàn thành; < 5 → Không đạt bảo vệ.

### 4.4.7. Báo cáo tiến độ

**GV tạo đợt BC tiến độ:** Nhập tên đợt (ví dụ: "Báo cáo tiến độ tháng 3"), ngày bắt đầu, ngày kết thúc. Mỗi đợt thuộc về một GVHD cụ thể.

**SV nộp BC tiến độ:** Chỉ hiển thị các đợt đang mở và thuộc GVHD đang hướng dẫn SV đó. SV nhập nội dung mô tả tiến độ và upload file tùy ý. Mỗi SV chỉ nộp tối đa 1 lần cho mỗi đợt.

**GV nhận xét BC tiến độ:** Accordion hiển thị tất cả SV được HD, mỗi SV hiển thị các đợt BC. GV nhập nhận xét và chọn trạng thái (Chờ nhận xét / Đã nhận xét / Từ chối). SV xem được nhận xét trên dashboard.

### 4.4.8. Tích hợp AI gợi ý đề tài

Chatbot AI được tích hợp trên Landing Page thông qua `GeminiChatService` sử dụng Spring AI `ChatClient`.

**Luồng hoạt động:**
1. SV nhập mô tả mong muốn vào panel chat (ví dụ: "tôi muốn làm website bán hàng online sử dụng React và Node.js").
2. Frontend gửi `POST /api/chatbot/goi-y-de-tai` với body `{message: "..."}`.
3. Backend gọi Gemini 1.5 Flash qua Spring AI với system prompt yêu cầu trả về JSON định dạng chuẩn.
4. Gemini trả về danh sách 5 đề tài, mỗi đề tài gồm: `tenDeTai`, `noiDungDuKien`, `congNgheSuDung`, `danhGiaThucTe`.
5. Backend parse JSON, trả về cho frontend hiển thị dạng message bubble.
6. Nếu Gemini trả JSON có markdown code block, hệ thống tự động strip ` ```json ` và ` ``` ` trước khi parse.

### 4.4.9. Thông báo công khai

Admin tạo thông báo với tiêu đề, nội dung, và trạng thái hiển thị. Thông báo có trạng thái `true` (hiển thị) sẽ xuất hiện trên Landing Page ở section Thông báo. Thông báo có trạng thái `false` sẽ bị ẩn. Admin có thể toggle trạng thái mà không cần xóa.

### 4.4.10. Thống kê và xuất báo cáo

**Admin Dashboard:** Tổng quan toàn hệ thống — số lượng GV, SV, đề tài, đề tài chờ duyệt.

**Bộ môn Dashboard:** Thống kê điểm trung bình theo 3 giai đoạn (HD, PB, BV) với biểu đồ cột Chart.js và bảng chi tiết: điểm cao nhất, thấp nhất, trung bình.

**Thống kê Tổng hợp:** Filter theo đợt đăng ký và Bộ môn, xem toàn bộ đề tài kèm điểm chi tiết từng giai đoạn.

**Export Excel:** Sử dụng Apache POI tạo file `.xlsx` chuẩn với header style (in đậm, nền xanh, border), set độ rộng cột tự động, và dữ liệu chính xác từ database.

---

## 4.5. Kiểm thử hệ thống

### 4.5.1. Các kịch bản kiểm thử chức năng

Bảng dưới đây mô tả các kịch bản kiểm thử chính theo từng chức năng, bao gồm đầu vào, thao tác, kết quả mong đợi và kết quả thực tế.

**4.5.1.1. Kiểm thử chức năng Đăng nhập**

| ID | Kịch bản | Đầu vào | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| TC_01 | Đăng nhập thành công | Email và password hợp lệ | Click "Đăng nhập" | Chuyển hướng đến Dashboard tương ứng với vai trò, JWT token được lưu | Đạt |
| TC_02 | Sai password | Email đúng, password sai | Click "Đăng nhập" | Hiển thị thông báo lỗi "Sai email hoặc mật khẩu" | Đạt |
| TC_03 | Tài khoản bị khóa | Email tài khoản đã bị Admin khóa | Click "Đăng nhập" | Hiển thị thông báo "Tài khoản đã bị khóa" | Đạt |
| TC_04 | Token hết hạn | JWT token đã hết hạn (24 giờ) | Gửi request API bất kỳ | Server trả 401 Unauthorized | Đạt |

**4.5.1.2. Kiểm thử chức năng Quản lý Đợt đăng ký**

| ID | Kịch bản | Đầu vào | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| TC_05 | Tạo đợt mới thành công | Tên đợt, năm học, HK1, ngày hợp lệ | Click "Tạo mới" | Đợt xuất hiện trong bảng, trạng thái "Đang mở" | Đạt |
| TC_06 | Tạo đợt trùng tên | Tên đợt đã tồn tại | Click "Tạo mới" | Thông báo lỗi validation | Đạt |
| TC_07 | Đóng đợt đăng ký | Đợt đang mở | Click "Đóng đợt" | Trạng thái chuyển sang "Đã kết thúc", SV không thể đăng ký | Đạt |
| TC_08 | Mở lại đợt đã đóng | Đợt đã kết thúc | Click "Mở lại" | Trạng thái chuyển về "Đang mở", SV có thể đăng ký | Đạt |

**4.5.1.3. Kiểm thử chức năng Đăng ký Đề tài (Sinh viên)**

| ID | Kịch bản | Đầu vào | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| TC_09 | Đăng ký thành công | Đầy đủ thông tin đề tài | Click "Đăng ký" | Bản ghi DeTai được tạo, trạng thái `CHO_DUYET`, hiển thị trên dashboard SV | Đạt |
| TC_10 | Đăng ký khi đợt đã đóng | Đợt có trạng thái KET_THUC | Click "Đăng ký" | Thông báo lỗi "Đợt đăng ký đã kết thúc" | Đạt |
| TC_11 | Đăng ký khi đã có đề tài | SV đã có đề tài ở trạng thái hoạt động | Click "Đăng ký" | Thông báo lỗi "Sinh viên đã đăng ký đề tài rồi" | Đạt |
| TC_12 | Đăng ký lại sau khi bị từ chối | Đề tài có trạng thái BI_TU_CHOI | Click "Đăng ký lại" | Bản ghi DeTai cũ được cập nhật, trạng thái về `CHO_DUYET` | Đạt |

**4.5.1.4. Kiểm thử chức năng Duyệt Đề tài (Bộ môn)**

| ID | Kịch bản | Đầu vào | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| TC_13 | Duyệt đề tài thành công | Đề tài ở trạng thái CHO_BO_MON_DUYET | Click "Duyệt" | Trạng thái chuyển sang `DANG_THUC_HIEN` | Đạt |
| TC_14 | Từ chối đề tài kèm lý do | Đề tài hợp lệ | Click "Từ chối", nhập lý do | Trạng thái `BI_TU_CHOI`, SV nhìn thấy lý do | Đạt |
| TC_15 | Gửi nhiều đề tài lên Bộ môn | Chọn 5 đề tài trong bảng | Click "Gửi lên Bộ môn" | Cả 5 đề tài chuyển trạng thái `DA_GUI_BO_MON` | Đạt |

**4.5.1.5. Kiểm thử chức năng Phân công Hướng dẫn**

| ID | Kịch bản | Đầu vào | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| TC_16 | Phân công GVHD thành công | Chọn giảng viên từ dropdown | Click "Phân công" | Bản ghi `PhanCongHuongDan` được tạo, trạng thái `CHO_GV_DUYET` | Đạt |
| TC_17 | GV duyệt tiếp nhận HD | Phân công ở trạng thái CHO_DUYET | Click "Duyệt" | Trạng thái PC → `DUYET`, đề tài → `DANG_THUC_HIEN` | Đạt |
| TC_18 | GV từ chối HD | Phân công ở trạng thái CHO_DUYET | Click "Từ chối" | Bản ghi PC bị xóa, đề tài → `CHO_GV_DUYET_LAI` | Đạt |

**4.5.1.6. Kiểm thử chức năng Chấm điểm**

| ID | Kịch bản | Đầu vào | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| TC_19 | Chấm điểm HD ≥ 5 | Điểm = 7.5 | Click "Lưu" | Điểm lưu, trạng thái `DAT_GVHD`, đề tài → `DAT_GVHD` | Đạt |
| TC_20 | Chấm điểm HD < 5 | Điểm = 3.0 | Click "Lưu" | Điểm lưu, trạng thái `KHONG_DAT_GVHD`, đề tài → `KHONG_DAT_GVHD` | Đạt |
| TC_21 | Nhập điểm BV từ Excel hợp lệ | File .xlsx đúng định dạng | Upload file | 3 điểm được lưu vào bảng `DiemBaoVe` | Đạt |
| TC_22 | Tính điểm tổng khi đủ HD + PB + BV | HD=8, PB=7, BV tổng=18 (3×6) | Tự động | Điểm Tổng = (18+7)/4 = 6.25, ≥ 5 → Hoàn thành | Đạt |

**4.5.1.7. Kiểm thử chức năng Báo cáo Tiến độ**

| ID | Kịch bản | Đầu vào | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| TC_23 | GV tạo đợt BC tiến độ | Tên, ngày hợp lệ | Click "Tạo" | Đợt mới xuất hiện trong bảng | Đạt |
| TC_24 | SV nộp BC khi đợt đang mở | Nội dung + file | Click "Nộp" | Bản ghi `BaoCaoTienDo` được tạo | Đạt |
| TC_25 | SV nộp BC khi đợt đã đóng | Nội dung | Click "Nộp" | Thông báo lỗi "Đợt báo cáo đã đóng" | Đạt |
| TC_26 | SV nộp 2 lần cho cùng đợt | Lần 2 | Click "Nộp" | Thông báo lỗi "Bạn đã nộp rồi" | Đạt |
| TC_27 | GV nhận xét BC tiến độ | Nhận xét text | Click "Lưu" | Nhận xét được lưu, hiển thị cho SV | Đạt |

**4.5.1.8. Kiểm thử chức năng Chatbot AI**

| ID | Kịch bản | Đầu vào | Thao tác | Kết quả mong đợi | Kết quả thực tế |
|---|---|---|---|---|---|
| TC_28 | Gọi chatbot với input hợp lệ | "web bán hàng React" | Gửi tin nhắn | Nhận về 5 đề tài gợi ý dạng JSON | Đạt |
| TC_29 | Gemini trả markdown code block | Gemini trả ` ```json ... ``` ` | Gửi tin nhắn | Hệ thống strip markdown, parse JSON thành công | Đạt |
| TC_30 | API key không hợp lệ | Khóa API sai | Gửi tin nhắn | Hiển thị "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu" | Đạt (fallback message) |

### 4.5.2. Kiểm thử giao diện (UI/UX)

| Tiêu chí | Chi tiết | Kết quả |
|---|---|---|
| Responsive | Giao diện hiển thị đúng trên desktop (1920px), laptop (1366px), tablet (768px) | Đạt |
| Material Symbols | Tất cả icon hiển thị đúng, không có icon bị mất | Đạt |
| Bootstrap Modals | Mọi modal mở/đóng đúng, không bị scroll body khi modal mở | Đạt |
| Toast notifications | Thông báo thành công/lỗi hiển thị đúng vị trí góc trên phải | Đạt |
| Form validation | Không submit được khi thiếu trường bắt buộc, hiển thị thông báo lỗi | Đạt |
| Loading states | Hiển thị spinner/loading khi gọi API | Đạt |
| Empty states | Hiển thị thông báo phù hợp khi không có dữ liệu | Đạt |
| Charts | Biểu đồ doughnut và bar hiển thị đúng dữ liệu, responsive | Đạt |

### 4.5.3. Kiểm thử bảo mật

| Tiêu chí | Chi tiết | Kết quả |
|---|---|---|
| JWT không trạng thái | Mỗi request đều phải có token hợp lệ trong header | Đạt |
| RBAC — Admin | Tài khoản GV không thể truy cập `/api/admin/**` | Đạt |
| RBAC — Bộ môn | Tài khoản SV không thể truy cập `/api/bo-mon/**` | Đạt |
| RBAC — Giảng viên | Tài khoản GV không thể duyệt đề tài của Bộ môn khác | Đạt (qua boMonId filter) |
| BCrypt password | Password trong DB là hash, không đọc được dạng plain text | Đạt |
| CORS | Request từ origin không được whitelist bị từ chối | Đạt |
| File upload | Chỉ chấp nhận định dạng `.doc, .docx, .pdf, .zip, .rar, .7z` | Đạt |

### 4.5.4. Kiểm thử hiệu năng

| Chỉ số | Ngưỡng mong đợi | Kết quả thực tế |
|---|---|---|
| Thời gian phản hồi API — Đăng nhập | < 500ms | ~150ms |
| Thời gian phản hồi API — Lấy danh sách đề tài (1000 bản ghi) | < 1 giây | ~300ms |
| Thời gian phản hồi API — Chatbot Gemini | < 5 giây | ~2–3 giây |
| Thời gian tải trang Dashboard (Angular lazy loading) | < 2 giây | ~800ms |
| Dung lượng file JAR build | < 100 MB | ~45 MB |
| Import Excel 100 dòng | < 5 giây | ~2 giây |

---

## 4.6. Đánh giá kết quả

### 4.6.1. Các chức năng đã hoàn thành

Tất cả các chức năng theo yêu cầu đều đã được triển khai và kiểm thử thành công:

- **Hệ thống xác thực và phân quyền**: JWT + BCrypt + RBAC hoạt động đúng theo thiết kế, 4 vai trò được phân tách rõ ràng.
- **Quản lý người dùng**: CRUD đầy đủ cho giảng viên và sinh viên, import hàng loạt từ Excel, khóa/mở tài khoản.
- **Quản lý đợt đăng ký**: Tạo, đóng, mở lại, theo dõi tiến độ đăng ký theo từng đợt.
- **Quy trình đăng ký và duyệt đề tài**: Luồng end-to-end từ SV đăng ký → Admin duyệt → Bộ môn duyệt → GVHD duyệt hoàn chỉnh.
- **Phân công hướng dẫn và phản biện**: Hệ thống hỗ trợ GV từ chối và phân công lại.
- **Lập hội đồng bảo vệ**: Quản lý 3 thành viên với vai trò cố định.
- **Chấm điểm đa giai đoạn**: Điểm HD, PB, BV được chấm độc lập, điểm tổng tự động tính theo công thức.
- **Import điểm từ Excel**: Tự động hoá nhập điểm hội đồng hàng loạt.
- **Báo cáo tiến độ**: GV tạo đợt, SV nộp, GV nhận xét — hoàn toàn không cần giấy tờ.
- **Tích hợp AI**: Chatbot Gemini gợi ý đề tài hoạt động ổn định.
- **Thống kê và xuất báo cáo**: Dashboard tổng quan, biểu đồ Chart.js, export Excel.
- **Giao diện người dùng**: 40 màn hình với thiết kế nhất quán, responsive, thông báo rõ ràng.

### 4.6.2. Hạn chế và hướng phát triển

Một số hạn chế được nhận diện và đề xuất hướng phát triển:

1. **Giới hạn file upload**: Hiện tại chỉ hỗ trợ `.doc, .docx, .pdf, .zip, .rar, .7z`. Có thể mở rộng hỗ trợ thêm định dạng `.pptx`, `.xlsx` và giới hạn dung lượng tối đa cho mỗi file.

2. **Không có module phân công tự động**: Việc phân công GVHD hiện tại là thủ công. Có thể phát triển thuật toán phân công tự động dựa trên số lượng SV đang HD, chuyên môn GV, và sở thích của SV.

3. **Chatbot AI chỉ gợi ý đề tài**: Có thể mở rộng chatbot để trả lời các câu hỏi thường gặp (FAQ) về quy trình, thông báo, và hướng dẫn sử dụng hệ thống.

4. **Không có notification realtime**: Hiện tại SV/GV phải refresh trang để thấy cập nhật. Có thể tích hợp WebSocket hoặc Server-Sent Events (SSE) để gửi thông báo real-time khi có thay đổi trạng thái đề tài.

5. **Không có module gửi email tự động**: Có thể tích hợp SMTP để gửi email thông báo cho SV khi đề tài được duyệt, bị từ chối, hoặc khi có lịch bảo vệ.

6. **Lịch sử thay đổi**: Không lưu lại log thay đổi trạng thái đề tài theo thời gian. Có thể thêm bảng `LichSuThayDoi` để theo dõi toàn bộ lịch sử.

7. **Chưa có kiểm thử tự động (Unit Test)**: Hiện tại hệ thống kiểm thử thủ công. Cần bổ sung JUnit 5 + Mockito cho backend và Jasmine/Karma cho frontend để đảm bảo chất lượng mã nguồn dài hạn.

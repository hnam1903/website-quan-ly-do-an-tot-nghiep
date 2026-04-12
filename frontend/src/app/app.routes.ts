import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'dot-dang-ky', loadComponent: () => import('./features/admin/dot-dang-ky/dot-dang-ky.component').then(m => m.DotDangKyComponent) },
      { path: 'de-tai', loadComponent: () => import('./features/admin/de-tai/de-tai.component').then(m => m.DeTaiComponent) },
      { path: 'bo-mon', loadComponent: () => import('./features/admin/bo-mon/bo-mon.component').then(m => m.BoMonComponent) },
      { path: 'giang-vien', loadComponent: () => import('./features/admin/giang-vien/giang-vien.component').then(m => m.GiangVienComponent) },
      { path: 'sinh-vien', loadComponent: () => import('./features/admin/sinh-vien/sinh-vien.component').then(m => m.SinhVienComponent) },
      { path: 'thong-ke', loadComponent: () => import('./features/admin/thong-ke/thong-ke.component').then(m => m.ThongKeComponent) }
    ]
  },
  {
    path: 'bo-mon',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'LANH_DAO_BO_MON'] },
    loadComponent: () => import('./layouts/bo-mon-layout/bo-mon-layout.component').then(m => m.BoMonLayoutComponent),
    children: [
      { path: '', redirectTo: 'de-tai', pathMatch: 'full' },
      { path: 'duyet-de-tai', loadComponent: () => import('./features/bo-mon/duyet-de-tai/duyet-de-tai.component').then(m => m.DuyetDeTaiComponent) },
      { path: 'de-tai', loadComponent: () => import('./features/bo-mon/de-tai/de-tai.component').then(m => m.DeTaiBoMonComponent) },
      { path: 'sinh-vien', loadComponent: () => import('./features/bo-mon/sinh-vien/sinh-vien.component').then(m => m.SinhVienBoMonComponent) },
      { path: 'giang-vien', loadComponent: () => import('./features/bo-mon/giang-vien/giang-vien.component').then(m => m.GiangVienBoMonComponent) },
      { path: 'phan-cong', loadComponent: () => import('./features/bo-mon/phan-cong/phan-cong.component').then(m => m.PhanCongComponent) },
      { path: 'danh-sach-gvhd', loadComponent: () => import('./features/bo-mon/danh-sach-gvhd/danh-sach-gvhd.component').then(m => m.DanhSachGvhdComponent) },
      { path: 'danh-sach-gvpb', loadComponent: () => import('./features/bo-mon/danh-sach-gvpb/danh-sach-gvpb.component').then(m => m.DanhSachGvpbComponent) },
      { path: 'hoi-dong', redirectTo: 'hoi-dong/thanh-lap', pathMatch: 'full' },
      {
        path: 'hoi-dong',
        children: [
          { path: 'thanh-lap', loadComponent: () => import('./features/bo-mon/hoi-dong/hoi-dong.component').then(m => m.HoiDongComponent) },
          { path: 'danh-sach', loadComponent: () => import('./features/bo-mon/danh-sach-hoi-dong/danh-sach-hoi-dong.component').then(m => m.DanhSachHoiDongComponent) },
          { path: 'cham-diem', loadComponent: () => import('./features/bo-mon/cham-diem-bao-ve/cham-diem-bao-ve.component').then(m => m.ChamDiemBaoVeComponent) },
          { path: 'import-diem', loadComponent: () => import('./features/bo-mon/import-diem-bao-ve/import-diem-bao-ve.component').then(m => m.ImportDiemBaoVeComponent) }
        ]
      },
      { path: 'phan-cong-phan-bien', loadComponent: () => import('./features/bo-mon/phan-cong-phan-bien/phan-cong-phan-bien.component').then(m => m.PhanCongPhanBienBmComponent) },
      { path: 'hoi-dong', loadComponent: () => import('./features/bo-mon/hoi-dong/hoi-dong.component').then(m => m.HoiDongComponent) },
      { path: 'gv-huong-dan', redirectTo: 'gv-huong-dan/duyet', pathMatch: 'full' },
      {
        path: 'gv-huong-dan',
        children: [
          { path: 'duyet', loadComponent: () => import('./features/giang-vien/huong-dan/duyet-huong-dan.component').then(m => m.DuyetHuongDanComponent) },
          { path: 'danh-sach', loadComponent: () => import('./features/giang-vien/huong-dan/danh-sach-huong-dan.component').then(m => m.DanhSachHuongDanComponent) },
          { path: 'cham-diem', loadComponent: () => import('./features/giang-vien/huong-dan/cham-diem-huong-dan.component').then(m => m.ChamDiemHuongDanComponent) }
        ]
      },
      { path: 'gv-phan-bien', redirectTo: 'gv-phan-bien/danh-sach', pathMatch: 'full' },
      {
        path: 'gv-phan-bien',
        children: [
          { path: 'danh-sach', loadComponent: () => import('./features/giang-vien/phan-bien/danh-sach-phan-bien.component').then(m => m.DanhSachPhanBienComponent) },
          { path: 'cham-diem', loadComponent: () => import('./features/giang-vien/phan-bien/cham-diem-phan-bien.component').then(m => m.ChamDiemPhanBienComponent) }
        ]
      },
      {
        path: 'gv-hoi-dong',
        children: [
          { path: 'danh-sach', loadComponent: () => import('./features/giang-vien/hoi-dong/danh-sach-bao-ve.component').then(m => m.DanhSachBaoVeComponent) }
        ]
      },
      { path: 'bao-cao', loadComponent: () => import('./features/giang-vien/bao-cao/bao-cao.component').then(m => m.BaoCaoGvComponent) }
    ]
  },
  {
    path: 'giang-vien',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['GIANG_VIEN'] },
    loadComponent: () => import('./layouts/giang-vien-layout/giang-vien-layout.component').then(m => m.GiangVienLayoutComponent),
    children: [
      { path: '', redirectTo: 'huong-dan/duyet', pathMatch: 'full' },
      {
        path: 'huong-dan',
        children: [
          { path: '', redirectTo: 'duyet', pathMatch: 'full' },
          { path: 'duyet', loadComponent: () => import('./features/giang-vien/huong-dan/duyet-huong-dan.component').then(m => m.DuyetHuongDanComponent) },
          { path: 'danh-sach', loadComponent: () => import('./features/giang-vien/huong-dan/danh-sach-huong-dan.component').then(m => m.DanhSachHuongDanComponent) },
          { path: 'cham-diem', loadComponent: () => import('./features/giang-vien/huong-dan/cham-diem-huong-dan.component').then(m => m.ChamDiemHuongDanComponent) }
        ]
      },
      {
        path: 'phan-bien',
        children: [
          { path: '', redirectTo: 'danh-sach', pathMatch: 'full' },
          { path: 'danh-sach', loadComponent: () => import('./features/giang-vien/phan-bien/danh-sach-phan-bien.component').then(m => m.DanhSachPhanBienComponent) },
          { path: 'cham-diem', loadComponent: () => import('./features/giang-vien/phan-bien/cham-diem-phan-bien.component').then(m => m.ChamDiemPhanBienComponent) }
        ]
      },
      { path: 'hoi-dong', redirectTo: 'hoi-dong/danh-sach', pathMatch: 'full' },
      {
        path: 'hoi-dong',
        children: [
          { path: 'danh-sach', loadComponent: () => import('./features/giang-vien/hoi-dong/danh-sach-bao-ve.component').then(m => m.DanhSachBaoVeComponent) }
        ]
      },
      { path: 'bao-cao', loadComponent: () => import('./features/giang-vien/bao-cao/bao-cao.component').then(m => m.BaoCaoGvComponent) }
    ]
  },
  {
    path: 'sinh-vien',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN', 'SINH_VIEN'] },
    loadComponent: () => import('./layouts/sinh-vien-layout/sinh-vien-layout.component').then(m => m.SinhVienLayoutComponent),
    children: [
      { path: '', redirectTo: 'de-tai', pathMatch: 'full' },
      { path: 'de-tai', loadComponent: () => import('./features/sinh-vien/de-tai/de-tai.component').then(m => m.DeTaiSvComponent) },
      { path: 'lich-bao-ve', loadComponent: () => import('./features/sinh-vien/lich-bao-ve/lich-bao-ve.component').then(m => m.LichBaoVeComponent) },
      { path: 'nop-bao-cao', loadComponent: () => import('./features/sinh-vien/nop-bao-cao/nop-bao-cao.component').then(m => m.NopBaoCaoComponent) },
      { path: 'ket-qua', loadComponent: () => import('./features/sinh-vien/ket-qua/ket-qua.component').then(m => m.KetQuaComponent) }
    ]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];

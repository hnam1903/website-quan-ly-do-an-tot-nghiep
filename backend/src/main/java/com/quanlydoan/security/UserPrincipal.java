package com.quanlydoan.security;

import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;
import com.quanlydoan.entity.TaiKhoan;
import java.util.Collection;

@Getter
public class UserPrincipal extends User {

    private final Long userId;
    private final String role;

    public UserPrincipal(String email, String password, Collection<? extends GrantedAuthority> authorities,
                        Long userId, String role) {
        super(email, password, authorities);
        this.userId = userId;
        this.role = role;
    }

    public static UserPrincipal create(TaiKhoan taiKhoan) {
        return new UserPrincipal(
                taiKhoan.getEmail(),
                taiKhoan.getPassword(),
                taiKhoan.getRole().name().equals("ADMIN") ? 
                    java.util.Collections.singleton(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")) :
                    java.util.Collections.singleton(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + taiKhoan.getRole().name())),
                taiKhoan.getId(),
                taiKhoan.getRole().name()
        );
    }
}

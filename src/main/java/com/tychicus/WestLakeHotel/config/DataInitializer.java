package com.tychicus.WestLakeHotel.config;

import com.tychicus.WestLakeHotel.Model.Role;
import com.tychicus.WestLakeHotel.Repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    public CommandLineRunner initRoles(RoleRepository roleRepository) {
        return args -> {
            // Nếu vai trò "ROLE_USER" không tồn tại, tạo nó
            if (!roleRepository.existsByName("ROLE_USER")) {
                Role userRole = new Role();
                userRole.setName("ROLE_USER");
                roleRepository.save(userRole);
                System.out.println("Đã tạo vai trò ROLE_USER");
            }

            // Nếu vai trò "ROLE_ADMIN" không tồn tại, tạo nó
            if (!roleRepository.existsByName("ROLE_ADMIN")) {
                Role adminRole = new Role();
                adminRole.setName("ROLE_ADMIN");
                roleRepository.save(adminRole);
                System.out.println("Đã tạo vai trò ROLE_ADMIN");
            }
        };
    }
}

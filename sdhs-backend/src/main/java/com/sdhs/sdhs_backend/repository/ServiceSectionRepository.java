package com.sdhs.sdhs_backend.repository;

import com.sdhs.sdhs_backend.entity.ServiceSection;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceSectionRepository extends JpaRepository<ServiceSection, Long> {

    List<ServiceSection> findByActiveTrueOrderByDisplayOrderAsc();
}
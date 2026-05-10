package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.entity.ServiceSection;
import com.sdhs.sdhs_backend.repository.ServiceSectionRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/service-sections")
public class ServiceSectionController {

    private final ServiceSectionRepository serviceSectionRepository;

    public ServiceSectionController(ServiceSectionRepository serviceSectionRepository) {
        this.serviceSectionRepository = serviceSectionRepository;
    }

    @GetMapping
    public List<ServiceSection> getActiveServiceSections() {
        return serviceSectionRepository.findByActiveTrueOrderByDisplayOrderAsc();
    }
}
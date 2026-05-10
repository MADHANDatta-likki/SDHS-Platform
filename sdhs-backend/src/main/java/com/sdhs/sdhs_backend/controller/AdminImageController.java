package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.dto.ImageCreateRequest;
import com.sdhs.sdhs_backend.entity.ImagePlacement;
import com.sdhs.sdhs_backend.entity.SiteImage;
import com.sdhs.sdhs_backend.repository.ImagePlacementRepository;
import com.sdhs.sdhs_backend.repository.SiteImageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/admin/images")
public class AdminImageController {

    private final SiteImageRepository siteImageRepository;
    private final ImagePlacementRepository imagePlacementRepository;

    public AdminImageController(
            SiteImageRepository siteImageRepository,
            ImagePlacementRepository imagePlacementRepository) {
        this.siteImageRepository = siteImageRepository;
        this.imagePlacementRepository = imagePlacementRepository;
    }

    @PostMapping
    public ResponseEntity<?> createImage(@RequestBody ImageCreateRequest request) {

        SiteImage image = new SiteImage();
        image.setTitle(request.getTitle());
        image.setDescription(request.getDescription());
        image.setImageUrl(request.getImageUrl());
        image.setStoragePath(request.getStoragePath());
        image.setUploadedBy(request.getUploadedBy());
        image.setActive(true);
        image.setCreatedAt(LocalDateTime.now());

        image = siteImageRepository.save(image);

        if (request.getPlacements() != null) {
            for (ImageCreateRequest.PlacementDTO p : request.getPlacements()) {
                ImagePlacement placement = new ImagePlacement();
                placement.setImageId(image.getImageId());
                placement.setPlacementArea(p.getPlacementArea());
                placement.setPlacementKey(p.getPlacementKey());
                placement.setRelatedEntityType(p.getRelatedEntityType());
                placement.setRelatedEntityId(p.getRelatedEntityId());
                placement.setDisplayOrder(p.getDisplayOrder() == null ? 0 : p.getDisplayOrder());
                placement.setActive(true);
                placement.setCreatedAt(LocalDateTime.now());

                imagePlacementRepository.save(placement);
            }
        }

        return ResponseEntity.ok(image);
    }
}
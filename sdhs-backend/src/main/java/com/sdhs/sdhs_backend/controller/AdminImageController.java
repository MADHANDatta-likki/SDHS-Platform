package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.dto.AdminImageResponse;
import com.sdhs.sdhs_backend.dto.ImageCreateRequest;
import com.sdhs.sdhs_backend.dto.ImageUpdateRequest;
import com.sdhs.sdhs_backend.dto.PlacementUpdateRequest;
import com.sdhs.sdhs_backend.entity.ImagePlacement;
import com.sdhs.sdhs_backend.entity.SiteImage;
import com.sdhs.sdhs_backend.repository.ImagePlacementRepository;
import com.sdhs.sdhs_backend.repository.SiteImageRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

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

    @GetMapping
    public ResponseEntity<?> getImages() {
        List<AdminImageResponse> response = siteImageRepository.findAll()
                .stream()
                .sorted(Comparator.comparing(
                        SiteImage::getCreatedAt,
                        Comparator.nullsLast(Comparator.reverseOrder())
                ))
                .map(this::toResponse)
                .toList();

        return ResponseEntity.ok(response);
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
                if (imagePlacementRepository.existsByImageIdAndPlacementAreaAndPlacementKey(
                        image.getImageId(),
                        p.getPlacementArea(),
                        p.getPlacementKey()
                )) {
                    continue;
                }

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

    @PutMapping("/{imageId}")
    public ResponseEntity<?> updateImage(
            @PathVariable Long imageId,
            @RequestBody ImageUpdateRequest request
    ) {
        SiteImage image = siteImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        image.setTitle(request.getTitle());
        image.setDescription(request.getDescription());

        if (request.getActive() != null) {
            image.setActive(request.getActive());
        }

        return ResponseEntity.ok(toResponse(siteImageRepository.save(image)));
    }

    @PostMapping("/{imageId}/placements")
    public ResponseEntity<?> createPlacement(
            @PathVariable Long imageId,
            @RequestBody PlacementUpdateRequest request
    ) {
        siteImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (imagePlacementRepository.existsByImageIdAndPlacementAreaAndPlacementKey(
                imageId,
                request.getPlacementArea(),
                request.getPlacementKey()
        )) {
            return ResponseEntity.badRequest()
                    .body("This image is already assigned to that section.");
        }

        ImagePlacement placement = new ImagePlacement();
        placement.setImageId(imageId);
        applyPlacementRequest(placement, request);
        placement.setActive(request.getActive() == null || request.getActive());
        placement.setCreatedAt(LocalDateTime.now());

        imagePlacementRepository.save(placement);

        return ResponseEntity.ok(toResponse(
                siteImageRepository.findById(imageId)
                        .orElseThrow(() -> new RuntimeException("Image not found"))
        ));
    }

    @PatchMapping("/placements/{placementId}")
    public ResponseEntity<?> updatePlacement(
            @PathVariable Long placementId,
            @RequestBody PlacementUpdateRequest request
    ) {
        ImagePlacement placement = imagePlacementRepository.findById(placementId)
                .orElseThrow(() -> new RuntimeException("Placement not found"));

        applyPlacementRequest(placement, request);

        if (request.getActive() != null) {
            placement.setActive(request.getActive());
        }

        imagePlacementRepository.save(placement);

        return ResponseEntity.ok(toResponse(
                siteImageRepository.findById(placement.getImageId())
                        .orElseThrow(() -> new RuntimeException("Image not found"))
        ));
    }

    @DeleteMapping("/placements/{placementId}")
    public ResponseEntity<?> deletePlacement(@PathVariable Long placementId) {
        ImagePlacement placement = imagePlacementRepository.findById(placementId)
                .orElseThrow(() -> new RuntimeException("Placement not found"));

        Long imageId = placement.getImageId();
        imagePlacementRepository.delete(placement);

        return ResponseEntity.ok(toResponse(
                siteImageRepository.findById(imageId)
                        .orElseThrow(() -> new RuntimeException("Image not found"))
        ));
    }

    @DeleteMapping("/{imageId}")
    public ResponseEntity<?> deleteImage(@PathVariable Long imageId) {
        SiteImage image = siteImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Image not found"));

        if (imagePlacementRepository.countByImageId(imageId) > 0) {
            return ResponseEntity.badRequest()
                    .body("Remove all page placements before deleting this image metadata.");
        }

        siteImageRepository.delete(image);

        return ResponseEntity.ok("Image metadata deleted.");
    }

    private void applyPlacementRequest(
            ImagePlacement placement,
            PlacementUpdateRequest request
    ) {
        placement.setPlacementArea(request.getPlacementArea());
        placement.setPlacementKey(request.getPlacementKey());
        placement.setRelatedEntityType(request.getRelatedEntityType());
        placement.setRelatedEntityId(request.getRelatedEntityId());
        placement.setDisplayOrder(request.getDisplayOrder() == null ? 0 : request.getDisplayOrder());
    }

    private AdminImageResponse toResponse(SiteImage image) {
        List<AdminImageResponse.PlacementResponse> placements =
                imagePlacementRepository.findByImageIdOrderByDisplayOrderAsc(image.getImageId())
                        .stream()
                        .map(placement -> AdminImageResponse.PlacementResponse.builder()
                                .placementId(placement.getPlacementId())
                                .placementArea(placement.getPlacementArea())
                                .placementKey(placement.getPlacementKey())
                                .relatedEntityType(placement.getRelatedEntityType())
                                .relatedEntityId(placement.getRelatedEntityId())
                                .displayOrder(placement.getDisplayOrder())
                                .active(placement.getActive())
                                .createdAt(placement.getCreatedAt())
                                .build())
                        .toList();

        return AdminImageResponse.builder()
                .imageId(image.getImageId())
                .title(image.getTitle())
                .description(image.getDescription())
                .imageUrl(image.getImageUrl())
                .storagePath(image.getStoragePath())
                .uploadedBy(image.getUploadedBy())
                .active(image.getActive())
                .createdAt(image.getCreatedAt())
                .placements(placements)
                .build();
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        String message = ex.getMessage();

        if (message == null || message.isBlank()) {
            message = "Image request could not be processed.";
        }

        return ResponseEntity.badRequest().body(message);
    }
}

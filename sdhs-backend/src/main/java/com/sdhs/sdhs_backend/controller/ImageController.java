package com.sdhs.sdhs_backend.controller;

import com.sdhs.sdhs_backend.entity.ImagePlacement;
import com.sdhs.sdhs_backend.entity.SiteImage;
import com.sdhs.sdhs_backend.repository.ImagePlacementRepository;
import com.sdhs.sdhs_backend.repository.SiteImageRepository;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private final ImagePlacementRepository placementRepository;
    private final SiteImageRepository imageRepository;

    public ImageController(
            ImagePlacementRepository placementRepository,
            SiteImageRepository imageRepository) {
        this.placementRepository = placementRepository;
        this.imageRepository = imageRepository;
    }

    @GetMapping("/placement/{placementKey}")
    public List<SiteImage> getImagesByPlacement(@PathVariable String placementKey) {
        List<ImagePlacement> placements =
                placementRepository.findByPlacementKeyAndActiveTrueOrderByDisplayOrderAsc(placementKey);

        List<SiteImage> images = new ArrayList<>();

        for (ImagePlacement placement : placements) {
            imageRepository.findById(placement.getImageId())
                    .filter(image -> Boolean.TRUE.equals(image.getActive()))
                    .ifPresent(images::add);
        }

        return images;
    }
}
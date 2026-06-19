package com.sdhs.sdhs_backend.repository;

import com.sdhs.sdhs_backend.entity.ImagePlacement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImagePlacementRepository extends JpaRepository<ImagePlacement, Long> {

    List<ImagePlacement> findByPlacementKeyAndActiveTrueOrderByDisplayOrderAsc(
            String placementKey
    );

    List<ImagePlacement> findByImageIdOrderByDisplayOrderAsc(Long imageId);

    long countByImageId(Long imageId);

    boolean existsByImageIdAndPlacementAreaAndPlacementKey(
            Long imageId,
            String placementArea,
            String placementKey
    );
}

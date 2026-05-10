package com.sdhs.sdhs_backend.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ImageCreateRequest {

    private String title;
    private String description;
    private String imageUrl;
    private String storagePath;
    private String uploadedBy;
    private List<PlacementDTO> placements;

    @Getter
    @Setter
    public static class PlacementDTO {
        private String placementArea;
        private String placementKey;
        private String relatedEntityType;
        private Long relatedEntityId;
        private Integer displayOrder;
    }
}
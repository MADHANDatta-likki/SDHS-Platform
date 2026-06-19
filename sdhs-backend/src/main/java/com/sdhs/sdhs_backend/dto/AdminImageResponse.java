package com.sdhs.sdhs_backend.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class AdminImageResponse {

    private Long imageId;
    private String title;
    private String description;
    private String imageUrl;
    private String storagePath;
    private String uploadedBy;
    private Boolean active;
    private LocalDateTime createdAt;
    private List<PlacementResponse> placements;

    @Data
    @Builder
    public static class PlacementResponse {
        private Long placementId;
        private String placementArea;
        private String placementKey;
        private String relatedEntityType;
        private Long relatedEntityId;
        private Integer displayOrder;
        private Boolean active;
        private LocalDateTime createdAt;
    }
}

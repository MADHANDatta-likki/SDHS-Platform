package com.sdhs.sdhs_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PlacementUpdateRequest {

    private String placementArea;
    private String placementKey;
    private String relatedEntityType;
    private Long relatedEntityId;
    private Integer displayOrder;
    private Boolean active;
}

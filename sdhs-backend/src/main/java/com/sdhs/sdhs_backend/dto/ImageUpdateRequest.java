package com.sdhs.sdhs_backend.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ImageUpdateRequest {

    private String title;
    private String description;
    private Boolean active;
}

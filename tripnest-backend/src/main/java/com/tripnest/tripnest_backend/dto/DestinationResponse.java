package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DestinationResponse {
    private Integer id;
    private String name;
    private String country;
    private String description;
    private String weatherInfo;
    private Boolean isPopular;
}

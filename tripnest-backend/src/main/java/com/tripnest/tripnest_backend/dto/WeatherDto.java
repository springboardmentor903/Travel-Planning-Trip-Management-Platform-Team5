package com.tripnest.tripnest_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WeatherDto {
    private String destinationName;
    private Double temperature;
    private String condition;
    private Double windSpeed;
    private Integer humidity;
    private String weatherIcon;
    private String lastUpdated;
}

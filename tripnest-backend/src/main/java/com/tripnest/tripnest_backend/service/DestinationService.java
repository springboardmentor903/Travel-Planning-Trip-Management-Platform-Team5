package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.DestinationResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DestinationService {

    private final DestinationRepository destinationRepository;

    public List<DestinationResponse> getAllDestinations() {
        return destinationRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    public DestinationResponse getDestinationById(Integer id) {
        Destination destination = destinationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Destination not found with id: " + id));
        return mapToResponse(destination);
    }

    private DestinationResponse mapToResponse(Destination d) {
        return new DestinationResponse(
                d.getId(),
                d.getName(),
                d.getCountry(),
                d.getDescription(),
                d.getWeatherInfo(),
                d.getIsPopular()
        );
    }
}

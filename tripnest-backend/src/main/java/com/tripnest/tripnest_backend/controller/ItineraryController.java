package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.service.ItineraryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
@CrossOrigin(origins = "http://localhost:5173")
public class ItineraryController {

    private final ItineraryService itineraryService;

    public ItineraryController(
            ItineraryService itineraryService) {

        this.itineraryService = itineraryService;
    }

    @GetMapping
    public ResponseEntity<List<Itinerary>> getAllItineraries(
            Authentication authentication) {

        return ResponseEntity.ok(
                itineraryService.getAllItineraries(
                        authentication.getName())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Itinerary> getItineraryById(
            @PathVariable Integer id,
            Authentication authentication) {

        return ResponseEntity.ok(
                itineraryService.getItineraryById(
                        id,
                        authentication.getName())
        );
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Itinerary>>
    getItinerariesByTrip(
            @PathVariable Integer tripId,
            Authentication authentication) {

        return ResponseEntity.ok(
                itineraryService.getItinerariesByTripId(
                        tripId,
                        authentication.getName())
        );
    }

    @PostMapping
    public ResponseEntity<Itinerary> createItinerary(
            @RequestParam Integer tripId,
            @RequestParam Integer dayNumber,
            @RequestParam LocalDate dayDate,
            Authentication authentication) {

        Itinerary itinerary =
                itineraryService.createItinerary(
                        tripId,
                        dayNumber,
                        dayDate,
                        authentication.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(itinerary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Itinerary> updateItinerary(
            @PathVariable Integer id,
            @RequestParam Integer dayNumber,
            @RequestParam LocalDate dayDate,
            Authentication authentication) {

        return ResponseEntity.ok(
                itineraryService.updateItinerary(
                        id,
                        dayNumber,
                        dayDate,
                        authentication.getName())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItinerary(
            @PathVariable Integer id,
            Authentication authentication) {

        itineraryService.deleteItinerary(
                id,
                authentication.getName());

        return ResponseEntity.noContent().build();
    }
}
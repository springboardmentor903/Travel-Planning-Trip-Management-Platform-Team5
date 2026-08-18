package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.service.ItineraryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/itineraries")
@CrossOrigin(origins = "http://localhost:5173")
public class ItineraryController {

    private final ItineraryService itineraryService;

    public ItineraryController(ItineraryService itineraryService) {
        this.itineraryService = itineraryService;
    }

    @GetMapping
    public ResponseEntity<List<Itinerary>> getAllItineraries() {
        return ResponseEntity.ok(
                itineraryService.getAllItineraries()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Itinerary> getItineraryById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                itineraryService.getItineraryById(id)
        );
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<Itinerary>> getItinerariesByTrip(
            @PathVariable Integer tripId) {

        return ResponseEntity.ok(
                itineraryService.getItinerariesByTripId(tripId)
        );
    }

    @PostMapping
    public ResponseEntity<Itinerary> createItinerary(
            @RequestParam Integer tripId,
            @RequestParam Integer dayNumber,
            @RequestParam LocalDate dayDate) {

        Itinerary itinerary = itineraryService.createItinerary(
                tripId,
                dayNumber,
                dayDate
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(itinerary);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Itinerary> updateItinerary(
            @PathVariable Integer id,
            @RequestParam Integer dayNumber,
            @RequestParam LocalDate dayDate) {

        return ResponseEntity.ok(
                itineraryService.updateItinerary(
                        id,
                        dayNumber,
                        dayDate
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteItinerary(
            @PathVariable Integer id) {

        itineraryService.deleteItinerary(id);

        return ResponseEntity.noContent().build();
    }
}
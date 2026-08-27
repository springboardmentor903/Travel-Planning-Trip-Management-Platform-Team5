package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.entity.Activity;
import com.tripnest.tripnest_backend.service.ActivityService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/activities")
@CrossOrigin(origins = "http://localhost:5173")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(
            ActivityService activityService) {

        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<List<Activity>> getAllActivities(
            Authentication authentication) {

        return ResponseEntity.ok(
                activityService.getAllActivities(
                        authentication.getName())
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Activity> getActivityById(
            @PathVariable Integer id,
            Authentication authentication) {

        return ResponseEntity.ok(
                activityService.getActivityById(
                        id,
                        authentication.getName())
        );
    }

    @GetMapping("/itinerary/{itineraryId}")
    public ResponseEntity<List<Activity>>
    getActivitiesByItinerary(
            @PathVariable Integer itineraryId,
            Authentication authentication) {

        return ResponseEntity.ok(
                activityService.getActivitiesByItineraryId(
                        itineraryId,
                        authentication.getName())
        );
    }

    @PostMapping
    public ResponseEntity<Activity> createActivity(
            @RequestParam Integer itineraryId,
            @RequestParam String activityType,
            @RequestParam String name,
            @RequestParam(required = false)
            LocalTime startTime,
            @RequestParam(required = false)
            String location,
            @RequestParam(required = false)
            BigDecimal cost,
            Authentication authentication) {

        Activity activity =
                activityService.createActivity(
                        itineraryId,
                        activityType,
                        name,
                        startTime,
                        location,
                        cost,
                        authentication.getName());

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(activity);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Activity> updateActivity(
            @PathVariable Integer id,
            @RequestParam String activityType,
            @RequestParam String name,
            @RequestParam(required = false)
            LocalTime startTime,
            @RequestParam(required = false)
            String location,
            @RequestParam(required = false)
            BigDecimal cost,
            Authentication authentication) {

        return ResponseEntity.ok(
                activityService.updateActivity(
                        id,
                        activityType,
                        name,
                        startTime,
                        location,
                        cost,
                        authentication.getName())
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(
            @PathVariable Integer id,
            Authentication authentication) {

        activityService.deleteActivity(
                id,
                authentication.getName());

        return ResponseEntity.noContent().build();
    }
}
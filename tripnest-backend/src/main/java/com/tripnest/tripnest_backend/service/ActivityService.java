package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.entity.Activity;
import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.repository.ActivityRepository;
import com.tripnest.tripnest_backend.repository.ItineraryRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Service
public class ActivityService {

    private final ActivityRepository activityRepository;
    private final ItineraryRepository itineraryRepository;

    public ActivityService(
            ActivityRepository activityRepository,
            ItineraryRepository itineraryRepository) {
        this.activityRepository = activityRepository;
        this.itineraryRepository = itineraryRepository;
    }

    public List<Activity> getAllActivities() {
        return activityRepository.findAll();
    }

    public Activity getActivityById(Integer id) {
        return activityRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Activity not found with id: " + id));
    }

    public List<Activity> getActivitiesByItineraryId(Integer itineraryId) {
        return activityRepository
                .findByItineraryIdOrderByStartTimeAsc(itineraryId);
    }

    public Activity createActivity(
            Integer itineraryId,
            String activityType,
            String name,
            LocalTime startTime,
            String location,
            BigDecimal cost) {

        Itinerary itinerary = itineraryRepository.findById(itineraryId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Itinerary not found with id: " + itineraryId));

        Activity activity = Activity.builder()
                .itinerary(itinerary)
                .activityType(activityType)
                .name(name)
                .startTime(startTime)
                .location(location)
                .cost(cost)
                .build();

        return activityRepository.save(activity);
    }

    public Activity updateActivity(
            Integer id,
            String activityType,
            String name,
            LocalTime startTime,
            String location,
            BigDecimal cost) {

        Activity activity = getActivityById(id);

        activity.setActivityType(activityType);
        activity.setName(name);
        activity.setStartTime(startTime);
        activity.setLocation(location);
        activity.setCost(cost);

        return activityRepository.save(activity);
    }

    public void deleteActivity(Integer id) {
        Activity activity = getActivityById(id);
        activityRepository.delete(activity);
    }
}
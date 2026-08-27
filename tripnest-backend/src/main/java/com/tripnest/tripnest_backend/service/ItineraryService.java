package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.ItineraryRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public ItineraryService(
            ItineraryRepository itineraryRepository,
            TripRepository tripRepository,
            UserRepository userRepository) {

        this.itineraryRepository = itineraryRepository;
        this.tripRepository = tripRepository;
        this.userRepository = userRepository;
    }

    // Get only itineraries belonging to the logged-in user's trips
    public List<Itinerary> getAllItineraries(String userEmail) {

        User user = getUserByEmail(userEmail);

        return itineraryRepository.findAll()
                .stream()
                .filter(itinerary ->
                        itinerary.getTrip()
                                .getOwner()
                                .getId()
                                .equals(user.getId()))
                .toList();
    }

    // Get one itinerary only if user owns its trip
    public Itinerary getItineraryById(
            Integer id,
            String userEmail) {

        Itinerary itinerary = itineraryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Itinerary not found with id: " + id));

        verifyOwnership(itinerary.getTrip(), userEmail);

        return itinerary;
    }

    // Get itineraries for a trip only if user owns that trip
    public List<Itinerary> getItinerariesByTripId(
            Integer tripId,
            String userEmail) {

        Trip trip = getTripById(tripId);

        verifyOwnership(trip, userEmail);

        return itineraryRepository
                .findByTripIdOrderByDayNumberAsc(tripId);
    }

    // Create itinerary only for user's own trip
    public Itinerary createItinerary(
            Integer tripId,
            Integer dayNumber,
            LocalDate dayDate,
            String userEmail) {

        Trip trip = getTripById(tripId);

        verifyOwnership(trip, userEmail);

        Itinerary itinerary = Itinerary.builder()
                .trip(trip)
                .dayNumber(dayNumber)
                .dayDate(dayDate)
                .build();

        return itineraryRepository.save(itinerary);
    }

    // Update only user's own itinerary
    public Itinerary updateItinerary(
            Integer id,
            Integer dayNumber,
            LocalDate dayDate,
            String userEmail) {

        Itinerary itinerary =
                getItineraryById(id, userEmail);

        itinerary.setDayNumber(dayNumber);
        itinerary.setDayDate(dayDate);

        return itineraryRepository.save(itinerary);
    }

    // Delete only user's own itinerary
    public void deleteItinerary(
            Integer id,
            String userEmail) {

        Itinerary itinerary =
                getItineraryById(id, userEmail);

        itineraryRepository.delete(itinerary);
    }

    private User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found: " + email));
    }

    private Trip getTripById(Integer id) {

        return tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found with id: " + id));
    }

    private void verifyOwnership(
            Trip trip,
            String userEmail) {

        User user = getUserByEmail(userEmail);

        // Owner can access
        if (trip.getOwner()
                .getId()
                .equals(user.getId())) {
            return;
        }

        // Administrator can access
        if (user.getRole() != null &&
                "ADMINISTRATOR".equals(
                        user.getRole().getName())) {
            return;
        }

        throw new RuntimeException(
                "You do not have permission to access this itinerary");
    }
}
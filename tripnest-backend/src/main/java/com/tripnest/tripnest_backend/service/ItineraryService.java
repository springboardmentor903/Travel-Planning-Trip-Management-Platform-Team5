package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.entity.Itinerary;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.repository.ItineraryRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ItineraryService {

    private final ItineraryRepository itineraryRepository;
    private final TripRepository tripRepository;

    public ItineraryService(
            ItineraryRepository itineraryRepository,
            TripRepository tripRepository) {
        this.itineraryRepository = itineraryRepository;
        this.tripRepository = tripRepository;
    }

    public List<Itinerary> getAllItineraries() {
        return itineraryRepository.findAll();
    }

    public Itinerary getItineraryById(Integer id) {
        return itineraryRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Itinerary not found with id: " + id));
    }

    public List<Itinerary> getItinerariesByTripId(Integer tripId) {
        return itineraryRepository.findByTripIdOrderByDayNumberAsc(tripId);
    }

    public Itinerary createItinerary(
            Integer tripId,
            Integer dayNumber,
            java.time.LocalDate dayDate) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found with id: " + tripId));

        Itinerary itinerary = Itinerary.builder()
                .trip(trip)
                .dayNumber(dayNumber)
                .dayDate(dayDate)
                .build();

        return itineraryRepository.save(itinerary);
    }

    public Itinerary updateItinerary(
            Integer id,
            Integer dayNumber,
            java.time.LocalDate dayDate) {

        Itinerary itinerary = getItineraryById(id);

        itinerary.setDayNumber(dayNumber);
        itinerary.setDayDate(dayDate);

        return itineraryRepository.save(itinerary);
    }

    public void deleteItinerary(Integer id) {
        Itinerary itinerary = getItineraryById(id);
        itineraryRepository.delete(itinerary);
    }
}
package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.dto.TripRequest;
import com.tripnest.tripnest_backend.dto.TripResponse;
import com.tripnest.tripnest_backend.entity.Destination;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.DestinationRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;
    private final DestinationRepository destinationRepository;

    public TripResponse createTrip(TripRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);

        Destination destination = null;
        if (request.getDestinationId() != null) {
            destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new RuntimeException("Destination not found with id: " + request.getDestinationId()));
        }

        Trip trip = new Trip();
        trip.setOwner(user);
        trip.setDestination(destination);
        trip.setTitle(request.getTitle());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            trip.setStatus(request.getStatus().toUpperCase());
        } else {
            trip.setStatus("PLANNED");
        }

        Trip savedTrip = tripRepository.save(trip);
        return mapToResponse(savedTrip);
    }

    public List<TripResponse> getMyTrips(String userEmail) {
        User user = getUserByEmail(userEmail);
        return tripRepository.findByOwnerId(user.getId()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    public TripResponse getTripById(Integer id, String userEmail) {
        Trip trip = getTripEntityById(id);
        verifyOwnership(trip, userEmail);
        return mapToResponse(trip);
    }

    public TripResponse updateTrip(Integer id, TripRequest request, String userEmail) {
        Trip trip = getTripEntityById(id);
        verifyOwnership(trip, userEmail);

        if (request.getDestinationId() != null) {
            Destination destination = destinationRepository.findById(request.getDestinationId())
                    .orElseThrow(() -> new RuntimeException("Destination not found with id: " + request.getDestinationId()));
            trip.setDestination(destination);
        }

        trip.setTitle(request.getTitle());
        trip.setStartDate(request.getStartDate());
        trip.setEndDate(request.getEndDate());
        if (request.getStatus() != null && !request.getStatus().isBlank()) {
            trip.setStatus(request.getStatus().toUpperCase());
        }

        Trip updatedTrip = tripRepository.save(trip);
        return mapToResponse(updatedTrip);
    }

    public void deleteTrip(Integer id, String userEmail) {
        Trip trip = getTripEntityById(id);
        verifyOwnership(trip, userEmail);
        tripRepository.delete(trip);
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));
    }

    private Trip getTripEntityById(Integer id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trip not found with id: " + id));
    }

    private void verifyOwnership(Trip trip, String userEmail) {
        User user = getUserByEmail(userEmail);
        // Allow owners or administrators
        if (!trip.getOwner().getId().equals(user.getId()) &&
                !"ADMINISTRATOR".equals(user.getRole().getName())) {
            throw new RuntimeException("You do not have permission to access or modify this trip");
        }
    }

    private TripResponse mapToResponse(Trip t) {
        Integer destId = t.getDestination() != null ? t.getDestination().getId() : null;
        String destName = t.getDestination() != null ? t.getDestination().getName() : null;
        String destCountry = t.getDestination() != null ? t.getDestination().getCountry() : null;

        return new TripResponse(
                t.getId(),
                t.getTitle(),
                t.getOwner().getId(),
                t.getOwner().getName(),
                destId,
                destName,
                destCountry,
                t.getStartDate(),
                t.getEndDate(),
                t.getStatus()
        );
    }
}

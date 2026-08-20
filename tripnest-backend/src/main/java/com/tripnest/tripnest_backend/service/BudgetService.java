package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.repository.BudgetRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TripRepository tripRepository;

    public List<Budget> getAllBudgets() {
        return budgetRepository.findAll();
    }

    public Budget getBudgetById(Integer id) {
        return budgetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found with id: " + id));
    }

    public Budget getBudgetByTripId(Integer tripId) {
        return budgetRepository.findByTripId(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Budget not found for trip id: " + tripId));
    }

    public Budget createBudget(
            Integer tripId,
            BigDecimal totalBudget) {

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() ->
                        new RuntimeException("Trip not found with id: " + tripId));

        if (totalBudget == null || totalBudget.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Total budget cannot be negative");
        }

        if (budgetRepository.findByTripId(tripId).isPresent()) {
            throw new RuntimeException(
                    "Budget already exists for trip id: " + tripId
            );
        }

        Budget budget = new Budget();

        budget.setTrip(trip);
        budget.setTotalBudget(totalBudget);
        budget.setTotalSpent(BigDecimal.ZERO);
        budget.setRemainingBudget(totalBudget);

        return budgetRepository.save(budget);
    }

    public Budget updateBudget(
            Integer id,
            BigDecimal totalBudget,
            BigDecimal totalSpent) {

        Budget budget = getBudgetById(id);

        if (totalBudget == null || totalBudget.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Total budget cannot be negative");
        }

        if (totalSpent == null || totalSpent.compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("Total spent cannot be negative");
        }

        if (totalSpent.compareTo(totalBudget) > 0) {
            throw new RuntimeException(
                    "Total spent cannot be greater than total budget"
            );
        }

        budget.setTotalBudget(totalBudget);
        budget.setTotalSpent(totalSpent);
        budget.setRemainingBudget(totalBudget.subtract(totalSpent));

        return budgetRepository.save(budget);
    }

    public void deleteBudget(Integer id) {
        Budget budget = getBudgetById(id);
        budgetRepository.delete(budget);
    }
}
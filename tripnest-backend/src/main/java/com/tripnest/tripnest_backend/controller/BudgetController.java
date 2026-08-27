package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.service.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:5173")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    // CREATE / SET BUDGET
    @PostMapping
    public ResponseEntity<Budget> createBudget(
            @RequestParam Integer tripId,
            @RequestParam BigDecimal totalBudget,
            @RequestParam(required = false, defaultValue = "USD") String currency) {

        Budget budget = budgetService.createBudget(
                tripId,
                totalBudget,
                currency
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(budget);
    }

    // UPDATE BUDGET BY ID
    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(
            @PathVariable Integer id,
            @RequestParam BigDecimal totalBudget,
            @RequestParam(required = false) String currency,
            @RequestParam(required = false) BigDecimal totalSpent) {

        Budget budget = budgetService.updateBudget(
                id,
                totalBudget,
                currency,
                totalSpent
        );

        return ResponseEntity.ok(budget);
    }

    // GET BUDGET BY TRIP
    @GetMapping("/trip/{tripId}")
    public ResponseEntity<Budget> getBudgetByTrip(
            @PathVariable Integer tripId) {

        return ResponseEntity.ok(
                budgetService.getBudgetByTripId(tripId)
        );
    }
}
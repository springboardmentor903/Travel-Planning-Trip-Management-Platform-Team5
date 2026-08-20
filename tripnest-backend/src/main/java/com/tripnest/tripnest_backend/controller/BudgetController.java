package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping
    public ResponseEntity<List<Budget>> getAllBudgets() {
        return ResponseEntity.ok(
                budgetService.getAllBudgets()
        );
    }

    @GetMapping("/{id}")
    public ResponseEntity<Budget> getBudgetById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                budgetService.getBudgetById(id)
        );
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<Budget> getBudgetByTrip(
            @PathVariable Integer tripId) {

        return ResponseEntity.ok(
                budgetService.getBudgetByTripId(tripId)
        );
    }

    @PostMapping
    public ResponseEntity<Budget> createBudget(
            @RequestParam Integer tripId,
            @RequestParam BigDecimal totalBudget) {

        Budget budget = budgetService.createBudget(
                tripId,
                totalBudget
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(budget);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> updateBudget(
            @PathVariable Integer id,
            @RequestParam BigDecimal totalBudget,
            @RequestParam BigDecimal totalSpent) {

        return ResponseEntity.ok(
                budgetService.updateBudget(
                        id,
                        totalBudget,
                        totalSpent
                )
        );
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBudget(
            @PathVariable Integer id) {

        budgetService.deleteBudget(id);

        return ResponseEntity.noContent().build();
    }
}
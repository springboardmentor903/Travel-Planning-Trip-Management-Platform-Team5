package com.tripnest.tripnest_backend.controller;

import com.tripnest.tripnest_backend.entity.Expense;
import com.tripnest.tripnest_backend.service.ExpenseService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ExpenseController {

    private final ExpenseService expenseService;

    // ============================================================
    // CREATE EXPENSE
    // ============================================================

    @PostMapping({"/trips/{tripId}/expenses", "/expenses"})
    public ResponseEntity<Expense> createExpense(
            @PathVariable(required = false) Integer tripId,
            @RequestParam(required = false) Integer paramTripId,
            @RequestParam(required = false) Integer budgetId,
            @RequestParam(required = false) Integer payerId,
            @RequestParam String category,
            @RequestParam BigDecimal amount,
            @RequestParam(required = false) LocalDate expenseDate,
            @RequestParam(required = false) String receiptLink,
            Authentication authentication) {

        Integer effectiveTripId = tripId != null ? tripId : paramTripId;

        Expense expense =
                expenseService.createExpense(
                        effectiveTripId,
                        budgetId,
                        payerId,
                        category,
                        amount,
                        expenseDate,
                        receiptLink,
                        authentication.getName()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(expense);
    }

    // ============================================================
    // LIST EXPENSES
    // ============================================================

    @GetMapping({"/trips/{tripId}/expenses", "/expenses/trip/{tripId}"})
    public ResponseEntity<List<Expense>> getExpenses(
            @PathVariable Integer tripId,
            Authentication authentication) {

        return ResponseEntity.ok(
                expenseService.getExpensesByTrip(
                        tripId,
                        authentication.getName()
                )
        );
    }

    // ============================================================
    // GET EXPENSE BY ID
    // ============================================================

    @GetMapping("/expenses/{expenseId}")
    public ResponseEntity<Expense> getExpenseById(
            @PathVariable Integer expenseId,
            Authentication authentication) {

        return ResponseEntity.ok(
                expenseService.getExpenseById(
                        expenseId,
                        authentication.getName()
                )
        );
    }

    // ============================================================
    // UPDATE EXPENSE
    // ============================================================

    @PutMapping("/expenses/{expenseId}")
    public ResponseEntity<Expense> updateExpense(

            @PathVariable Integer expenseId,

            @RequestParam(required = false) Integer budgetId,

            @RequestParam(required = false) Integer payerId,

            @RequestParam String category,

            @RequestParam BigDecimal amount,

            @RequestParam(required = false)
            LocalDate expenseDate,

            @RequestParam(required = false)
            String receiptLink,

            Authentication authentication) {

        Expense updatedExpense =
                expenseService.updateExpense(
                        expenseId,
                        budgetId,
                        payerId,
                        category,
                        amount,
                        expenseDate,
                        receiptLink,
                        authentication.getName()
                );

        return ResponseEntity.ok(updatedExpense);
    }

    // ============================================================
    // DELETE EXPENSE
    // ============================================================

    @DeleteMapping("/expenses/{expenseId}")
    public ResponseEntity<Void> deleteExpense(
            @PathVariable Integer expenseId,
            Authentication authentication) {

        expenseService.deleteExpense(
                expenseId,
                authentication.getName()
        );

        return ResponseEntity.noContent().build();
    }

    // ============================================================
    // CATEGORY SUMMARY
    // ============================================================

    @GetMapping({"/trips/{tripId}/expenses/category-summary", "/expenses/trip/{tripId}/category-summary"})
    public ResponseEntity<Map<String, BigDecimal>>
    getCategorySummary(
            @PathVariable Integer tripId,
            Authentication authentication) {

        return ResponseEntity.ok(
                expenseService.getCategorySummary(
                        tripId,
                        authentication.getName()
                )
        );
    }

    // ============================================================
    // REMAINING BUDGET
    // ============================================================

    @GetMapping({"/trips/{tripId}/expenses/remaining-budget", "/expenses/trip/{tripId}/remaining-budget"})
    public ResponseEntity<BigDecimal>
    getRemainingBudget(
            @PathVariable Integer tripId,
            Authentication authentication) {

        return ResponseEntity.ok(
                expenseService.getRemainingBudget(
                        tripId,
                        authentication.getName()
                )
        );
    }
}
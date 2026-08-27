package com.tripnest.tripnest_backend.service;

import com.tripnest.tripnest_backend.entity.Budget;
import com.tripnest.tripnest_backend.entity.Expense;
import com.tripnest.tripnest_backend.entity.Trip;
import com.tripnest.tripnest_backend.entity.User;
import com.tripnest.tripnest_backend.repository.BudgetRepository;
import com.tripnest.tripnest_backend.repository.ExpenseRepository;
import com.tripnest.tripnest_backend.repository.TripRepository;
import com.tripnest.tripnest_backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final TripRepository tripRepository;
    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;

    // ============================================================
    // CREATE EXPENSE
    // ============================================================

    @Transactional
    public Expense createExpense(
            Integer tripId,
            Integer budgetId,
            Integer payerId,
            String category,
            BigDecimal amount,
            LocalDate expenseDate,
            String receiptLink,
            String userEmail) {

        // Validate category
        validateCategory(category);

        // Validate amount
        validateAmount(amount);

        // Get logged-in user
        User loggedInUser = getUserByEmail(userEmail);

        // Get trip
        Trip trip = getTripById(tripId);

        // Verify that logged-in user owns the trip
        verifyTripOwnership(trip, loggedInUser);

        // Resolve budget: if null, find or create default budget
        Budget budget;
        if (budgetId != null) {
            budget = getBudgetById(budgetId);
            verifyBudgetBelongsToTrip(budget, trip);
        } else {
            budget = budgetRepository.findByTripId(tripId)
                    .orElseGet(() -> budgetRepository.save(
                            Budget.builder()
                                    .trip(trip)
                                    .totalBudget(new BigDecimal("1000.00"))
                                    .totalSpent(BigDecimal.ZERO)
                                    .remainingBudget(new BigDecimal("1000.00"))
                                    .currency("USD")
                                    .build()
                    ));
        }

        // Resolve payer: if null, default to loggedInUser
        User payer = (payerId != null) ? getUserById(payerId) : loggedInUser;
        validatePayerConnection(payer, trip);

        Expense expense = Expense.builder()
                .trip(trip)
                .budget(budget)
                .payer(payer)
                .category(category.trim())
                .amount(amount)
                .expenseDate(expenseDate != null ? expenseDate : LocalDate.now())
                .receiptLink(receiptLink)
                .build();

        Expense saved = expenseRepository.save(expense);
        recalculateBudget(trip);
        return saved;
    }

    // ============================================================
    // GET ALL EXPENSES FOR TRIP
    // ============================================================

    @Transactional(readOnly = true)
    public List<Expense> getExpensesByTrip(
            Integer tripId,
            String userEmail) {

        User user = getUserByEmail(userEmail);

        Trip trip = getTripById(tripId);

        verifyTripOwnership(trip, user);

        return expenseRepository
                .findByTripIdOrderByExpenseDateDesc(tripId);
    }

    // ============================================================
    // GET EXPENSE BY ID
    // ============================================================

    @Transactional(readOnly = true)
    public Expense getExpenseById(
            Integer expenseId,
            String userEmail) {

        Expense expense = getExpense(expenseId);

        User user = getUserByEmail(userEmail);

        verifyTripOwnership(expense.getTrip(), user);

        return expense;
    }

    // ============================================================
    // UPDATE EXPENSE
    // ============================================================

    @Transactional
    public Expense updateExpense(
            Integer expenseId,
            Integer budgetId,
            Integer payerId,
            String category,
            BigDecimal amount,
            LocalDate expenseDate,
            String receiptLink,
            String userEmail) {

        // Validate category
        validateCategory(category);

        // Validate amount
        validateAmount(amount);

        // Find expense
        Expense expense = getExpense(expenseId);

        // Logged-in user
        User loggedInUser = getUserByEmail(userEmail);

        // Verify ownership
        verifyTripOwnership(expense.getTrip(), loggedInUser);

        // Resolve budget: if null, use expense's current budget or trip budget
        Budget budget;
        if (budgetId != null) {
            budget = getBudgetById(budgetId);
            verifyBudgetBelongsToTrip(budget, expense.getTrip());
        } else {
            budget = expense.getBudget() != null ? expense.getBudget() :
                    budgetRepository.findByTripId(expense.getTrip().getId()).orElse(null);
        }

        // Resolve payer: if null, default to current payer or loggedInUser
        User payer = (payerId != null) ? getUserById(payerId) :
                (expense.getPayer() != null ? expense.getPayer() : loggedInUser);
        validatePayerConnection(payer, expense.getTrip());

        // Update fields
        if (budget != null) expense.setBudget(budget);
        expense.setPayer(payer);
        expense.setCategory(category.trim());
        expense.setAmount(amount);

        if (expenseDate != null) {
            expense.setExpenseDate(expenseDate);
        }

        expense.setReceiptLink(receiptLink);

        Expense updated = expenseRepository.save(expense);
        recalculateBudget(expense.getTrip());
        return updated;
    }

    // ============================================================
    // DELETE EXPENSE
    // ============================================================

    @Transactional
    public void deleteExpense(
            Integer expenseId,
            String userEmail) {

        Expense expense = getExpense(expenseId);

        User user = getUserByEmail(userEmail);

        // Verify ownership before deletion
        verifyTripOwnership(expense.getTrip(), user);

        Trip trip = expense.getTrip();
        expenseRepository.delete(expense);
        recalculateBudget(trip);
    }

    private void recalculateBudget(Trip trip) {
        if (trip == null) return;
        budgetRepository.findByTripId(trip.getId()).ifPresent(budget -> {
            BigDecimal totalSpent = expenseRepository.getTotalExpensesByTripId(trip.getId());
            if (totalSpent == null) totalSpent = BigDecimal.ZERO;
            budget.setTotalSpent(totalSpent);
            budget.setRemainingBudget(budget.getTotalBudget().subtract(totalSpent));
            budgetRepository.save(budget);
        });
    }

    // ============================================================
    // CATEGORY SUMMARY
    // ============================================================

    @Transactional(readOnly = true)
    public Map<String, BigDecimal> getCategorySummary(
            Integer tripId,
            String userEmail) {

        User user = getUserByEmail(userEmail);

        Trip trip = getTripById(tripId);

        verifyTripOwnership(trip, user);

        List<Object[]> results =
                expenseRepository.getCategorySummary(tripId);

        Map<String, BigDecimal> summary =
                new LinkedHashMap<>();

        for (Object[] row : results) {

            String category = (String) row[0];

            BigDecimal total = (BigDecimal) row[1];

            summary.put(category, total);
        }

        return summary;
    }

    // ============================================================
    // REMAINING BUDGET
    // ============================================================

    @Transactional(readOnly = true)
    public BigDecimal getRemainingBudget(
            Integer tripId,
            String userEmail) {

        User user = getUserByEmail(userEmail);

        Trip trip = getTripById(tripId);

        verifyTripOwnership(trip, user);

        Budget budget = budgetRepository
                .findByTripId(tripId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Budget not found for trip: " + tripId
                        )
                );

        BigDecimal totalExpenses =
                expenseRepository
                        .getTotalExpensesByTripId(tripId);

        if (totalExpenses == null) {
            totalExpenses = BigDecimal.ZERO;
        }

        return budget.getTotalBudget()
                .subtract(totalExpenses);
    }

    // ============================================================
    // VALIDATIONS
    // ============================================================

    private void validateCategory(String category) {

        if (category == null || category.trim().isEmpty()) {

            throw new IllegalArgumentException(
                    "Expense category is required"
            );
        }
    }

    private void validateAmount(BigDecimal amount) {

        if (amount == null) {

            throw new IllegalArgumentException(
                    "Expense amount is required"
            );
        }

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {

            throw new IllegalArgumentException(
                    "Expense amount must be greater than zero"
            );
        }
    }

    // ============================================================
    // PAYER VALIDATION
    // ============================================================

    private void validatePayerConnection(
            User payer,
            Trip trip) {

        // Current Trip model has an owner.
        // Therefore the owner is considered connected to the trip.

        if (payer.getId().equals(trip.getOwner().getId())) {
            return;
        }

        /*
         * If your project later has TripMember,
         * replace this section with a TripMemberRepository check.
         */

        throw new IllegalArgumentException(
                "Payer is not connected to this trip"
        );
    }

    // ============================================================
    // OWNERSHIP VALIDATION
    // ============================================================

    private void verifyTripOwnership(
            Trip trip,
            User user) {

        if (trip.getOwner() == null ||
                trip.getOwner().getId() == null) {

            throw new IllegalArgumentException(
                    "Trip does not have a valid owner"
            );
        }

        // Owner can access the trip
        if (trip.getOwner().getId()
                .equals(user.getId())) {

            return;
        }

        // Admin can access
        if (user.getRole() != null &&
                "ADMINISTRATOR".equalsIgnoreCase(
                        user.getRole().getName())) {

            return;
        }

        throw new IllegalArgumentException(
                "You do not have permission to access this trip"
        );
    }

    // ============================================================
    // HELPER METHODS
    // ============================================================

    private User getUserByEmail(String email) {

        return userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException(
                                "User not found: " + email
                        )
                );
    }

    private User getUserById(Integer id) {

        return userRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Payer not found with id: " + id
                        )
                );
    }

    private Trip getTripById(Integer id) {

        return tripRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Trip not found with id: " + id
                        )
                );
    }

    private Budget getBudgetById(Integer id) {

        return budgetRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Budget not found with id: " + id
                        )
                );
    }

    private Expense getExpense(Integer id) {

        return expenseRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Expense not found with id: " + id
                        )
                );
    }

    private void verifyBudgetBelongsToTrip(
            Budget budget,
            Trip trip) {

        if (budget.getTrip() == null ||
                budget.getTrip().getId() == null ||
                !budget.getTrip().getId()
                        .equals(trip.getId())) {

            throw new IllegalArgumentException(
                    "Budget does not belong to this trip"
            );
        }
    }
}
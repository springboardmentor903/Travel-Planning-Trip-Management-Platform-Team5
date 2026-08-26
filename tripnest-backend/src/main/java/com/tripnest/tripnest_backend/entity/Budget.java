package com.tripnest.tripnest_backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "budgets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "trip_id",
            nullable = false,
            unique = true
    )
    private Trip trip;

    @Column(
            name = "total_budget",
            nullable = false,
            precision = 12,
            scale = 2
    )
    private BigDecimal totalBudget;

    @Column(
            name = "total_spent",
            precision = 12,
            scale = 2
    )
    private BigDecimal totalSpent;

    @Column(
            name = "currency"
    )
    private String currency = "USD";

    @Column(
            name = "remaining_budget",
            precision = 12,
            scale = 2
    )
    private BigDecimal remainingBudget;
}
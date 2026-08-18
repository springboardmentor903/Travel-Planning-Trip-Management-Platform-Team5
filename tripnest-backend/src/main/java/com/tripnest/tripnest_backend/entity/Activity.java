package com.tripnest.tripnest_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalTime;

@Entity
@Table(name = "activities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_id", nullable = false)
    @JsonIgnore
    private Itinerary itinerary;

    @Column(name = "activity_type", nullable = false)
    private String activityType;

    @Column(nullable = false)
    private String name;

    @Column(name = "start_time")
    private LocalTime startTime;

    private String location;

    @Column(precision = 10, scale = 2)
    private BigDecimal cost;
}
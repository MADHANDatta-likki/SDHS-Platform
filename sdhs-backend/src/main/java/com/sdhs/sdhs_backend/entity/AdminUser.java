package com.sdhs.sdhs_backend.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "admin_user")
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "admin_user_id")
    private Long adminUserId;

    @Column(name = "volunteer_id")
    private String volunteerId;

    @Column(name = "admin_role")
    private String adminRole;

    @Column(name = "is_active")
    private Boolean active;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

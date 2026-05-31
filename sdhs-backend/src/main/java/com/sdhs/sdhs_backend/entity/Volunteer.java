package com.sdhs.sdhs_backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "\"Volunteer\"")
public class Volunteer {

    @Id
    @Column(name = "\"VID\"")
    private String vid;

    @Column(name = "\"VNo\"")
    private Integer vNo;

    @Column(name = "\"DisplayName\"")
    private String displayName;

    @Column(name = "\"Name\"")
    private String name;

    @Column(name = "\"Surname\"")
    private String surname;

    @Column(name = "\"Phone\"")
    private String phone;

    @Column(name = "\"Email\"")
    private String email;

    @Column(name = "\"DateOfBirth\"")
private java.time.LocalDate dateOfBirth;

    @Column(name = "\"Gender\"")
    private String gender;

    @Column(name = "\"VCentreID\"")
    private String vCentreId;

    @Column(name = "\"VolunteerRoleID\"")
    private String volunteerRoleId;

    @Column(name = "\"IsActive\"")
    private String isActive;

    @Column(name = "\"whatsappnumber\"")
    private String whatsappNumber;
}
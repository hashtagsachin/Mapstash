package com.sach.mapstash.model; // Adjust package name

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity // JPA: Marks this class as a JPA entity
@Table(name = "pins") // Maps to the 'pins' table
public class Pin {

    @Id // JPA: Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Corresponds to AUTO_INCREMENT
    private Long id;

    @Column(name = "title", nullable = false, length = 255) // Maps to 'title'
    private String title;

    @Lob // JPA: Specifies a Large Object type
    @Column(name = "notes", columnDefinition = "TEXT") // Maps to 'notes'
    private String notes;

    @Column(name = "latitude", nullable = false) // Maps to 'latitude'
    private Double latitude;

    @Column(name = "longitude", nullable = false) // Maps to 'longitude'
    private Double longitude;

    @Column(name = "user_id") // Maps to 'user_id', nullable for MVP
    private Long userId; // Will eventually link to a User entity

    @Column(name = "created_at", nullable = false, updatable = false) // Maps to 'created_at'
    @CreationTimestamp // Hibernate: Automatically set on creation
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false) // Maps to 'updated_at'
    @UpdateTimestamp // Hibernate: Automatically set on creation and update
    private LocalDateTime updatedAt;

    @ManyToMany(fetch = FetchType.LAZY, // Fetch tags only when needed
            cascade = { CascadeType.PERSIST, CascadeType.MERGE }) // Cascade save/update to new/modified tags
    @JoinTable(name = "pin_tags", // Specifies the join table
            joinColumns = @JoinColumn(name = "pin_id"), // FK column in join table for Pin
            inverseJoinColumns = @JoinColumn(name = "tag_id")) // FK column in join table for Tag
    private Set<Tag> tags = new HashSet<>();

    // --- Constructors ---

    //no args- required by jpa
    public Pin() {
    }

  //for convenience
    public Pin(String title, Double latitude, Double longitude) {
        this.title = title;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    // No public setter for createdAt - managed by @CreationTimestamp
    // public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    // No public setter for updatedAt - managed by @UpdateTimestamp
    // public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public Set<Tag> getTags() {
        return tags;
    }

    public void setTags(Set<Tag> tags) {
        this.tags = tags;
    }

    // --- Helper methods for managing the bidirectional relationship ---

    public void addTag(Tag tag) {
        if (tag != null) {
            this.tags.add(tag);
            tag.getPins().add(this); // Maintain the other side
        }
    }

    public void removeTag(Tag tag) {
        if (tag != null) {
            this.tags.remove(tag);
            tag.getPins().remove(this); // Maintain the other side
        }
    }

    // --- equals() and hashCode() ---
    // Based on ID for persisted entities.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Pin pin = (Pin) o;
        // Use ID for equality check, only if ID is not null (persisted)
        // Relies on object identity for transient objects (before saving)
        return id != null && Objects.equals(id, pin.id);
    }

    @Override
    public int hashCode() {
        // Use ID for hash code if persisted, otherwise use a default based on class
        // This prevents hashcode changing when entity gets an ID upon persistence
        return id != null ? Objects.hash(id) : getClass().hashCode();
    }

    // --- toString() ---
    // Useful for logging and debugging. Avoid including collections (tags)
    // to prevent potential lazy loading issues or excessive output.
    @Override
    public String toString() {
        return "Pin{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", userId=" + userId +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
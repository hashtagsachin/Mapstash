package com.sach.mapstash.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

//pin data sent to client
public class PinDto {
    private Long id;
    private String title;
    private String notes;
    private Double latitude;
    private Double longitude;
    private Long userId; // nullable for now
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    //private List<String> tags; // List of tag names - old one, before i had DTOs
    private List<TagDto> tags;

    // --- Constructors ---
    public PinDto() {
    }

    public PinDto(Long id, String title, String notes, Double latitude, Double longitude, Long userId, LocalDateTime createdAt, LocalDateTime updatedAt, List<TagDto> tags) {
        this.id = id;
        this.title = title;
        this.notes = notes;
        this.latitude = latitude;
        this.longitude = longitude;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.tags = tags;

    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
   // public List<String> getTags() { return tags; }
   // public void setTags(List<String> tags) { this.tags = tags; }
    public List<TagDto> getTags() {
        return tags;
    }

    public void setTags(List<TagDto> tags) {
        this.tags = tags;
    }

    // --- equals() and hashCode() --- (optional but good practice for DTOs if used in collections/comparisons)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        PinDto pinDto = (PinDto) o;
        return Objects.equals(id, pinDto.id) && Objects.equals(title, pinDto.title) && Objects.equals(notes, pinDto.notes) && Objects.equals(latitude, pinDto.latitude) && Objects.equals(longitude, pinDto.longitude) && Objects.equals(userId, pinDto.userId) && Objects.equals(createdAt, pinDto.createdAt) && Objects.equals(updatedAt, pinDto.updatedAt) && Objects.equals(tags, pinDto.tags);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, notes, latitude, longitude, userId, createdAt, updatedAt, tags);
    }


    // --- toString() ---
    @Override
    public String toString() {
        return "PinDto{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", notes='" + notes + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", userId=" + userId +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                ", tags=" + tags +
                '}';
    }
}
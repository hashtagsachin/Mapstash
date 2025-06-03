package com.sach.mapstash.dto;

import java.util.List;
import java.util.Objects;

// DTO for receiving data to update an existing Pin FROM the client
// excludes fields not typically updated like lat/lng or userId
public class UpdatePinDto {
    private String title;
    private String notes;
    private List<String> tags; // the full list of desired tags for the pin after update

    // --- Constructors ---
    public UpdatePinDto() {
    }

    public UpdatePinDto(String title, String notes, List<String> tags) {
        this.title = title;
        this.notes = notes;
        this.tags = tags;
    }

    // --- Getters and Setters ---
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    // --- equals() and hashCode() ---
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        UpdatePinDto that = (UpdatePinDto) o;
        return Objects.equals(title, that.title) && Objects.equals(notes, that.notes) && Objects.equals(tags, that.tags);
    }

    @Override
    public int hashCode() {
        return Objects.hash(title, notes, tags);
    }

    // --- toString() ---
    @Override
    public String toString() {
        return "UpdatePinDto{" +
                "title='" + title + '\'' +
                ", notes='" + notes + '\'' +
                ", tags=" + tags +
                '}';
    }
}
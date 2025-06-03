package com.sach.mapstash.dto;

import java.util.List;
import java.util.Objects;

//create new Pin with data received from client
//so basically the dtos are used to recieve and send data to the "outside" or internally - controller/service

public class CreatePinDto {
    private String title;
    private String notes;
    private Double latitude;
    private Double longitude;
    private List<String> tags; // list of tag names

    // --- Constructors ---
    public CreatePinDto() {
    }

    public CreatePinDto(String title, String notes, Double latitude, Double longitude, List<String> tags) {
        this.title = title;
        this.notes = notes;
        this.latitude = latitude;
        this.longitude = longitude;
        this.tags = tags;
    }

    // --- Getters and Setters ---
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public Double getLatitude() { return latitude; }
    public void setLatitude(Double latitude) { this.latitude = latitude; }
    public Double getLongitude() { return longitude; }
    public void setLongitude(Double longitude) { this.longitude = longitude; }
    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    // --- equals() and hashCode() ---
    //again, this is to compare 2 dto instances or for testing(which i should eventually do)
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        CreatePinDto that = (CreatePinDto) o;
        return Objects.equals(title, that.title) && Objects.equals(notes, that.notes) && Objects.equals(latitude, that.latitude) && Objects.equals(longitude, that.longitude) && Objects.equals(tags, that.tags);
    }

    @Override
    public int hashCode() {
        return Objects.hash(title, notes, latitude, longitude, tags);
    }

    // --- toString() ---
    @Override
    public String toString() {
        return "CreatePinDto{" +
                "title='" + title + '\'' +
                ", notes='" + notes + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", tags=" + tags +
                '}';
    }
}
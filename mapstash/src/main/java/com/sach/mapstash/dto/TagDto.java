package com.sach.mapstash.dto;

public class TagDto {
    private Long id; // Or integer, matching Tag entity ID type
    private String name;

    // Constructors (default and parameterized)
    public TagDto() {}

    public TagDto(Long id, String name) {
        this.id = id;
        this.name = name;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    // Optional: equals() and hashCode()
    //cba
}
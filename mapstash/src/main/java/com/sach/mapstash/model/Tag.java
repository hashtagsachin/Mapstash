package com.sach.mapstash.model; // Adjust package name

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

@Entity // JPA: Marks this class as a JPA entity
@Table(name = "tags", // Maps to the 'tags' table
        uniqueConstraints = { // Corresponds to UNIQUE INDEX uk_tag_name
                @UniqueConstraint(name = "uk_tag_name", columnNames = {"name"})
        })
public class Tag {

    @Id // JPA: Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Corresponds to AUTO_INCREMENT
    private Long id;

    @Column(name = "name", nullable = false, length = 100) // Maps to 'name' column
    private String name;

    @Column(name = "created_at", nullable = false, updatable = false) // Maps to 'created_at'
    @CreationTimestamp // Hibernate: Automatically set on creation
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false) // Maps to 'updated_at'
    @UpdateTimestamp // Hibernate: Automatically set on creation and update
    private LocalDateTime updatedAt;

    @ManyToMany(mappedBy = "tags", // Relationship owned by 'tags' field in Pin entity
            fetch = FetchType.LAZY) // Fetch associated pins lazily
    private Set<Pin> pins = new HashSet<>();

    // --- Constructors ---

    /**
     * Default constructor required by JPA.
     */
    public Tag() {
    }

    /**
     * Convenience constructor for creating a tag with a name.
     * @param name The name of the tag.
     */
    public Tag(String name) {
        this.name = name;
    }

    // --- Getters and Setters ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
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

    public Set<Pin> getPins() {
        return pins;
    }

    public void setPins(Set<Pin> pins) {
        this.pins = pins;
    }

    // --- equals() and hashCode() ---
    // Based on the unique business key 'name'.
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Tag tag = (Tag) o;
        // Use the unique business key 'name' for equality check
        return Objects.equals(name, tag.name);
    }

    @Override
    public int hashCode() {
        // Use the unique business key 'name' for hash code calculation
        return Objects.hash(name);
    }

    // --- toString() ---
    // Useful for logging and debugging. Avoid including collections (pins)
    // to prevent potential lazy loading issues or excessive output.
    @Override
    public String toString() {
        return "Tag{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}
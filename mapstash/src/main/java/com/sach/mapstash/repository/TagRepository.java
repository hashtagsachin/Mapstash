package com.sach.mapstash.repository; // Adjust package name if needed (e.g., use '.data' or '.repositories')

import com.sach.mapstash.model.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query; // Import for @Query
import org.springframework.stereotype.Repository;

import java.util.List; // Import List
import java.util.Optional; // Import Optional

@Repository // Declares this interface as a Spring Data Repository (component)
public interface TagRepository extends JpaRepository<Tag, Long> { // extends JpaRepository for Tag entity with Long ID


    Optional<Tag> findByNameIgnoreCase(String name); // changed to IgnoreCase for flexibility
    //also optional because: to handle null (non-existant tags)
    //the missing tags would later be created in the service


    List<Tag> findByNameInIgnoreCase(List<String> names); // Added for batch lookup

//basically just returns the tag names, instead of the whole row
    //jpql: same same but different
    //used to populate the dropdown with available tags. i think it works
    @Query("SELECT DISTINCT t.name FROM Tag t ORDER BY t.name")
    List<String> findAllTagNames();
}
package com.sach.mapstash.repository;

import com.sach.mapstash.model.Pin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;



@Repository
public interface PinRepository extends JpaRepository<Pin, Long> { // Extends JpaRepository for Pin entity with Long ID

    // Basic CRUD methods (save, findById, findAll, deleteById, etc.) are inherited from JpaRepository.
    //MAGIC


}
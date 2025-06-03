package com.sach.mapstash.controller;

import com.sach.mapstash.dto.CreatePinDto;
import com.sach.mapstash.dto.PinDto;
import com.sach.mapstash.dto.UpdatePinDto;
import com.sach.mapstash.exception.ResourceNotFoundException; // Import custom exception
import com.sach.mapstash.service.PinService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // Combination of @Controller and @ResponseBody
@RequestMapping("/api/pins") //path for all endpoints in this controller
public class PinController {

    private final PinService pinService;

    // Constructor injection
    public PinController(PinService pinService) {
        this.pinService = pinService;
    }

    // --- Endpoint Mappings ---


    //POST api/pins - create new pin
    @PostMapping
    public ResponseEntity<PinDto> createPin(@RequestBody CreatePinDto createPinDto) {
        PinDto createdPin = pinService.createPin(createPinDto);
        // return 201 Created status with the created resource in the body
        return new ResponseEntity<>(createdPin, HttpStatus.CREATED);
    }


    //GET /api/pins - get all pins
    @GetMapping
    public ResponseEntity<List<PinDto>> getAllPins() {
        List<PinDto> pins = pinService.getAllPins();
        return ResponseEntity.ok(pins); // Shortcut for status 200 OK
    }


    //GET /api/[ins/{id} - get a specific pin by id
    //200 if ok 404 if n/a
    @GetMapping("/{id}")
    public ResponseEntity<PinDto> getPinById(@PathVariable Long id) {
        // Use the service method returning Optional and handle the "not found" case here
        return pinService.getPinById(id)
                .map(ResponseEntity::ok) // if present, wrap in ResponseEntity.ok()
                .orElseThrow(() -> new ResourceNotFoundException("Pin not found with id: " + id)); // Throw if not present
        // the @ResponseStatus on the exception handles the 404 return
    }


    //PUT /api/pins/{id}
    //params - id of pin to update/dto containing updated pin data
    //return ResponseEntity with 200 and updated PinDto
    //and throws ResourceNotFoundException with 404 if pin doesnt exist
    @PutMapping("/{id}")
    public ResponseEntity<PinDto> updatePin(@PathVariable Long id, @RequestBody UpdatePinDto updatePinDto) {
        // Service method already throws ResourceNotFoundException if not found
        PinDto updatedPin = pinService.updatePin(id, updatePinDto);
        return ResponseEntity.ok(updatedPin);
    }


    //DELETE /api/pins/{id}
    //params - id of pin to delete
    //return ResponseEntity with status 204 (No Content).
    //          Throws ResourceNotFoundException (404) if the Pin doesn't exist.
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePin(@PathVariable Long id) {
        // Service method already throws ResourceNotFoundException if not found
        pinService.deletePin(id);
        return ResponseEntity.noContent().build(); // Standard response for successful DELETE
    }


    //GET /api/pins/nearby - find pins within a radius
    //params - lat and long of centre points, radius in meters
    // return ResponseEntity with status 200 (OK) and list of nearby PinDtos.
    @GetMapping("/nearby")
    public ResponseEntity<List<PinDto>> findNearbyPins(
            @RequestParam(name = "lat") double lat,
            @RequestParam(name = "lng") double lng,
            @RequestParam(name = "radius", defaultValue = "2000") double radius) { // Default radius = 2km

        List<PinDto> nearbyPins = pinService.findNearbyPins(lat, lng, radius);
        return ResponseEntity.ok(nearbyPins);
    }

  

}
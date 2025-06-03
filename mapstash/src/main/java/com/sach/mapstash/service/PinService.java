package com.sach.mapstash.service;

import com.sach.mapstash.dto.CreatePinDto;
import com.sach.mapstash.dto.PinDto;
import com.sach.mapstash.dto.UpdatePinDto;

import java.util.List;
import java.util.Optional;

public interface PinService {

    /**
     * Creates a new Pin with associated Tags.
     * @param createPinDto DTO containing data for the new pin.
     * @return DTO representation of the created Pin.
     */
    PinDto createPin(CreatePinDto createPinDto);

    /**
     * Retrieves all Pins.
     * @return A list of DTO representations of all Pins.
     */
    List<PinDto> getAllPins();

    /**
     * Retrieves a single Pin by its ID.
     * @param id The ID of the Pin to retrieve.
     * @return An Optional containing the Pin DTO if found, otherwise empty.
     */
    Optional<PinDto> getPinById(Long id);

    /**
     * Updates an existing Pin.
     * @param id The ID of the Pin to update.
     * @param updatePinDto DTO containing the updated data.
     * @return DTO representation of the updated Pin.
     * @throwsResourceNotFoundException if the Pin with the given ID is not found.
     */
    PinDto updatePin(Long id, UpdatePinDto updatePinDto); // probably should add a custom exception

    /**
     * Deletes a Pin by its ID.
     * @param id The ID of the Pin to delete.
     * @throwsResourceNotFoundException if the Pin with the given ID is not found.
     */
    void deletePin(Long id); // again, custom exception

    /**
     * Finds Pins within a specified radius of given coordinates using Haversine formula.
     * @param latitude Latitude of the center point.
     * @param longitude Longitude of the center point.
     * @param radiusInMeters Radius in meters.
     * @return A list of Pin DTOs within the radius.
     */
    List<PinDto> findNearbyPins(double latitude, double longitude, double radiusInMeters);

    /**
     * Retrieves a list of all unique tag names used across all pins.
     * @return A list of unique tag name strings.
     */
    List<String> getAllTagNames();
}



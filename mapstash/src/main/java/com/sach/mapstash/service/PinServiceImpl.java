package com.sach.mapstash.service;

import com.sach.mapstash.dto.CreatePinDto;
import com.sach.mapstash.dto.PinDto;
import com.sach.mapstash.dto.TagDto;
import com.sach.mapstash.dto.UpdatePinDto;
import com.sach.mapstash.exception.ResourceNotFoundException;
import com.sach.mapstash.model.Pin;
import com.sach.mapstash.model.Tag;
import com.sach.mapstash.repository.PinRepository;
import com.sach.mapstash.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
public class PinServiceImpl implements PinService {

    private final PinRepository pinRepository;
    private final TagRepository tagRepository;

    // Constructor Injection
    public PinServiceImpl(PinRepository pinRepository, TagRepository tagRepository) {
        this.pinRepository = pinRepository;
        this.tagRepository = tagRepository;
    }

    @Override
    @Transactional
    public PinDto createPin(CreatePinDto createPinDto) {
        // Create a new Pin object and set its properties
        Pin pin = new Pin();
        pin.setTitle(createPinDto.getTitle());
        pin.setNotes(createPinDto.getNotes());
        pin.setLatitude(createPinDto.getLatitude());
        pin.setLongitude(createPinDto.getLongitude());
        // userId will be null for MVP

        // handle Tags - get the resolved tags and add them to the pin
        Set<Tag> resolvedTags = resolveTags(createPinDto.getTags());

        for (Tag tag : resolvedTags) {
            pin.addTag(tag);
        }

        // save the pin to database
        Pin savedPin = pinRepository.save(pin);

        // Convert the saved pin to DTO and return
        return mapPinToPinDto(savedPin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PinDto> getAllPins() {
        // Get all pins from database
        List<Pin> allPins = pinRepository.findAll();

        // Create a list to store the DTOs
        List<PinDto> pinDtos = new ArrayList<>();

        for (Pin pin : allPins) {
            PinDto pinDto = mapPinToPinDto(pin);
            pinDtos.add(pinDto);
        }

        return pinDtos;
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PinDto> getPinById(Long id) {
        // find the pin by ID
        Optional<Pin> pinOptional = pinRepository.findById(id);

        // check if pin exists and convert to DTO
        if (pinOptional.isPresent()) {
            Pin pin = pinOptional.get();
            PinDto pinDto = mapPinToPinDto(pin);
            return Optional.of(pinDto);
        } else {
            return Optional.empty();
        }
    }

    @Override
    @Transactional
    public PinDto updatePin(Long id, UpdatePinDto updatePinDto) {
        // find existing pin or throw exception
        Optional<Pin> pinOptional = pinRepository.findById(id);
        if (!pinOptional.isPresent()) {
            throw new ResourceNotFoundException("Pin not found with id: " + id);
        }

        Pin existingPin = pinOptional.get();

        // update basic properties
        existingPin.setTitle(updatePinDto.getTitle());
        existingPin.setNotes(updatePinDto.getNotes());

        // handle tag updates
        Set<Tag> resolvedTags = resolveTags(updatePinDto.getTags());

        //fFind tags to remove (existing tags that are not in the new list)
        Set<Tag> tagsToRemove = new HashSet<>();
        for (Tag existingTag : existingPin.getTags()) {
            if (!resolvedTags.contains(existingTag)) {
                tagsToRemove.add(existingTag);
            }
        }

        // Remove old tags
        for (Tag tagToRemove : tagsToRemove) {
            existingPin.removeTag(tagToRemove);
        }

        // add new tags
        for (Tag newTag : resolvedTags) {
            existingPin.addTag(newTag);
        }

        // save and return updated pin
        Pin updatedPin = pinRepository.save(existingPin);
        return mapPinToPinDto(updatedPin);
    }

    @Override
    @Transactional
    public void deletePin(Long id) {
        // check if pin exists before trying to delete
        boolean pinExists = pinRepository.existsById(id);
        if (!pinExists) {
            throw new ResourceNotFoundException("Pin not found with id: " + id);
        }

        // delete the pin
        pinRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PinDto> findNearbyPins(double latitude, double longitude, double radiusInMeters) {
        // get all pins from database (inefficient for large datasets, ok for MVP)
        List<Pin> allPins = pinRepository.findAll();
        List<Pin> nearbyPins = new ArrayList<>();


        for (Pin pin : allPins) {
            double distance = calculateHaversineDistance(
                    latitude, longitude,
                    pin.getLatitude(), pin.getLongitude()
            );

            // if pin is within radius, add it to nearby pins
            if (distance <= radiusInMeters) {
                nearbyPins.add(pin);
            }
        }

        // convert nearby pins to DTOs
        List<PinDto> nearbyPinDtos = new ArrayList<>();
        for (Pin nearbyPin : nearbyPins) {
            PinDto pinDto = mapPinToPinDto(nearbyPin);
            nearbyPinDtos.add(pinDto);
        }

        return nearbyPinDtos;
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllTagNames() {
        // this method uses repository query, keeping it simple
        return tagRepository.findAllTagNames();
    }

    // --- Helper Methods ---


    private PinDto mapPinToPinDto(Pin pin) {
        if (pin == null) {
            return null;
        }

        // create list to store tag DTOs
        List<TagDto> tagDtos = new ArrayList<>();

        // check if pin has tags
        if (pin.getTags() != null) {
            // Convert each Tag entity to TagDto
            for (Tag tagEntity : pin.getTags()) {
                TagDto tagDto = new TagDto(tagEntity.getId(), tagEntity.getName());
                tagDtos.add(tagDto);
            }

            // soort the tags alphabetically (case-insensitive)
            tagDtos.sort(new Comparator<TagDto>() {
                @Override
                public int compare(TagDto tag1, TagDto tag2) {
                    return tag1.getName().compareToIgnoreCase(tag2.getName());
                }
            });
        }

        // Create and return the PinDto
        return new PinDto(
                pin.getId(),
                pin.getTitle(),
                pin.getNotes(),
                pin.getLatitude(),
                pin.getLongitude(),
                pin.getUserId(),
                pin.getCreatedAt(),
                pin.getUpdatedAt(),
                tagDtos
        );
    }


    private Set<Tag> resolveTags(List<String> tagNames) {
        // handle null or empty input
        if (tagNames == null || tagNames.isEmpty()) {
            return new HashSet<>();
        }

        Set<Tag> tags = new HashSet<>();

        // process tag names: lowercase, trim, remove duplicates and empty strings
        List<String> processedTagNames = new ArrayList<>();
        for (String tagName : tagNames) {
            if (tagName != null) {
                String processed = tagName.toLowerCase().trim();
                if (!processed.isEmpty() && !processedTagNames.contains(processed)) {
                    processedTagNames.add(processed);
                }
            }
        }

        // if no valid tag names after processing, return empty set
        if (processedTagNames.isEmpty()) {
            return tags;
        }

        // find existing tags from database
        List<Tag> existingTags = tagRepository.findByNameInIgnoreCase(processedTagNames);

        // add existing tags to result set
        for (Tag existingTag : existingTags) {
            tags.add(existingTag);
        }

        // Create set of existing tag names (lowercase for comparison)
        Set<String> existingTagNames = new HashSet<>();
        for (Tag existingTag : existingTags) {
            existingTagNames.add(existingTag.getName().toLowerCase());
        }

        // Find tag names that don't exist yet and create new Tag entities
        List<Tag> newTags = new ArrayList<>();
        for (String tagName : processedTagNames) {
            if (!existingTagNames.contains(tagName)) {
                Tag newTag = new Tag(tagName);
                newTags.add(newTag);
            }
        }

        // Save new tags to database if any
        if (!newTags.isEmpty()) {
            List<Tag> savedNewTags = tagRepository.saveAll(newTags);
            for (Tag savedTag : savedNewTags) {
                tags.add(savedTag);
            }
        }

        return tags;
    }


     // Calculates the distance between two points on Earth using the Haversine formula.

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_METERS = 6371 * 1000; // Approx Earth radius in meters

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);

        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_METERS * c;
    }
}
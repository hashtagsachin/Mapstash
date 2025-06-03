package com.sach.mapstash.service;

import com.sach.mapstash.dto.CreatePinDto;
import com.sach.mapstash.dto.PinDto;
import com.sach.mapstash.dto.TagDto; // <<< --- IMPORT TagDto --- <<<
import com.sach.mapstash.dto.UpdatePinDto;
import com.sach.mapstash.exception.ResourceNotFoundException;
import com.sach.mapstash.model.Pin;
import com.sach.mapstash.model.Tag;
import com.sach.mapstash.repository.PinRepository;
import com.sach.mapstash.repository.TagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service // Marks this as a Spring Service component
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
        Pin pin = new Pin();
        pin.setTitle(createPinDto.getTitle());
        pin.setNotes(createPinDto.getNotes());
        pin.setLatitude(createPinDto.getLatitude());
        pin.setLongitude(createPinDto.getLongitude());
        // userId will be null for MVP

        // Handle Tags
        Set<Tag> resolvedTags = resolveTags(createPinDto.getTags());
        resolvedTags.forEach(pin::addTag);

        Pin savedPin = pinRepository.save(pin);
        return mapPinToPinDto(savedPin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PinDto> getAllPins() {
        return pinRepository.findAll()
                .stream()
                .map(this::mapPinToPinDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PinDto> getPinById(Long id) {
        return pinRepository.findById(id)
                .map(this::mapPinToPinDto);
    }

    @Override
    @Transactional
    public PinDto updatePin(Long id, UpdatePinDto updatePinDto) {
        Pin existingPin = pinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pin not found with id: " + id));

        existingPin.setTitle(updatePinDto.getTitle());
        existingPin.setNotes(updatePinDto.getNotes());


        Set<Tag> resolvedTags = resolveTags(updatePinDto.getTags());
        Set<Tag> tagsToRemove = new HashSet<>(existingPin.getTags());
        tagsToRemove.removeAll(resolvedTags);
        tagsToRemove.forEach(existingPin::removeTag);
        resolvedTags.forEach(existingPin::addTag);

        Pin updatedPin = pinRepository.save(existingPin);
        return mapPinToPinDto(updatedPin);
    }

    @Override
    @Transactional
    public void deletePin(Long id) {
        if (!pinRepository.existsById(id)) {
            throw new ResourceNotFoundException("Pin not found with id: " + id);
        }
        pinRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PinDto> findNearbyPins(double latitude, double longitude, double radiusInMeters) {
        List<Pin> allPins = pinRepository.findAll(); // inefficient for large datasets, ok for MVP
        List<Pin> nearbyPins = new ArrayList<>();

        for (Pin pin : allPins) {
            double distance = calculateHaversineDistance(
                    latitude, longitude,
                    pin.getLatitude(), pin.getLongitude()
            );
            if (distance <= radiusInMeters) {
                nearbyPins.add(pin);
            }
        }

        return nearbyPins.stream()
                .map(this::mapPinToPinDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllTagNames() {
        return tagRepository.findAllTagNames();
    }

    // --- Helper Methods ---


    private PinDto mapPinToPinDto(Pin pin) {
        if (pin == null) {
            return null;
        }


        List<TagDto> tagDtos = new ArrayList<>(); // default to empty list
        if (pin.getTags() != null) {
            tagDtos = pin.getTags().stream()
                    .map(tagEntity -> new TagDto(tagEntity.getId(), tagEntity.getName())) // Map Tag entity to TagDto
                    .sorted(Comparator.comparing(TagDto::getName, String.CASE_INSENSITIVE_ORDER)) // optional: Sort by name
                    .collect(Collectors.toList()); // Collect as List<TagDto>
        }


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
        if (tagNames == null || tagNames.isEmpty()) {
            return new HashSet<>();
        }

        Set<Tag> tags = new HashSet<>();
        List<String> lowerCaseTagNames = tagNames.stream()
                .map(String::toLowerCase) // consistent casing
                .map(String::trim)        // trim whitespace
                .filter(name -> !name.isEmpty()) // ignore empty tags after trimming
                .distinct() // ensure unique names
                .collect(Collectors.toList());

        if (lowerCaseTagNames.isEmpty()) {
            return tags;
        }

        // Find existing tags
        List<Tag> existingTags = tagRepository.findByNameInIgnoreCase(lowerCaseTagNames);
        tags.addAll(existingTags);

        Set<String> existingTagNames = existingTags.stream()
                .map(tag -> tag.getName().toLowerCase())
                .collect(Collectors.toSet());

        // Identify and create new tags
        List<Tag> newTags = new ArrayList<>();
        for (String tagName : lowerCaseTagNames) {
            if (!existingTagNames.contains(tagName)) {
                Tag newTag = new Tag(tagName);
                newTags.add(newTag);
            }
        }

        // Save new tags in batch
        if (!newTags.isEmpty()) {
            tags.addAll(tagRepository.saveAll(newTags));
        }

        return tags;
    }


    /**
     * Calculates the distance between two points on Earth using the Haversine formula.
     * @return Distance in meters.
     */
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
package com.sach.mapstash.controller;

import com.sach.mapstash.service.PinService; // Still uses PinService as it has the tag logic
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tags") // path for tag-related endpoints
public class TagController {

    private final PinService pinService; // service containing the method

    public TagController(PinService pinService) {
        this.pinService = pinService;
    }


    //GET /api/tags - get a list of all unique tag names used across pins.
    //return ResponseEntity with status 200 (OK) and a list of tag name strings
    @GetMapping
    public ResponseEntity<List<String>> getAllTagNames() {
        List<String> tagNames = pinService.getAllTagNames();
        return ResponseEntity.ok(tagNames);
    }
}
package com.sach.mapstash.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * Custom exception thrown when a requested resource (e.g., Pin, Tag) is not found.
 * Annotated with @ResponseStatus(HttpStatus.NOT_FOUND) so Spring MVC automatically
 * translates this exception into an HTTP 404 response.
 */
@ResponseStatus(value = HttpStatus.NOT_FOUND) // This automatically sets the HTTP status to 404
public class ResourceNotFoundException extends RuntimeException {

  private static final long serialVersionUID = 1L; // Optional: For Serializable interface

  public ResourceNotFoundException(String message) {
    super(message); // Pass the message to the RuntimeException constructor
  }


}
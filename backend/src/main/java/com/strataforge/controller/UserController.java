package com.strataforge.controller;

import com.strataforge.service.CurrentUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final CurrentUserService currentUserService;

    public UserController(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    public ResponseEntity<?> me(Authentication authentication) {
        var user = currentUserService.get(authentication.getName());
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "clerkUserId", user.getClerkUserId(),
                "email", user.getEmail(),
                "firstName", user.getFirstName() == null ? "" : user.getFirstName(),
                "lastName", user.getLastName() == null ? "" : user.getLastName(),
                "profileImageUrl", user.getProfileImageUrl() == null ? "" : user.getProfileImageUrl()
        ));
    }
}

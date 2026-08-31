package com.strataforge.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.strataforge.model.User;
import com.strataforge.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Locale;

@Service
public class ClerkUserService {
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final String secretKey;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    public ClerkUserService(
            UserRepository userRepository,
            ObjectMapper objectMapper,
            @Value("${clerk.secret-key}") String secretKey) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
        this.secretKey = secretKey;
    }

    public User ensureLocalUser(String clerkUserId) {
        if (clerkUserId == null || clerkUserId.isBlank()) {
            throw new IllegalArgumentException("Missing Clerk user id.");
        }

        return userRepository.findByClerkUserId(clerkUserId).orElseGet(() -> {
            ClerkProfile profile = fetchProfile(clerkUserId);
            User user = userRepository.findByEmailIgnoreCase(profile.email()).orElseGet(User::new);
            user.setClerkUserId(clerkUserId);
            user.setEmail(profile.email());
            user.setFirstName(profile.firstName());
            user.setLastName(profile.lastName());
            user.setProfileImageUrl(profile.profileImageUrl());
            // Password ownership is delegated to Clerk. Keep the column nullable for migrated databases.
            return userRepository.save(user);
        });
    }

    private ClerkProfile fetchProfile(String clerkUserId) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.clerk.com/v1/users/" + clerkUserId))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + secretKey)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() != HttpStatus.OK.value()) {
                throw new IllegalStateException("Clerk user lookup failed with HTTP " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            String email = root.path("email_addresses").isArray() && root.path("email_addresses").size() > 0
                    ? root.path("email_addresses").get(0).path("email_address").asText("")
                    : "";

            String primaryEmailId = root.path("primary_email_address_id").asText("");
            if (!primaryEmailId.isBlank() && root.path("email_addresses").isArray()) {
                for (JsonNode item : root.path("email_addresses")) {
                    if (primaryEmailId.equals(item.path("id").asText())) {
                        email = item.path("email_address").asText(email);
                        break;
                    }
                }
            }

            if (email.isBlank()) throw new IllegalStateException("The Clerk user has no usable email address.");
            return new ClerkProfile(
                    email.trim().toLowerCase(Locale.ROOT),
                    nullIfBlank(root.path("first_name").asText("")),
                    nullIfBlank(root.path("last_name").asText("")),
                    nullIfBlank(root.path("image_url").asText("")));
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while contacting Clerk.", ex);
        } catch (Exception ex) {
            throw new IllegalStateException("Could not synchronize the Clerk user.", ex);
        }
    }

    private String nullIfBlank(String value) { return value == null || value.isBlank() ? null : value; }

    private record ClerkProfile(String email, String firstName, String lastName, String profileImageUrl) {}
}

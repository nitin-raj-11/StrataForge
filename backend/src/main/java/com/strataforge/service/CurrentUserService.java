package com.strataforge.service;

import com.strataforge.model.User;
import com.strataforge.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class CurrentUserService {
    private final UserRepository userRepository;
    private final ClerkUserService clerkUserService;

    public CurrentUserService(UserRepository userRepository, ClerkUserService clerkUserService) {
        this.userRepository = userRepository;
        this.clerkUserService = clerkUserService;
    }

    public User get(String clerkUserId) {
        return clerkUserService.ensureLocalUser(clerkUserId);
    }
}

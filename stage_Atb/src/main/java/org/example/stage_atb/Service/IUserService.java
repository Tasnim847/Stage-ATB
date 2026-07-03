package org.example.stage_atb.Service;


import org.example.stage_atb.dto.request.LoginRequest;
import org.example.stage_atb.dto.request.RegisterRequest;
import org.example.stage_atb.dto.response.AuthResponse;
import org.example.stage_atb.dto.response.UserResponseDTO;
import org.example.stage_atb.entity.User;

import java.util.List;

public interface IUserService {

    AuthResponse login(LoginRequest loginRequest);

    AuthResponse register(RegisterRequest registerRequest);

    UserResponseDTO getUserById(String id);

    UserResponseDTO getUserByEmail(String email);

    List<UserResponseDTO> getAllUsers();

    List<UserResponseDTO> getUsersByRole(String role);

    UserResponseDTO updateUser(String id, RegisterRequest registerRequest);

    void deleteUser(String id);

    void activateUser(String id);

    void deactivateUser(String id);

    void lockUser(String id);

    void unlockUser(String id);

    User getCurrentUser();

    long countActiveUsers();

    User getUserEntityById(String id); // Récupère l'entity User directement

}
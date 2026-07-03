package org.example.stage_atb.Service;

import org.example.stage_atb.dto.request.EmployeeRegisterRequest;
import org.example.stage_atb.dto.request.EmployeeRequestDTO;
import org.example.stage_atb.dto.response.EmployeeResponseDTO;
import org.example.stage_atb.entity.User;

import java.util.List;

public interface IEmployeeService {

    EmployeeResponseDTO createEmployee(EmployeeRequestDTO employeeRequestDTO);

    EmployeeResponseDTO createEmployeeFromUser(User user, EmployeeRegisterRequest request);

    EmployeeResponseDTO getEmployeeById(String id);

    EmployeeResponseDTO getEmployeeByEmail(String email);

    EmployeeResponseDTO getEmployeeByEmployeeNumber(String employeeNumber);

    List<EmployeeResponseDTO> getAllEmployees();

    List<EmployeeResponseDTO> getEmployeesByRole(String role);

    List<EmployeeResponseDTO> getActiveEmployees();

    EmployeeResponseDTO updateEmployee(String id, EmployeeRequestDTO employeeRequestDTO);

    void deleteEmployee(String id);

    void activateEmployee(String id);

    void deactivateEmployee(String id);

    long countActiveEmployees();

    long countByRole(String role);
}
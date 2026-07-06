package org.example.stage_atb.Service.impl;

import org.example.stage_atb.Service.IEmployeeService;
import org.example.stage_atb.dto.request.EmployeeRegisterRequest;
import org.example.stage_atb.dto.request.EmployeeRequestDTO;
import org.example.stage_atb.dto.response.EmployeeResponseDTO;
import org.example.stage_atb.entity.Employee;
import org.example.stage_atb.entity.User;
import org.example.stage_atb.enums.EmployeeStatus;
import org.example.stage_atb.enums.UserRole;
import org.example.stage_atb.Mappers.EmployeeMapper;
import org.example.stage_atb.Repositories.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class EmployeeServiceImpl implements IEmployeeService {

    private final EmployeeRepository employeeRepository;
    private final EmployeeMapper employeeMapper;

    @Override
    public EmployeeResponseDTO createEmployee(EmployeeRequestDTO requestDTO) {
        log.info("Creating employee: {}", requestDTO.getEmail());

        if (employeeRepository.findByEmail(requestDTO.getEmail()).isPresent()) {
            throw new RuntimeException("Employee already exists with email: " + requestDTO.getEmail());
        }

        Employee employee = employeeMapper.toEntity(requestDTO);
        employee.setEmployeeNumber(generateEmployeeNumber());
        employee.setStatus(EmployeeStatus.ACTIVE);
        employee.setHireDate(requestDTO.getHireDate() != null ? requestDTO.getHireDate() : LocalDateTime.now().toLocalDate());

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Employee created with id: {}", savedEmployee.getId());

        return employeeMapper.toResponseDTO(savedEmployee);
    }

    // Service/impl/EmployeeServiceImpl.java - MODIFIER createEmployeeFromUser
    @Override
    public EmployeeResponseDTO createEmployeeFromUser(User user, EmployeeRegisterRequest request) {
        log.info("Creating employee from user registration: {}", user.getEmail());

        if (employeeRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Employee already exists with email: " + user.getEmail());
        }

        // ✅ Vérifier si le numéro d'employé existe déjà
        if (employeeRepository.findByEmployeeNumber(request.getEmployeeNumber()).isPresent()) {
            throw new RuntimeException("Employee number already exists: " + request.getEmployeeNumber());
        }

        Employee employee = Employee.builder()
                .employeeNumber(request.getEmployeeNumber())  // ✅ Utiliser le numéro saisi
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .role(user.getRole())
                .status(EmployeeStatus.ACTIVE)
                .department(request.getDepartment())
                .position(request.getPosition())
                .address(request.getAddress())
                .city(request.getCity())
                .country(request.getCountry())
                .hireDate(LocalDateTime.now().toLocalDate())
                .user(user)
                .active(true)
                .createdAt(LocalDateTime.now())
                .build();

        Employee savedEmployee = employeeRepository.save(employee);
        log.info("Employee created from user registration with id: {} and employee number: {}",
                savedEmployee.getId(), savedEmployee.getEmployeeNumber());

        return employeeMapper.toResponseDTO(savedEmployee);
    }

    @Override
    public EmployeeResponseDTO getEmployeeById(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        return employeeMapper.toResponseDTO(employee);
    }

    @Override
    public EmployeeResponseDTO getEmployeeByEmail(String email) {
        Employee employee = employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found with email: " + email));
        return employeeMapper.toResponseDTO(employee);
    }

    @Override
    public EmployeeResponseDTO getEmployeeByEmployeeNumber(String employeeNumber) {
        Employee employee = employeeRepository.findByEmployeeNumber(employeeNumber)
                .orElseThrow(() -> new RuntimeException("Employee not found with number: " + employeeNumber));
        return employeeMapper.toResponseDTO(employee);
    }

    @Override
    public List<EmployeeResponseDTO> getAllEmployees() {
        return employeeRepository.findAll()
                .stream()
                .map(employeeMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<EmployeeResponseDTO> getEmployeesByRole(String role) {
        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            return employeeRepository.findByRole(userRole)
                    .stream()
                    .map(employeeMapper::toResponseDTO)
                    .collect(Collectors.toList());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

    @Override
    public List<EmployeeResponseDTO> getActiveEmployees() {
        return employeeRepository.findAllActive()
                .stream()
                .map(employeeMapper::toResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeResponseDTO updateEmployee(String id, EmployeeRequestDTO requestDTO) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));

        employeeMapper.updateEntity(employee, requestDTO);

        Employee updatedEmployee = employeeRepository.save(employee);
        return employeeMapper.toResponseDTO(updatedEmployee);
    }

    @Override
    public void deleteEmployee(String id) {
        if (!employeeRepository.existsById(id)) {
            throw new RuntimeException("Employee not found with id: " + id);
        }
        employeeRepository.deleteById(id);
        log.info("Employee deleted with id: {}", id);
    }

    @Override
    public void activateEmployee(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        employee.setActive(true);
        employee.setStatus(EmployeeStatus.ACTIVE);
        employeeRepository.save(employee);
        log.info("Employee activated: {}", id);
    }

    @Override
    public void deactivateEmployee(String id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found with id: " + id));
        employee.setActive(false);
        employee.setStatus(EmployeeStatus.INACTIVE);
        employeeRepository.save(employee);
        log.info("Employee deactivated: {}", id);
    }

    @Override
    public long countActiveEmployees() {
        return employeeRepository.countActiveByRole(null);
    }

    @Override
    public long countByRole(String role) {
        try {
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            return employeeRepository.countActiveByRole(userRole);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid role: " + role);
        }
    }

    private String generateEmployeeNumber() {
        return "EMP-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }
}
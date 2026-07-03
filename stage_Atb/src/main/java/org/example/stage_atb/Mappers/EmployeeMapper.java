package org.example.stage_atb.Mappers;

import org.example.stage_atb.dto.request.EmployeeRequestDTO;
import org.example.stage_atb.dto.response.EmployeeResponseDTO;
import org.example.stage_atb.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface EmployeeMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "employeeNumber", ignore = true)
    @Mapping(target = "status", constant = "ACTIVE")
    @Mapping(target = "hireDate", expression = "java(java.time.LocalDate.now())")
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "active", constant = "true")
    Employee toEntity(EmployeeRequestDTO requestDTO);

    @Mapping(target = "managerName", expression = "java(getManagerName(employee))")
    @Mapping(target = "userId", expression = "java(employee.getUser() != null ? employee.getUser().getId() : null)")
    EmployeeResponseDTO toResponseDTO(Employee employee);

    void updateEntity(@MappingTarget Employee employee, EmployeeRequestDTO requestDTO);

    default String getManagerName(Employee employee) {
        // Cette méthode sera implémentée plus tard pour récupérer le nom du manager
        return null;
    }
}
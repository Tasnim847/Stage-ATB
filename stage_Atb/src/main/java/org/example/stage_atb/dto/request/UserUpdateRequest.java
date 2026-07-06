// dto/request/UserUpdateRequest.java
package org.example.stage_atb.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.stage_atb.enums.UserRole;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserUpdateRequest {

    private String username;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private UserRole role;
    private Boolean active;
    private Boolean locked;
}
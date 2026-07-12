package org.example.stage_atb.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.multipart.support.MultipartFilter;

import java.util.Arrays;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;
    private final UserDetailsService userDetailsService;

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public MultipartFilter multipartFilter() {
        MultipartFilter multipartFilter = new MultipartFilter();
        multipartFilter.setMultipartResolverBeanName("multipartResolver");
        return multipartFilter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("*"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
                .addFilterAfter(multipartFilter(), JwtAuthenticationFilter.class)
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                        .requestMatchers("/api-docs/**").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // ============================================
                        // ✅ ROUTES CLIENTS
                        // ============================================
                        .requestMatchers("/api/clients/me").hasRole("CLIENT")
                        .requestMatchers("/api/credit-requests/my-credits/**").hasRole("CLIENT")
                        .requestMatchers("/api/credit-requests/my-credits").hasRole("CLIENT")
                        .requestMatchers("/api/credit-requests/*/simulation").hasRole("CLIENT")

                        // ============================================
                        // ✅ ROUTES ADMIN
                        // ============================================
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/role/**").hasRole("ADMIN")
                        .requestMatchers("/api/users/count/active").hasRole("ADMIN")
                        .requestMatchers("/api/clients/assignment/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/roles/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/audit-logs/**").hasRole("ADMIN")
                        .requestMatchers("/api/admin/audit-logs").hasRole("ADMIN")
                        .requestMatchers("/api/admin/audit-logs/recent").hasRole("ADMIN")
                        .requestMatchers("/api/admin/audit-logs/statistics").hasRole("ADMIN")

                        // ============================================
                        // ✅ ROUTES ANALYSTE
                        // ============================================
                        .requestMatchers("/api/financial-analysis/**").hasAnyRole("ANALYST", "ADMIN")
                        .requestMatchers("/api/risk-analysis/**").hasAnyRole("ANALYST", "ADMIN")
                        .requestMatchers("/api/fraud-alerts/**").hasAnyRole("ANALYST", "ADMIN")
                        .requestMatchers("/api/copilot/**").hasAnyRole("ANALYST", "ADMIN")

                        // ============================================
                        // ✅ ROUTES CLIENTS + ADVISOR + ANALYST + ADMIN
                        // ============================================
                        .requestMatchers("/api/clients/**").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")
                        .requestMatchers("/api/clients/advisor/**").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")

                        // ============================================
                        // ✅ ROUTES CREDIT REQUESTS
                        // ============================================
                        // ✅ GET - Lecture des demandes
                        .requestMatchers(HttpMethod.GET, "/api/credit-requests").hasAnyRole("ADVISOR", "ANALYST", "ADMIN", "MANAGER")
                        .requestMatchers(HttpMethod.GET, "/api/credit-requests/{id}").hasAnyRole("ADVISOR", "ANALYST", "ADMIN", "MANAGER", "CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/credit-requests/client/{clientId}").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/credit-requests/status/{status}").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/credit-requests/**").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")

                        // ✅ POST - Création de demande (TOUS LES RÔLES CONCERNÉS)
                        .requestMatchers(HttpMethod.POST, "/api/credit-requests").hasAnyRole("CLIENT", "ADVISOR", "ANALYST", "ADMIN", "MANAGER")

                        // ✅ PUT/PATCH - Mise à jour
                        .requestMatchers(HttpMethod.PUT, "/api/credit-requests/{id}").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/credit-requests/{id}/status").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/credit-requests/{id}/cancel").hasAnyRole("ADVISOR", "ANALYST", "ADMIN", "MANAGER", "CLIENT")
                        .requestMatchers(HttpMethod.PATCH, "/api/credit-requests/{id}/transmit-to-analyst").hasAnyRole("ADVISOR", "ANALYST", "ADMIN", "MANAGER")

                        // ✅ DELETE
                        .requestMatchers(HttpMethod.DELETE, "/api/credit-requests/{id}").hasAnyRole("ADMIN")

                        // ============================================
                        // ✅ KYC
                        // ============================================
                        .requestMatchers("/api/kyc/**").hasAnyRole("ADVISOR", "ANALYST", "ADMIN")

                        // ============================================
                        // ✅ NOTIFICATIONS
                        // ============================================
                        .requestMatchers("/api/notifications/**").authenticated()
                        .requestMatchers("/api/dashboard/**").authenticated()

                        // ============================================
                        // ✅ SIMULATION
                        // ============================================
                        .requestMatchers("/api/credit-simulations/**").hasAnyRole("CLIENT", "ADVISOR", "ANALYST", "ADMIN", "MANAGER")

                        // ============================================
                        // ✅ DOCUMENTS
                        // ============================================
                        .requestMatchers(HttpMethod.POST, "/api/documents/upload").hasAnyRole("ADVISOR", "ANALYST", "ADMIN", "CLIENT")
                        .requestMatchers(HttpMethod.GET, "/api/documents/**").hasAnyRole("ADVISOR", "ANALYST", "ADMIN", "CLIENT")

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider());

        return http.build();
    }
}
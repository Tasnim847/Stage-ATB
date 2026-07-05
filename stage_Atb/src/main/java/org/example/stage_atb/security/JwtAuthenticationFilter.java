package org.example.stage_atb.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collection;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");

        log.info("🔍 Authorization Header: {}", authHeader != null ? authHeader.substring(0, Math.min(authHeader.length(), 30)) + "..." : "null");
        log.info("🔍 Request URI: {}", request.getRequestURI());

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.warn("⚠️ No Bearer token found");
            filterChain.doFilter(request, response);
            return;
        }

        final String jwt = authHeader.substring(7);
        log.info("🔍 JWT Token: {}...", jwt.substring(0, Math.min(jwt.length(), 30)));

        try {
            final String userEmail = jwtService.extractUsername(jwt);
            log.info("🔍 Extracted email: {}", userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);

                // ✅ Extraire les autorités du token
                Claims claims = jwtService.extractAllClaims(jwt);
                List<String> authoritiesFromToken = claims.get("authorities", List.class);

                Collection<? extends GrantedAuthority> authorities;
                if (authoritiesFromToken != null && !authoritiesFromToken.isEmpty()) {
                    authorities = authoritiesFromToken.stream()
                            .map(SimpleGrantedAuthority::new)
                            .toList();
                    log.info("✅ Authorities from token: {}", authorities);
                } else {
                    // Fallback: utiliser les autorités de UserDetails
                    authorities = userDetails.getAuthorities();
                    log.info("⚠️ Using authorities from UserDetails: {}", authorities);
                }

                if (jwtService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            authorities
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.info("✅ Authentication successful for: {} with authorities: {}", userEmail, authorities);
                } else {
                    log.warn("⚠️ Token invalid for: {}", userEmail);
                }
            }
        } catch (Exception e) {
            log.error("❌ Error processing JWT: {}", e.getMessage(), e);
        }

        filterChain.doFilter(request, response);
    }
}
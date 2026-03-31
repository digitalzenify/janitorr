# ── Stage 1: Build the React frontend ──────────────────────────────────────
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

# Copy dependency files first for layer caching
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

# Copy source and build
COPY frontend/ ./
RUN npm run build


# ── Stage 2: Build the Spring Boot fat JAR ──────────────────────────────────
FROM eclipse-temurin:25-jdk-jammy AS backend-build

WORKDIR /workspace

# Install git (required by the net.nemerosa.versioning Gradle plugin)
RUN apt-get update && apt-get install -y --no-install-recommends git && rm -rf /var/lib/apt/lists/*

# Copy Gradle wrapper and build descriptor files first for layer caching
COPY gradlew gradlew
COPY gradle/ gradle/
COPY settings.gradle.kts gradle.properties build.gradle.kts ./
COPY buildSrc/ buildSrc/

# Copy application source (no frontend/ dir so the buildFrontend Gradle task is skipped)
COPY src/ src/

# Copy pre-built frontend assets so Spring Boot serves them from the classpath
COPY --from=frontend-build /app/frontend/dist src/main/resources/static/

# Initialise a minimal git repo to satisfy the versioning plugin
RUN git init && \
    git config user.email "build@docker" && \
    git config user.name "Docker Build" && \
    git add -A && \
    git commit -m "Docker build"

# Build the fat JAR; buildFrontend task is skipped because frontend/package.json is absent
RUN ./gradlew bootJar --no-daemon


# ── Stage 3: Lightweight runtime image ──────────────────────────────────────
FROM eclipse-temurin:25-jre-jammy AS runtime

WORKDIR /app

# Run as a non-root user for security
RUN groupadd --system janitorr && \
    useradd --system --gid janitorr --no-create-home janitorr

COPY --from=backend-build /workspace/build/libs/janitorr.jar /app/janitorr.jar

RUN chown janitorr:janitorr /app/janitorr.jar

USER janitorr

EXPOSE 6247

ENTRYPOINT ["java", "-Dspring.config.additional-location=optional:/config/application.yml", "-jar", "/app/janitorr.jar"]

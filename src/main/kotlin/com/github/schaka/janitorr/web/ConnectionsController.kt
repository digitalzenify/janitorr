package com.github.schaka.janitorr.web

import com.github.schaka.janitorr.jellyseerr.JellyseerrProperties
import com.github.schaka.janitorr.mediaserver.emby.EmbyProperties
import com.github.schaka.janitorr.mediaserver.jellyfin.JellyfinProperties
import com.github.schaka.janitorr.servarr.radarr.RadarrProperties
import com.github.schaka.janitorr.servarr.sonarr.SonarrProperties
import com.github.schaka.janitorr.web.dto.ConnectionStatus
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.time.Duration

@RestController
@CrossOrigin
@RequestMapping("/api/connections")
class ConnectionsController(
    private val sonarrProperties: SonarrProperties,
    private val radarrProperties: RadarrProperties,
    private val jellyfinProperties: JellyfinProperties,
    private val embyProperties: EmbyProperties,
    private val jellyseerrProperties: JellyseerrProperties
) {

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java.enclosingClass)
        private fun maskApiKey(key: String): String {
            if (key.isEmpty()) return "****"
            if (key.length <= 4) return "****"
            return key.take(4) + "*".repeat(key.length - 4)
        }
    }

    @GetMapping
    fun getConnections(): ResponseEntity<List<Map<String, Any>>> {
        val connections = listOf(
            mapOf(
                "service" to "sonarr",
                "enabled" to sonarrProperties.enabled,
                "url" to sonarrProperties.url,
                "apiKey" to maskApiKey(sonarrProperties.apiKey)
            ),
            mapOf(
                "service" to "radarr",
                "enabled" to radarrProperties.enabled,
                "url" to radarrProperties.url,
                "apiKey" to maskApiKey(radarrProperties.apiKey)
            ),
            mapOf(
                "service" to "jellyfin",
                "enabled" to jellyfinProperties.enabled,
                "url" to jellyfinProperties.url,
                "apiKey" to maskApiKey(jellyfinProperties.apiKey)
            ),
            mapOf(
                "service" to "emby",
                "enabled" to embyProperties.enabled,
                "url" to embyProperties.url,
                "apiKey" to maskApiKey(embyProperties.apiKey)
            ),
            mapOf(
                "service" to "jellyseerr",
                "enabled" to jellyseerrProperties.enabled,
                "url" to jellyseerrProperties.url,
                "apiKey" to maskApiKey(jellyseerrProperties.apiKey)
            )
        )
        return ResponseEntity.ok(connections)
    }

    @PostMapping("/test/{service}")
    fun testConnection(@PathVariable service: String): ResponseEntity<ConnectionStatus> {
        val (url, enabled) = when (service.lowercase()) {
            "sonarr" -> sonarrProperties.url to sonarrProperties.enabled
            "radarr" -> radarrProperties.url to radarrProperties.enabled
            "jellyfin" -> jellyfinProperties.url to jellyfinProperties.enabled
            "emby" -> embyProperties.url to embyProperties.enabled
            "jellyseerr" -> jellyseerrProperties.url to jellyseerrProperties.enabled
            else -> return ResponseEntity.badRequest().body(
                ConnectionStatus(service, "", false, false, "Unknown service: $service")
            )
        }

        if (!enabled) {
            return ResponseEntity.ok(
                ConnectionStatus(service, url, false, false, "Service is disabled in configuration")
            )
        }

        return try {
            val client = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build()
            val request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .timeout(Duration.ofSeconds(10))
                .GET()
                .build()
            val response = client.send(request, HttpResponse.BodyHandlers.ofString())
            val reachable = response.statusCode() in 200..499

            ResponseEntity.ok(
                ConnectionStatus(service, url, enabled, reachable, "HTTP ${response.statusCode()}")
            )
        } catch (e: Exception) {
            log.warn("Connection test failed for {}: {}", service, e.message)
            ResponseEntity.ok(
                ConnectionStatus(service, url, enabled, false, "Connection failed: ${e.message}")
            )
        }
    }
}

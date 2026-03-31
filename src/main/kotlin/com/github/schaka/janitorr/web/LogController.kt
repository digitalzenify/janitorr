package com.github.schaka.janitorr.web

import org.slf4j.LoggerFactory
import org.springframework.core.io.FileSystemResource
import org.springframework.core.io.Resource
import org.springframework.http.HttpHeaders
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import org.springframework.web.server.ResponseStatusException
import org.springframework.http.HttpStatus
import java.nio.file.Files
import java.nio.file.Path
import java.nio.file.Paths

@RestController
@CrossOrigin
@RequestMapping("/api/logs")
class LogController {

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java.enclosingClass)
        private val LOG_DIRECTORIES = listOf(
            Paths.get("logs"),
            Paths.get("log"),
            Paths.get(".")
        )
        private val LOG_EXTENSIONS = setOf("log", "gz")
    }

    @GetMapping("/files")
    fun listLogFiles(): ResponseEntity<List<Map<String, Any>>> {
        val logFiles = mutableListOf<Map<String, Any>>()

        for (logDir in LOG_DIRECTORIES) {
            if (Files.isDirectory(logDir)) {
                Files.list(logDir).use { stream ->
                    stream.filter { path ->
                        val fileName = path.fileName.toString()
                        LOG_EXTENSIONS.any { fileName.endsWith(".$it") }
                    }.forEach { path ->
                        logFiles.add(
                            mapOf(
                                "filename" to path.fileName.toString(),
                                "size" to Files.size(path),
                                "lastModified" to Files.getLastModifiedTime(path).toMillis()
                            )
                        )
                    }
                }
            }
        }

        return ResponseEntity.ok(logFiles)
    }

    @GetMapping("/download/{filename}")
    fun downloadLogFile(@PathVariable filename: String): ResponseEntity<Resource> {
        // Prevent path traversal
        val sanitized = Path.of(filename).fileName.toString()
        if (sanitized != filename || filename.contains("..")) {
            throw ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid filename")
        }

        for (logDir in LOG_DIRECTORIES) {
            val filePath = logDir.resolve(sanitized)
            if (Files.exists(filePath) && Files.isRegularFile(filePath)) {
                val resource = FileSystemResource(filePath)
                return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"$sanitized\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .contentLength(Files.size(filePath))
                    .body(resource)
            }
        }

        throw ResponseStatusException(HttpStatus.NOT_FOUND, "Log file not found: $sanitized")
    }
}

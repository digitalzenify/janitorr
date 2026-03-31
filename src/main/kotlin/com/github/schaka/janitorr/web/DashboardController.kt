package com.github.schaka.janitorr.web

import com.github.schaka.janitorr.cleanup.CleanupRunner
import com.github.schaka.janitorr.config.ApplicationProperties
import com.github.schaka.janitorr.web.data.CleanupHistoryRepository
import com.github.schaka.janitorr.web.data.RuleRepository
import com.github.schaka.janitorr.web.dto.DashboardStats
import com.github.schaka.janitorr.web.dto.RecentActivity
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.scheduling.annotation.Async
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@CrossOrigin
@RequestMapping("/api/dashboard")
class DashboardController(
    private val cleanupRunner: CleanupRunner,
    private val applicationProperties: ApplicationProperties,
    private val ruleRepository: RuleRepository,
    private val historyRepository: CleanupHistoryRepository
) {

    companion object {
        private val log = LoggerFactory.getLogger(this::class.java.enclosingClass)
    }

    @GetMapping("/stats")
    fun getStats(): ResponseEntity<DashboardStats> {
        val now = LocalDateTime.now()
        val last7Days = historyRepository.findByTimestampBetween(now.minusDays(7), now)
        val last30Days = historyRepository.findByTimestampBetween(now.minusDays(30), now)

        val stats = DashboardStats(
            totalRules = ruleRepository.count(),
            itemsDeletedLast7Days = last7Days.size.toLong(),
            itemsDeletedLast30Days = last30Days.size.toLong(),
            storageReclaimedBytes = last30Days.sumOf { it.fileSizeBytes },
            // CleanupRunner runs hourly via @Scheduled(fixedDelay = 1h) — approximate next run
            nextCleanupTime = now.plusHours(1),
            dryRun = applicationProperties.dryRun
        )
        return ResponseEntity.ok(stats)
    }

    @GetMapping("/recent-activity")
    fun getRecentActivity(): ResponseEntity<List<RecentActivity>> {
        val entries = historyRepository.findTop20ByOrderByTimestampDesc()
        val activities = entries.map { entry ->
            RecentActivity(
                id = entry.id,
                mediaTitle = entry.mediaTitle,
                mediaType = entry.mediaType,
                ruleName = entry.ruleName,
                actionTaken = entry.actionTaken,
                fileSizeBytes = entry.fileSizeBytes,
                timestamp = entry.timestamp
            )
        }
        return ResponseEntity.ok(activities)
    }

    @PostMapping("/run-cleanup")
    fun runCleanup(): ResponseEntity<Map<String, String>> {
        log.info("Manual cleanup triggered via API")
        triggerCleanup()
        return ResponseEntity.ok(mapOf("status" to "Cleanup triggered", "message" to "Cleanup is running in the background"))
    }

    @Async
    fun triggerCleanup() {
        try {
            cleanupRunner.runSchedules()
        } catch (e: Exception) {
            log.error("Error during manual cleanup run", e)
        }
    }
}

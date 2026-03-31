package com.github.schaka.janitorr.web.data

import org.springframework.data.jpa.repository.JpaRepository
import java.time.LocalDateTime

interface CleanupHistoryRepository : JpaRepository<CleanupHistoryEntry, Long> {
    fun findByTimestampBetween(start: LocalDateTime, end: LocalDateTime): List<CleanupHistoryEntry>
    fun findTop20ByOrderByTimestampDesc(): List<CleanupHistoryEntry>
}

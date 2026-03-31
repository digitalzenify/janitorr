package com.github.schaka.janitorr.web.data

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.LocalDateTime

interface CleanupHistoryRepository : JpaRepository<CleanupHistoryEntry, Long> {
    fun findByTimestampBetween(start: LocalDateTime, end: LocalDateTime): List<CleanupHistoryEntry>
    fun findTop20ByOrderByTimestampDesc(): List<CleanupHistoryEntry>

    @Query("SELECT COALESCE(SUM(e.fileSizeBytes), 0) FROM CleanupHistoryEntry e")
    fun sumFileSizeBytes(): Long
}

package com.github.schaka.janitorr.web

import com.github.schaka.janitorr.web.data.CleanupHistoryEntry
import com.github.schaka.janitorr.web.data.CleanupHistoryRepository
import com.github.schaka.janitorr.web.dto.HistorySummary
import org.springframework.data.domain.Page
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.time.LocalDateTime

@RestController
@CrossOrigin
@RequestMapping("/api/history")
class HistoryController(
    private val historyRepository: CleanupHistoryRepository
) {

    @GetMapping
    fun getHistory(
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int,
        @RequestParam(required = false) startDate: LocalDateTime?,
        @RequestParam(required = false) endDate: LocalDateTime?
    ): ResponseEntity<Page<CleanupHistoryEntry>> {
        val pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"))

        val result = if (startDate != null && endDate != null) {
            historyRepository.findByTimestampBetween(startDate, endDate)
                .let { entries ->
                    val start = page * size
                    val end = minOf(start + size, entries.size)
                    val content = if (start < entries.size) entries.subList(start, end) else emptyList()
                    org.springframework.data.domain.PageImpl(content, pageable, entries.size.toLong())
                }
        } else {
            historyRepository.findAll(pageable)
        }

        return ResponseEntity.ok(result)
    }

    @GetMapping("/summary")
    fun getSummary(): ResponseEntity<HistorySummary> {
        val totalItems = historyRepository.count()
        val storageFreed = historyRepository.sumFileSizeBytes()
        val mostActiveRule = historyRepository.findTop20ByOrderByTimestampDesc()
            .mapNotNull { it.ruleName }
            .groupingBy { it }
            .eachCount()
            .maxByOrNull { it.value }
            ?.key

        val summary = HistorySummary(
            totalItems = totalItems,
            storageFreedBytes = storageFreed,
            mostActiveRule = mostActiveRule
        )
        return ResponseEntity.ok(summary)
    }
}

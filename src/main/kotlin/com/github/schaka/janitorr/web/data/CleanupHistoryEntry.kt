package com.github.schaka.janitorr.web.data

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "cleanup_history")
data class CleanupHistoryEntry(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var mediaTitle: String = "",
    @Enumerated(EnumType.STRING)
    var mediaType: MediaTypeFilter = MediaTypeFilter.BOTH,
    var ruleName: String? = null,
    var actionTaken: String = "",
    var fileSizeBytes: Long = 0,
    var timestamp: LocalDateTime = LocalDateTime.now()
)

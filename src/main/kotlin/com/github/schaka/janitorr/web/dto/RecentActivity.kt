package com.github.schaka.janitorr.web.dto

import com.github.schaka.janitorr.web.data.MediaTypeFilter
import java.time.LocalDateTime

data class RecentActivity(
    val id: Long,
    val mediaTitle: String,
    val mediaType: MediaTypeFilter,
    val ruleName: String?,
    val actionTaken: String,
    val fileSizeBytes: Long,
    val timestamp: LocalDateTime
)

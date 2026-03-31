package com.github.schaka.janitorr.web.data

import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "rules")
data class Rule(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,
    var name: String = "",
    var description: String = "",
    @Enumerated(EnumType.STRING)
    var mediaType: MediaTypeFilter = MediaTypeFilter.BOTH,
    var enabled: Boolean = true,
    var cronExpression: String = "0 0 3 * * *",
    var gracePeriodDays: Int = 14,
    @Column(columnDefinition = "TEXT")
    var conditionsJson: String = "[]",
    @Column(columnDefinition = "TEXT")
    var actionsJson: String = "[]",
    var createdAt: LocalDateTime = LocalDateTime.now(),
    var updatedAt: LocalDateTime = LocalDateTime.now()
)

enum class MediaTypeFilter { MOVIE, TV_SHOW, BOTH }

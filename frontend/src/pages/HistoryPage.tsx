import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getHistory, getHistorySummary } from '@/api/client'
import { ChevronLeft, ChevronRight, Trash2, HardDrive, Activity } from 'lucide-react'
import { format } from 'date-fns'

interface HistoryEntry {
  id: number
  date: string
  title: string
  type: string
  ruleName: string
  action: string
  size: string
}

interface HistorySummary {
  totalDeleted: number
  totalStorageReclaimed: string
  lastCleanup: string
}

interface HistoryResponse {
  content: HistoryEntry[]
  totalPages: number
  totalElements: number
  number: number
}

export function HistoryPage() {
  const [history, setHistory] = useState<HistoryResponse | null>(null)
  const [summary, setSummary] = useState<HistorySummary | null>(null)
  const [page, setPage] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [historyRes, summaryRes] = await Promise.all([
          getHistory({ page, size: 20 }),
          getHistorySummary(),
        ])
        setHistory(historyRes.data)
        setSummary(summaryRes.data)
      } catch {
        setHistory({ content: [], totalPages: 0, totalElements: 0, number: 0 })
        setSummary({ totalDeleted: 0, totalStorageReclaimed: '0 GB', lastCleanup: 'Never' })
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [page])

  const summaryCards = [
    { title: 'Total Deleted', value: summary?.totalDeleted ?? '—', icon: Trash2 },
    { title: 'Storage Reclaimed', value: summary?.totalStorageReclaimed ?? '—', icon: HardDrive },
    { title: 'Last Cleanup', value: summary?.lastCleanup ?? '—', icon: Activity },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">History</h2>
        <p className="text-muted-foreground">View past cleanup operations</p>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{card.title}</CardTitle>
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-8 w-20 animate-pulse rounded bg-muted" />
              ) : (
                <div className="text-2xl font-bold">{card.value}</div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* History table */}
      <Card>
        <CardHeader>
          <CardTitle>Cleanup History</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : (history?.content.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No history entries yet.</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="pb-2 pr-4">Date</th>
                      <th className="pb-2 pr-4">Title</th>
                      <th className="pb-2 pr-4">Type</th>
                      <th className="pb-2 pr-4">Rule</th>
                      <th className="pb-2 pr-4">Action</th>
                      <th className="pb-2 text-right">Size</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history?.content.map((entry) => (
                      <tr key={entry.id} className="border-b border-border/50">
                        <td className="py-2 pr-4 text-muted-foreground">
                          {formatDate(entry.date)}
                        </td>
                        <td className="py-2 pr-4 font-medium">{entry.title}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="outline">{entry.type}</Badge>
                        </td>
                        <td className="py-2 pr-4 text-muted-foreground">{entry.ruleName}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="secondary">{entry.action}</Badge>
                        </td>
                        <td className="py-2 text-right text-muted-foreground">{entry.size}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {(history?.totalPages ?? 0) > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Page {(history?.number ?? 0) + 1} of {history?.totalPages} ({history?.totalElements} total)
                  </p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(page - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= (history?.totalPages ?? 1) - 1} onClick={() => setPage(page + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), 'MMM d, yyyy HH:mm')
  } catch {
    return dateStr
  }
}

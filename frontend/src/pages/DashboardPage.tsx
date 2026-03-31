import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats, getRecentActivity, runCleanup } from '@/api/client'
import { ListFilter, Trash2, HardDrive, Activity, Play, ScrollText } from 'lucide-react'

interface DashboardStats {
  totalRules: number
  itemsDeleted7d: number
  itemsDeleted30d: number
  storageReclaimed: string
}

interface ActivityItem {
  id: number
  title: string
  type: string
  action: string
  timestamp: string
}

export function DashboardPage() {
  const navigate = useNavigate()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, activityRes] = await Promise.all([
          getDashboardStats(),
          getRecentActivity(),
        ])
        setStats(statsRes.data)
        setActivity(activityRes.data)
      } catch {
        // API not available yet — show defaults
        setStats({ totalRules: 0, itemsDeleted7d: 0, itemsDeleted30d: 0, storageReclaimed: '0 GB' })
        setActivity([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleRunCleanup = async () => {
    setRunning(true)
    try {
      await runCleanup()
    } catch {
      // ignore
    } finally {
      setRunning(false)
    }
  }

  const statCards = [
    { title: 'Total Rules', value: stats?.totalRules ?? '—', icon: ListFilter },
    { title: 'Deleted (7d)', value: stats?.itemsDeleted7d ?? '—', icon: Trash2 },
    { title: 'Deleted (30d)', value: stats?.itemsDeleted30d ?? '—', icon: Activity },
    { title: 'Storage Reclaimed', value: stats?.storageReclaimed ?? '—', icon: HardDrive },
  ]

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Overview of your Janitorr instance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/logs')}>
            <ScrollText className="mr-2 h-4 w-4" />
            View Logs
          </Button>
          <Button onClick={handleRunCleanup} disabled={running}>
            <Play className="mr-2 h-4 w-4" />
            {running ? 'Running…' : 'Run Cleanup Now'}
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
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

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : activity.length === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity. Run a cleanup to get started.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{item.type}</Badge>
                    <Badge variant="outline">{item.action}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

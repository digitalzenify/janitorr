import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getConnections, testConnection } from '@/api/client'
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react'

interface ConnectionStatus {
  service: string
  displayName: string
  url: string
  connected: boolean
  version?: string
  apiKeyMasked: string
}

export function SettingsPage() {
  const [connections, setConnections] = useState<ConnectionStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [testing, setTesting] = useState<string | null>(null)

  const fetchConnections = async () => {
    try {
      const res = await getConnections()
      setConnections(res.data)
    } catch {
      setConnections([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConnections() }, [])

  const handleTestConnection = async (service: string) => {
    setTesting(service)
    try {
      const res = await testConnection(service)
      setConnections((prev) =>
        prev.map((c) =>
          c.service === service ? { ...c, connected: res.data.connected, version: res.data.version } : c
        )
      )
    } catch {
      setConnections((prev) =>
        prev.map((c) => (c.service === service ? { ...c, connected: false } : c))
      )
    } finally {
      setTesting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">Manage service connections and configuration</p>
        </div>
        <Button variant="outline" onClick={fetchConnections}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service Connections</CardTitle>
          <CardDescription>Status of connected services. Configuration is managed via application.yml.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-16 animate-pulse rounded bg-muted" />
              ))}
            </div>
          ) : connections.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No service connections configured. Check your application.yml file.
            </p>
          ) : (
            <div className="space-y-3">
              {connections.map((conn) => (
                <div key={conn.service} className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-4">
                    {conn.connected ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{conn.displayName}</span>
                        <Badge variant={conn.connected ? 'default' : 'destructive'}>
                          {conn.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                        {conn.version && (
                          <Badge variant="outline">v{conn.version}</Badge>
                        )}
                      </div>
                      <div className="mt-1 flex gap-4 text-xs text-muted-foreground">
                        <span>{conn.url}</span>
                        <span>API Key: {conn.apiKeyMasked}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={testing === conn.service}
                    onClick={() => handleTestConnection(conn.service)}
                  >
                    {testing === conn.service ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Test
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

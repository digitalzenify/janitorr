import { Card, CardContent } from '@/components/ui/card'
import { Film } from 'lucide-react'

export function MediaPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Media Browser</h2>
        <p className="text-muted-foreground">Browse and manage your media library</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-20">
          <Film className="mb-4 h-16 w-16 text-muted-foreground" />
          <h3 className="text-xl font-semibold">Coming Soon</h3>
          <p className="mt-2 max-w-md text-center text-sm text-muted-foreground">
            The media browser will allow you to explore your library, see which items match
            cleanup rules, and manually tag or exclude items from processing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

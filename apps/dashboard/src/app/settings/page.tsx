import { MainLayout } from '@/components/layout/main-layout'
import { SettingsTabs } from '@/components/settings/settings-tabs'
import { Button } from '@/components/ui/button'
import { Save, RefreshCw, Download, Upload, AlertTriangle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">
              Configure security policies, compliance rules, and system preferences
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload className="h-4 w-4" />
              Import Config
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Config
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </Button>
            <Button size="sm" className="gap-2">
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Changes to security policies will affect all future scans. Existing findings will not be re-evaluated automatically.
          </AlertDescription>
        </Alert>
        
        <SettingsTabs />
      </div>
    </MainLayout>
  )
}
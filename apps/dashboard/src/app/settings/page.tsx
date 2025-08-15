import { MainLayout } from '@/components/layout/main-layout'
import { SettingsTabs } from '@/components/settings/settings-tabs'

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Configure your RepoFlight instance and scanning preferences
          </p>
        </div>
        
        <SettingsTabs />
      </div>
    </MainLayout>
  )
}
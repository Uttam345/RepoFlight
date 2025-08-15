'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

export function SettingsTabs() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="scanning">Scanning</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
              <CardDescription>
                Manage your organization's basic configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="org-name">Organization Name</Label>
                <input
                  id="org-name"
                  type="text"
                  defaultValue="Acme Corporation"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default-branch">Default Branch</Label>
                <input
                  id="default-branch"
                  type="text"
                  defaultValue="main"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-scan new repositories</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically run security scans on newly connected repositories
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable compliance monitoring</Label>
                  <p className="text-sm text-muted-foreground">
                    Monitor repositories for compliance with organizational policies
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="scanning" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scan Configuration</CardTitle>
              <CardDescription>
                Configure how and when scans are performed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Scan Types</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Security Scanning</Label>
                    <p className="text-sm text-muted-foreground">
                      SAST, DAST, and dependency vulnerability scanning
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>License Compliance</Label>
                    <p className="text-sm text-muted-foreground">
                      Check dependencies for license compliance issues
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Code Quality</Label>
                    <p className="text-sm text-muted-foreground">
                      Analyze code quality and maintainability metrics
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Schedule</h4>
                
                <div className="space-y-2">
                  <Label>Scan Frequency</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                    <option value="daily">Daily</option>
                    <option value="weekly" selected>Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="manual">Manual only</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label>Scan Time</Label>
                  <input
                    type="time"
                    defaultValue="02:00"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Configure when and how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Email Notifications</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Critical findings</Label>
                    <p className="text-sm text-muted-foreground">
                      Immediate notification for critical security issues
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Scan completion</Label>
                    <p className="text-sm text-muted-foreground">
                      Notification when scans complete successfully
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Weekly summary</Label>
                    <p className="text-sm text-muted-foreground">
                      Weekly digest of security and compliance status
                    </p>
                  </div>
                  <Switch />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Slack Integration</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Enable Slack notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications to your Slack workspace
                    </p>
                  </div>
                  <Switch />
                </div>
                
                <div className="space-y-2">
                  <Label>Slack Channel</Label>
                  <input
                    type="text"
                    placeholder="#security-alerts"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>
                Manage your GitHub App connection and permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Connection Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Connected as RepoFlight App
                  </p>
                </div>
                <Badge variant="default">Connected</Badge>
              </div>
              
              <div className="space-y-2">
                <Label>Installed Repositories</Label>
                <p className="text-sm text-muted-foreground">
                  12 repositories are being monitored
                </p>
              </div>
              
              <div className="flex space-x-2">
                <Button variant="outline">Manage Permissions</Button>
                <Button variant="outline">Sync Repositories</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>JIRA Integration</CardTitle>
              <CardDescription>
                Automatically create JIRA tickets for security findings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Connection Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Not connected
                  </p>
                </div>
                <Badge variant="outline">Disconnected</Badge>
              </div>
              
              <Button>Connect JIRA</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
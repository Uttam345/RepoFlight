import { Badge } from "@/components/ui/badge"
import { GitCommit, Shield, AlertTriangle, CheckCircle, Bot } from "lucide-react"

export function RecentActivity() {
  const activities = [
    {
      type: "scan_completed",
      repo: "frontend-app",
      message: "Security scan completed",
      time: "5 minutes ago",
      icon: Shield,
      status: "success",
    },
    {
      type: "vulnerability_found",
      repo: "api-service",
      message: "Critical vulnerability detected in dependencies",
      time: "2 hours ago",
      icon: AlertTriangle,
      status: "error",
    },
    {
      type: "auto_fix",
      repo: "mobile-app",
      message: "Auto-remediation PR created for license compliance",
      time: "4 hours ago",
      icon: Bot,
      status: "info",
    },
    {
      type: "compliance_check",
      repo: "backend-service",
      message: "Compliance check passed",
      time: "6 hours ago",
      icon: CheckCircle,
      status: "success",
    },
    {
      type: "new_commit",
      repo: "frontend-app",
      message: "New commit pushed - triggering security scan",
      time: "8 hours ago",
      icon: GitCommit,
      status: "info",
    },
    {
      type: "scan_completed",
      repo: "data-pipeline",
      message: "License compliance scan completed",
      time: "12 hours ago",
      icon: Shield,
      status: "success",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600"
      case "error":
        return "text-red-600"
      case "info":
        return "text-blue-600"
      default:
        return "text-muted-foreground"
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return "default"
      case "error":
        return "destructive"
      case "info":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div
          key={index}
          className="flex items-start space-x-4 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <activity.icon className={`h-5 w-5 mt-0.5 ${getStatusColor(activity.status)}`} />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{activity.message}</div>
              <div className="text-xs text-muted-foreground">{activity.time}</div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {activity.repo}
              </Badge>
              <Badge variant={getStatusBadge(activity.status)} className="text-xs">
                {activity.type.replace("_", " ")}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Shield,
  Menu,
  X,
  Home,
  FolderGit2,
  Scan,
  Settings,
  Bell,
  Search,
  Command,
  ChevronRight,
  Zap,
  AlertTriangle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MainLayoutProps {
  children: React.ReactNode
}

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home, badge: null, shortcut: "⌘D" },
  { name: "Repositories", href: "/repositories", icon: FolderGit2, badge: "12", shortcut: "⌘R" },
  { name: "Security Scans", href: "/scans", icon: Scan, badge: "3", shortcut: "⌘S" },
  { name: "Vulnerabilities", href: "/findings", icon: AlertTriangle, badge: "23", shortcut: "⌘V" },
  { name: "Settings", href: "/settings", icon: Settings, badge: null, shortcut: "⌘," },
]

const notifications = [
  {
    id: 1,
    title: "Critical vulnerability found",
    description: "SQL injection in user-auth module",
    time: "2m ago",
    type: "critical",
  },
  {
    id: 2,
    title: "Scan completed",
    description: "Repository 'frontend-app' scanned successfully",
    time: "5m ago",
    type: "success",
  },
  {
    id: 3,
    title: "Compliance check failed",
    description: "GDPR policy violation detected",
    time: "10m ago",
    type: "warning",
  },
]

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case "k":
            e.preventDefault()
            setSearchOpen(true)
            break
          case "d":
            e.preventDefault()
            window.location.href = "/"
            break
          case "r":
            e.preventDefault()
            window.location.href = "/repositories"
            break
          case "s":
            e.preventDefault()
            window.location.href = "/scans"
            break
          case "v":
            e.preventDefault()
            window.location.href = "/findings"
            break
          case ",":
            e.preventDefault()
            window.location.href = "/settings"
            break
        }
      }
      if (e.key === "Escape") {
        setSearchOpen(false)
        setSidebarOpen(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean)
    const breadcrumbs = [{ name: "Dashboard", href: "/" }]

    let currentPath = ""
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      const navItem = navigationItems.find((item) => item.href === currentPath)
      if (navItem) {
        breadcrumbs.push({ name: navItem.name, href: currentPath })
      } else {
        breadcrumbs.push({
          name: segment.charAt(0).toUpperCase() + segment.slice(1),
          href: currentPath,
        })
      }
    })

    return breadcrumbs
  }

  return (
    <div className="min-h-screen bg-background">
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed left-1/2 top-1/4 -translate-x-1/2 w-full max-w-2xl mx-4">
            <div className="bg-background border border-border rounded-xl shadow-2xl overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-border">
                <Search className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search repositories, scans, vulnerabilities..."
                  className="border-0 bg-transparent text-lg focus-visible:ring-0 focus-visible:ring-offset-0"
                  autoFocus
                />
                <kbd className="pointer-events-none inline-flex h-6 select-none items-center gap-1 rounded border bg-muted px-2 text-xs font-mono text-muted-foreground">
                  ESC
                </kbd>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                <div className="text-xs font-medium text-muted-foreground px-3 py-2">Quick Actions</div>
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSearchOpen(false)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted transition-colors"
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="flex-1">{item.name}</span>
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-xs font-mono text-muted-foreground">
                      {item.shortcut}
                    </kbd>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-sidebar border-r border-sidebar-border transform transition-transform">
            <SidebarContent onClose={() => setSidebarOpen(false)} pathname={pathname} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-sidebar border-r border-sidebar-border px-6 py-4">
          <SidebarContent pathname={pathname} />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden hover:bg-primary/10 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open sidebar</span>
          </Button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Button
                variant="outline"
                className="relative w-full max-w-lg justify-start text-sm text-muted-foreground hover:bg-muted/50 transition-colors bg-transparent"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="mr-2 h-4 w-4" />
                <span>Search repositories, scans, or issues...</span>
                <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-xs font-mono text-muted-foreground">
                  <Command className="h-3 w-3" />K
                </kbd>
              </Button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
            {getBreadcrumbs().map((crumb, index) => (
              <div key={crumb.href} className="flex items-center gap-2">
                {index > 0 && <ChevronRight className="h-3 w-3" />}
                <Link
                  href={crumb.href}
                  className={`hover:text-foreground transition-colors ${
                    index === getBreadcrumbs().length - 1 ? "text-foreground font-medium" : ""
                  }`}
                >
                  {crumb.name}
                </Link>
              </div>
            ))}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="relative hover:bg-primary/10 transition-colors">
                  <Bell className="h-5 w-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs bg-red-500 text-white animate-pulse">
                    {notifications.length}
                  </Badge>
                  <span className="sr-only">View notifications</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex items-center justify-between">
                  <span>Notifications</span>
                  <Badge variant="secondary">{notifications.length}</Badge>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-4">
                      <div className="flex items-center gap-2 w-full">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            notification.type === "critical"
                              ? "bg-red-500"
                              : notification.type === "warning"
                                ? "bg-yellow-500"
                                : "bg-green-500"
                          }`}
                        />
                        <span className="font-medium text-sm">{notification.title}</span>
                        <span className="text-xs text-muted-foreground ml-auto">{notification.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground ml-4">{notification.description}</p>
                    </DropdownMenuItem>
                  ))}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-primary">View all notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full hover:ring-2 hover:ring-primary/20 transition-all"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/placeholder-user.jpg" alt="User" />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                      JD
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">John Doe</p>
                    <p className="text-xs leading-none text-muted-foreground">john@company.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/team" className="flex items-center gap-2">
                    <FolderGit2 className="h-4 w-4" />
                    Team Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/billing" className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    Billing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600">Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  )
}

function SidebarContent({ onClose, pathname }: { onClose?: () => void; pathname: string }) {
  const isActiveRoute = (href: string) => {
    if (href === "/") {
      return pathname === "/"
    }
    return pathname.startsWith(href)
  }

  return (
    <>
      <div className="flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg group-hover:shadow-xl transition-shadow">
            <Shield className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold text-sidebar-foreground">RepoFlight</span>
            <span className="text-xs text-sidebar-foreground/70">Security Copilot</span>
          </div>
        </Link>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto lg:hidden hover:bg-sidebar-accent transition-colors"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <nav className="flex flex-1 flex-col">
        <ul role="list" className="flex flex-1 flex-col gap-y-1">
          {navigationItems.map((item) => {
            const isActive = isActiveRoute(item.href)
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`group flex gap-x-3 rounded-lg p-3 text-sm font-medium leading-6 transition-all duration-200 ${
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-sm"
                  }`}
                  onClick={onClose}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? "text-primary" : ""
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {item.badge && (
                      <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
                        {item.badge}
                      </Badge>
                    )}
                    <kbd className="hidden group-hover:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 text-xs font-mono text-muted-foreground">
                      {item.shortcut}
                    </kbd>
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>

        <div className="mt-auto">
          <div className="rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 p-4 border border-primary/20">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-primary-foreground text-xs font-medium shadow-sm">
                AI
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground">AI Assistant</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">Ready to help</p>
              </div>
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            </div>
          </div>
        </div>
      </nav>
    </>
  )
}
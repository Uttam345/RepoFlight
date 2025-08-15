'use client'

import { useState } from 'react'
import { Search, Filter, SortAsc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

export function FindingsFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSeverity, setSelectedSeverity] = useState('all')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const filterOptions = [
    { id: 'unresolved', label: 'Unresolved', count: 67 },
    { id: 'resolved', label: 'Resolved', count: 23 },
    { id: 'false-positive', label: 'False Positive', count: 8 },
    { id: 'security', label: 'Security', count: 45 },
    { id: 'compliance', label: 'Compliance', count: 22 },
    { id: 'license', label: 'License', count: 12 },
  ]

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => 
      prev.includes(filterId) 
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={selectedSeverity} onValueChange={setSelectedSeverity}>
          <TabsList>
            <TabsTrigger value="all">All Findings</TabsTrigger>
            <TabsTrigger value="critical">Critical</TabsTrigger>
            <TabsTrigger value="high">High</TabsTrigger>
            <TabsTrigger value="medium">Medium</TabsTrigger>
            <TabsTrigger value="low">Low</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <SortAsc className="mr-2 h-4 w-4" />
            Sort by Severity
          </Button>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            More Filters
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search findings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <Badge
            key={option.id}
            variant={selectedFilters.includes(option.id) ? "default" : "outline"}
            className="cursor-pointer hover:bg-accent"
            onClick={() => toggleFilter(option.id)}
          >
            {option.label} ({option.count})
          </Badge>
        ))}
      </div>
      
      {selectedFilters.length > 0 && (
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          {selectedFilters.map((filterId) => {
            const option = filterOptions.find(opt => opt.id === filterId)
            return (
              <Badge key={filterId} variant="secondary" className="cursor-pointer">
                {option?.label}
                <button
                  onClick={() => toggleFilter(filterId)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )
          })}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedFilters([])}
            className="text-xs"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  )
}
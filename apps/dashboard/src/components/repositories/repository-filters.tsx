'use client'

import { useState } from 'react'
import { Search, Filter, SortAsc } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function RepositoryFilters() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const filterOptions = [
    { id: 'private', label: 'Private', count: 8 },
    { id: 'public', label: 'Public', count: 4 },
    { id: 'critical', label: 'Critical Issues', count: 2 },
    { id: 'warning', label: 'Warnings', count: 5 },
    { id: 'healthy', label: 'Healthy', count: 5 },
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
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>
        
        <Button variant="outline" size="sm">
          <SortAsc className="mr-2 h-4 w-4" />
          Sort
        </Button>
        
        <Button variant="outline" size="sm">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
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
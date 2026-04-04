'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { theme } from '@/lib/theme'

import { Contributor, Tab } from './types/analytics'
import ContributorsSidebar from './components/ContributorsSidebar'
import ContributorOverview from './components/ContributorOverview'
import TabBar from './components/TabBar'
import AnalyticsContent from './components/AnalyticsContent'

export default function RepoAnalytics() {
  const { owner, repo } = useParams<{ owner: string; repo: string }>()
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [selected, setSelected] = useState<Contributor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [collapsed, setCollapsed] = useState(false)
  const [tab, setTab] = useState<Tab>('Timeline')

  useEffect(() => {
    fetch(`/api/analytics?owner=${owner}&repo=${repo}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setError(data.error); return }
        setContributors(data)
        setSelected(data[0] ?? null)
      })
      .catch(() => setError('Failed to fetch data'))
      .finally(() => setLoading(false))
  }, [owner, repo])

  if (loading) return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.bg,
      color: theme.muted,
      fontFamily: 'monospace',
    }}>
      <p>Analyzing {owner}/{repo}...</p>
    </div>
  )

  if (error) return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      alignItems: 'center',
      justifyContent: 'center',
      background: theme.bg,
      color: theme.red,
      fontFamily: 'monospace',
    }}>
      <p>Error: {error}</p>
    </div>
  )

  const leaderboard = [...contributors].sort((a, b) => b.totalCommits - a.totalCommits)

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: theme.bg,
      color: theme.text,
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    }}>
      <ContributorsSidebar
        contributors={leaderboard}
        selected={selected}
        collapsed={collapsed}
        owner={owner}
        repo={repo}
        onSelect={setSelected}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />

      {selected && (
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <ContributorOverview selected={selected} />

          <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', flex: 1, overflowY: 'scroll' }}>
            <TabBar active={tab} onChange={setTab} />
            <AnalyticsContent tab={tab} owner={owner} repo={repo} selected={selected} />
          </div>
        </div>
      )}
    </div>
  )
}
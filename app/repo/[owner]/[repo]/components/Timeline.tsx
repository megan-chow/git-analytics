'use client'
import { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'

type RawEvent = {
  type: 'commit' | 'merged' | 'pr_opened'
  title: string
  sub: string
}

type TimelineEvent = {
  type: string
  color: string
  icon: string
  title: string
  sub: string
}

type TimelineGroup = {
  date: string
  events: TimelineEvent[]
}

const EVENT_STYLES: Record<string, { color: string; icon: string; label: string }> = {
  commit:    { color: theme.blue,   icon: '⬡', label: 'commit' },
  merged:    { color: theme.purple, icon: '⎇', label: 'merged' },
  pr_opened: { color: theme.green,  icon: '⎇', label: 'PR opened' },
}

function toTimelineGroup(date: string, events: RawEvent[]): TimelineGroup {
  return {
    date,
    events: events.map(e => {
      const style = EVENT_STYLES[e.type] ?? EVENT_STYLES.commit
      return {
        type: style.label,
        color: style.color,
        icon: style.icon,
        title: e.title,
        sub: e.sub,
      }
    })
  }
}

type Props = {
  owner: string
  repo: string
  author: string
}

export default function Timeline({ owner, repo, author }: Props) {
  const [groups, setGroups] = useState<TimelineGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch(`/api/timeline?owner=${owner}&repo=${repo}&author=${author}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        const grouped = Object.entries(data as Record<string, RawEvent[]>)
          .map(([date, events]) => toTimelineGroup(date, events))
        setGroups(grouped)
      })
      .catch(() => setError('Failed to fetch timeline'))
      .finally(() => setLoading(false))
  }, [owner, repo, author])

  if (loading) return (
    <p style={{ color: theme.muted, fontSize: '13px' }}>Loading timeline...</p>
  )

  if (error) return (
    <p style={{ color: theme.red, fontSize: '13px' }}>Error: {error}</p>
  )

  if (groups.length === 0) return (
    <p style={{ color: theme.muted, fontSize: '13px' }}>No activity found.</p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {groups.map(({ date, events }) => (
        <div key={date}>
          <p style={{
            fontSize: '11px',
            color: theme.muted,
            letterSpacing: '0.08em',
            marginBottom: '12px',
          }}>
            {date}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {events.map((e, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                borderRadius: '8px',
                background: theme.surface,
                border: `1px solid ${theme.border}`,
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: e.color + '22',
                  border: `1px solid ${e.color}44`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px',
                  color: e.color,
                  flexShrink: 0,
                }}>
                  {e.icon}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '3px',
                  }}>
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: e.color + '22',
                      color: e.color,
                      letterSpacing: '0.05em',
                    }}>
                      {e.type}
                    </span>
                    <span style={{ fontSize: '13px', color: theme.text }}>{e.title}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '11px', color: theme.muted }}>{e.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
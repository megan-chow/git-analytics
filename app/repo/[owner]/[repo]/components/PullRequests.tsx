import { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'

type PR = {
  number: number
  title: string
  state: string
  merged: boolean
  draft: boolean
  body: string
  createdAt: string
  updatedAt: string
  mergedAt: string | null
  closedAt: string | null
  additions: number
  deletions: number
  changedFiles: number
  comments: number
  reviewComments: number
  url: string
  baseBranch: string
  headBranch: string
}

type Props = {
  owner: string
  repo: string
  author: string
}

function PRStatus({ pr }: { pr: PR }) {
  const label = pr.draft ? 'Draft' : pr.merged ? 'Merged' : pr.state === 'open' ? 'Open' : 'Closed'
  const color = pr.draft ? theme.muted : pr.merged ? theme.purple : pr.state === 'open' ? theme.green : theme.red
  return (
    <span style={{
      fontSize: '10px', fontWeight: 600, color,
      border: `1px solid ${color}`, borderRadius: '4px',
      padding: '2px 6px', flexShrink: 0,
    }}>
      {label}
    </span>
  )
}

function timeAgo(dateStr: string) {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function timeBetween(a: string, b: string) {
  const hours = Math.floor(Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 3600000)
  return hours < 24 ? `${hours}h` : `${Math.floor(hours / 24)}d`
}

export default function PullRequests({ owner, repo, author }: Props) {
  const [prs, setPRs] = useState<PR[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedPR, setExpandedPR] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    setExpandedPR(null)
    fetch(`/api/pullrequests?owner=${owner}&repo=${repo}&author=${author}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setPRs(data)
      })
      .finally(() => setLoading(false))
  }, [author])

  if (loading) return <p style={{ color: theme.muted, fontSize: '13px' }}>Loading pull requests...</p>
  if (error) return <p style={{ color: theme.red, fontSize: '13px' }}>Error: {error}</p>
  if (prs.length === 0) return <p style={{ color: theme.muted, fontSize: '13px' }}>No pull requests found.</p>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {prs.map((pr) => {
        const isExpanded = expandedPR === pr.number
        const end = pr.mergedAt ?? pr.closedAt ?? new Date().toISOString()
        const timeOpen = timeBetween(pr.createdAt, end)

        return (
          <div key={pr.number} style={{
            background: theme.surface, border: `1px solid ${theme.border}`,
            borderRadius: '8px', overflow: 'hidden',
          }}>
            {/* Header */}
            <div onClick={() => setExpandedPR(prev => prev === pr.number ? null : pr.number)}
              style={{ padding: '14px 16px', cursor: 'pointer', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <PRStatus pr={pr} />
                  <p style={{ fontSize: '13px', color: theme.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pr.title}
                  </p>
                </div>
                <p style={{ fontSize: '11px', color: theme.muted, margin: 0 }}>
                  #{pr.number}
                  {' · '}opened {timeAgo(pr.createdAt)}
                  {' · '}
                  {pr.merged ? `merged after ${timeOpen}` : pr.state === 'closed' ? `closed after ${timeOpen}` : `open for ${timeOpen}`}
                  {(pr.comments + pr.reviewComments) > 0 && <>{' · '}{pr.comments + pr.reviewComments} comment{pr.comments + pr.reviewComments !== 1 ? 's' : ''}</>}
                </p>
              </div>
              <span style={{ color: theme.muted, fontSize: '12px', flexShrink: 0, marginTop: '2px' }}>
                {isExpanded ? '▲' : '▼'}
              </span>
            </div>

            {/* Expanded */}
            {isExpanded && (
              <div style={{ borderTop: `1px solid ${theme.border}` }}>

                {/* Stats */}
                <div style={{ display: 'flex', gap: '24px', padding: '12px 16px', borderBottom: `1px solid ${theme.border}`, flexWrap: 'wrap' }}>
                  {[
                    { label: 'Additions', value: `+${pr.additions}`, color: theme.green },
                    { label: 'Deletions', value: `-${pr.deletions}`, color: theme.red },
                    { label: 'Files changed', value: String(pr.changedFiles), color: theme.text },
                    { label: 'Comments', value: String(pr.comments + pr.reviewComments), color: theme.text },
                  ].map(({ label, value, color }) => (
                    <div key={label}>
                      <p style={{ fontSize: '10px', color: theme.muted, margin: '0 0 2px' }}>{label}</p>
                      <p style={{ fontSize: '13px', color, margin: 0, fontWeight: 600 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Branch */}
                <div style={{
                  padding: '10px 16px', borderBottom: `1px solid ${theme.border}`,
                  display: 'flex', alignItems: 'center', gap: '8px',
                  fontSize: '12px', fontFamily: "'JetBrains Mono', monospace", color: theme.muted, flexWrap: 'wrap',
                }}>
                  <span style={{ color: theme.blue }}>{pr.headBranch}</span>
                  <span>→</span>
                  <span style={{ color: theme.text }}>{pr.baseBranch}</span>
                </div>

                {/* Dates */}
                <div style={{ padding: '10px 16px', borderBottom: pr.body ? `1px solid ${theme.border}` : undefined, display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                  {([
                    { label: 'Opened', value: formatDate(pr.createdAt) },
                    pr.mergedAt ? { label: 'Merged', value: formatDate(pr.mergedAt) } : null,
                    pr.closedAt && !pr.mergedAt ? { label: 'Closed', value: formatDate(pr.closedAt) } : null,
                  ] as ({ label: string; value: string } | null)[]).filter((x): x is { label: string; value: string } => x !== null).map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ fontSize: '10px', color: theme.muted, margin: '0 0 2px' }}>{label}</p>
                      <p style={{ fontSize: '12px', color: theme.text, margin: 0 }}>{value}</p>
                    </div>
                  ))}
                </div>

                {/* Body */}
                {pr.body && (
                  <div style={{ padding: '12px 16px', fontSize: '12px', color: theme.muted, lineHeight: '1.6', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {pr.body.length > 400 ? pr.body.slice(0, 400) + '…' : pr.body}
                  </div>
                )}

                {/* Link */}
                <div style={{ padding: '10px 16px', borderTop: `1px solid ${theme.border}` }}>
                  <a href={pr.url} target="_blank" rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    style={{ fontSize: '12px', color: theme.blue, textDecoration: 'none' }}>
                    View on GitHub ↗
                  </a>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
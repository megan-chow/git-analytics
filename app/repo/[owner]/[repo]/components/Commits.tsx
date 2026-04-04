import { useEffect, useState } from 'react'
import { theme } from '@/lib/theme'
import { Commit } from '../types/analytics'

type Props = {
  owner: string
  repo: string
  author: string
}

function DiffView({ patch }: { patch: string }) {
  if (!patch) return (
    <p style={{ color: theme.muted, fontSize: '12px', padding: '8px 0' }}>No diff available</p>
  )

  return (
    <div style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: '12px',
      lineHeight: '1.6',
      overflowX: 'auto',
    }}>
      {patch.split('\n').map((line, i) => {
        const bg =
          line.startsWith('+') ? '#10b98118' :
          line.startsWith('-') ? '#f8514918' :
          line.startsWith('@@') ? '#3b82f618' :
          'transparent'

        const color =
          line.startsWith('+') ? theme.green :
          line.startsWith('-') ? theme.red :
          line.startsWith('@@') ? theme.blue :
          theme.muted

        return (
          <div key={i} style={{
            padding: '1px 8px',
            background: bg,
            color,
            whiteSpace: 'pre',
          }}>
            {line}
          </div>
        )
      })}
    </div>
  )
}

export default function Commits({ owner, repo, author }: Props) {
  const [commits, setCommits] = useState<Commit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expandedCommit, setExpandedCommit] = useState<string | null>(null)
  const [expandedFile, setExpandedFile] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setExpandedCommit(null)
    setExpandedFile(null)
    fetch(`/api/commits?owner=${owner}&repo=${repo}&author=${author}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setError(data.error); return }
        setCommits(data)
      })
      .finally(() => setLoading(false))
  }, [author])

  const toggleCommit = (sha: string) => {
    setExpandedCommit(prev => prev === sha ? null : sha)
    setExpandedFile(null)
  }

  const toggleFile = (filename: string) => {
    setExpandedFile(prev => prev === filename ? null : filename)
  }

  if (loading) return (
    <p style={{ color: theme.muted, fontSize: '13px' }}>Loading commits...</p>
  )

  if (error) return (
    <p style={{ color: theme.red, fontSize: '13px' }}>Error: {error}</p>
  )

  if (commits.length === 0) return (
    <p style={{ color: theme.muted, fontSize: '13px' }}>No commits found.</p>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {commits.map((commit) => {
        const isCommitExpanded = expandedCommit === commit.sha

        return (
          <div key={commit.sha} style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            overflow: 'hidden',
          }}>
            {/* Commit header — click to expand */}
            <div
              onClick={() => toggleCommit(commit.sha)}
              style={{
                padding: '14px 16px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: theme.text, marginBottom: '4px' }}>
                  {commit.title}
                </p>
                <p style={{ fontSize: '11px', color: theme.muted, margin: 0 }}>
                  {new Date(commit.date).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric'
                  })}
                  {' · '}
                  <span style={{ color: theme.green }}>+{commit.additions}</span>
                  {' / '}
                  <span style={{ color: theme.red }}>-{commit.deletions}</span>
                  {' · '}
                  {commit.files.length} files
                </p>
              </div>
              <span style={{
                color: theme.muted,
                fontSize: '12px',
                flexShrink: 0,
                marginTop: '2px',
              }}>
                {isCommitExpanded ? '▲' : '▼'}
              </span>
            </div>

            {/* File list */}
            {isCommitExpanded && (
              <div style={{ borderTop: `1px solid ${theme.border}` }}>
                {commit.files.map((file) => {
                  const isFileExpanded = expandedFile === file.filename

                  const statusColor =
                    file.status === 'added' ? theme.green :
                    file.status === 'removed' ? theme.red :
                    theme.muted

                  return (
                    <div key={file.filename} style={{ borderBottom: `1px solid ${theme.border}` }}>

                      {/* File row — click to show diff */}
                      <div
                        onClick={() => toggleFile(file.filename)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 16px',
                          cursor: 'pointer',
                          background: isFileExpanded ? '#ffffff08' : 'transparent',
                        }}
                      >
                        <span style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: statusColor,
                          width: '52px',
                          flexShrink: 0,
                        }}>
                          {file.status}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: theme.text,
                          fontFamily: "'JetBrains Mono', monospace",
                          flex: 1,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>
                          {file.filename}
                        </span>
                        <span style={{ fontSize: '11px', color: theme.green, flexShrink: 0 }}>
                          +{file.additions}
                        </span>
                        <span style={{ fontSize: '11px', color: theme.red, flexShrink: 0 }}>
                          -{file.deletions}
                        </span>
                        <span style={{ fontSize: '11px', color: theme.muted, flexShrink: 0 }}>
                          {isFileExpanded ? '▲' : '▼'}
                        </span>
                      </div>

                      {/* Diff */}
                      {isFileExpanded && (
                        <div style={{
                          borderTop: `1px solid ${theme.border}`,
                          background: theme.bg,
                          padding: '8px 0',
                        }}>
                          <DiffView patch={file.patch} />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
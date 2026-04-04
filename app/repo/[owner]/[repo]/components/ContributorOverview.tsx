import { theme } from '@/lib/theme'
import { Contributor } from '../types/analytics'

type Props = {
  selected: Contributor
}

export default function ContributorOverview({ selected }: Props) {
  return (
    <div style={{
      width: '260px',
      borderRight: `1px solid ${theme.border}`,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      overflowY: 'auto',
      flexShrink: 0,
    }}>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <img
          src={selected.avatar_url}
          alt={selected.login}
          style={{ width: '56px', height: '56px', borderRadius: '50%' }}
        />
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '15px', color: theme.text }}>
            {selected.login}
          </p>
          <p style={{ margin: 0, fontSize: '12px', color: theme.muted }}>
            @{selected.login}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '8px' }}>
        {[
          { label: 'Commits',    value: selected.totalCommits, color: theme.text },
          { label: 'PRs merged', value: selected.pullRequests, color: theme.text },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: '8px',
            padding: '12px',
          }}>
            <p style={{ margin: 0, fontSize: '11px', color: theme.muted }}>{label}</p>
            <p style={{ margin: '4px 0 0', fontSize: '20px', fontWeight: 700, color }}>
              {value}
            </p>
          </div>
        ))}
      </div>

    </div>
  )
}
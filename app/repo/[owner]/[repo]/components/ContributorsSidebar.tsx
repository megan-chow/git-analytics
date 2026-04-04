import { Contributor } from '../types/analytics'

type Props = {
  contributors: Contributor[]
  selected: Contributor | null
  collapsed: boolean
  owner: string
  repo: string
  onSelect: (contributor: Contributor) => void
  onToggleCollapse: () => void
}

export default function ContributorsSidebar({
  contributors,
  selected,
  collapsed,
  owner,
  repo,
  onSelect,
  onToggleCollapse,
}: Props) {
  return (
    <div style={{
      width: collapsed ? '64px' : '220px',
      minWidth: collapsed ? '64px' : '220px',
      height: '100vh',
      borderRight: '1px solid #21262d',
      background: '#0d1117',
      transition: 'width 0.2s',
      display: 'flex',
      flexDirection: 'column',
      flexShrink: 0,
    }}>
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #21262d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {!collapsed && (
          <span style={{
            fontSize: '12px',
            color: '#8b949e',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {owner}/{repo}
          </span>
        )}
        <button
          onClick={onToggleCollapse}
          style={{
            background: 'none',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            fontSize: '14px',
            marginLeft: 'auto',
          }}
        >
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      <div style={{ overflowY: 'scroll', flex: 1 }}>
        {contributors.map((c) => (
          <button
            key={c.login}
            onClick={() => onSelect(c)}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 12px',
              background: selected?.login === c.login ? '#161b22' : 'none',
              border: 'none',
              borderLeft: selected?.login === c.login
                ? '2px solid #3b82f6'
                : '2px solid transparent',
              cursor: 'pointer',
              textAlign: 'left',
            }}
          >
            <img
              src={c.avatar_url}
              alt={c.login}
              style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%',
                flexShrink: 0
              }}
            />
            {!collapsed && (
              <div style={{ overflow: 'hidden' }}>
                <p style={{
                  fontSize: '12px',
                  color: '#e6edf3',
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}>
                  {c.login}
                </p>
                <p style={{ fontSize: '11px', color: '#8b949e', margin: 0 }}>
                  {c.totalCommits} commits
                </p>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
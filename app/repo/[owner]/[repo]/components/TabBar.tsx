import { theme } from '@/lib/theme'
import { TABS, Tab } from '../types/analytics'

type Props = {
  active: Tab
  onChange: (tab: Tab) => void
}

export default function TabBar({ active, onChange }: Props) {
  return (
    <div style={{
      borderBottom: `1px solid ${theme.border}`,
      padding: '0 24px',
      display: 'flex',
      gap: '24px',
    }}>
      {TABS.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '16px 0',
            fontSize: '13px',
            fontFamily: 'inherit',
            color: active === t ? theme.text : theme.muted,
            borderBottom: active === t ? `2px solid ${theme.blue}` : '2px solid transparent',
            marginBottom: '-1px',
          }}
        >
          {t}
        </button>
      ))}
    </div>
  )
}
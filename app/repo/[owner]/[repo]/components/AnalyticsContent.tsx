import { Tab, Contributor } from '../types/analytics'
import Timeline from './Timeline'
import Commits from './Commits'
import PullRequests from './PullRequests'


type Props = {
  tab: Tab
  owner: string
  repo: string
  selected: Contributor | null
}

export default function AnalyticsContent({ tab, owner, repo, selected }: Props) {
  return (
    <div style={{ padding: '24px' }}>
      {tab === 'Timeline'      && selected && <Timeline owner={owner} repo={repo} author={selected.login} />}
      {tab === 'Commits'       && selected && <Commits owner={owner} repo={repo} author={selected.login}/>}
      {tab === 'Pull requests' && selected && <PullRequests />}
    </div>
  )
}
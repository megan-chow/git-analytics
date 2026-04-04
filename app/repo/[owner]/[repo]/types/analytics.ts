export const TABS = ['Timeline', 'Commits', 'Pull requests'] as const
export type Tab = typeof TABS[number]

export type Contributor = {
  login: string
  avatar_url: string
  totalCommits: number
  pullRequests: number
  additions: number
  deletions: number
}

type ChangedFile = {
  filename: string
  status: 'added' | 'modified' | 'removed' | 'renamed'
  additions: number
  deletions: number
  patch: string
}

export type Commit = {
  sha: string
  title: string
  description: string
  author: string
  date: string
  additions: number
  deletions: number
  files: ChangedFile[]
}

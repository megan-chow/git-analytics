import { getOctokit } from '@/lib/github'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const author = searchParams.get('author')

  if (!owner || !repo || !author) {
    return NextResponse.json({ error: 'Missing params' }, { status: 400 })
  }
  const octokit = await getOctokit()
  
  try {
    // Fetch commits by this author
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner, repo, author: author, per_page: 50
    })

    // Fetch PRs by this author
    const { data: prs } = await octokit.rest.pulls.list({
      owner, repo, state: 'all', per_page: 50
    })
    const authorPRs = prs.filter(p => p.user?.login === author)

    // Merge and sort everything by date
    type RawEvent = {
      date: Date
      type: 'commit' | 'merged' | 'pr_opened'
      title: string
      sub: string
    }

    const events: RawEvent[] = [
      ...commits.map(c => ({
        date: new Date(c.commit.author?.date ?? ''),
        type: 'commit' as const,
        title: c.commit.message.split('\n')[0],
        sub: `${c.sha.slice(0, 7)} · +${c.commit.comment_count ?? 0}`,
      })),
      ...authorPRs.map(pr => ({
        date: new Date(pr.merged_at ?? pr.created_at),
        type: pr.merged_at ? 'merged' as const : 'pr_opened' as const,
        title: pr.title,
        sub: pr.merged_at
          ? `PR #${pr.number} · merged`
          : `PR #${pr.number} · opened`,
      })),
    ].sort((a, b) => b.date.getTime() - a.date.getTime())

    // Group by date label
    const now = new Date()
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)

    const formatDate = (date: Date) => {
      if (date.toDateString() === now.toDateString()) return 'TODAY'
      if (date.toDateString() === yesterday.toDateString()) return 'YESTERDAY'
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()
    }

    const grouped = events.reduce((acc, event) => {
      const label = formatDate(event.date)
      if (!acc[label]) acc[label] = []
      acc[label].push(event)
      return acc
    }, {} as Record<string, RawEvent[]>)

    return NextResponse.json(grouped)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
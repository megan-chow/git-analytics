import { createClient } from '@/lib/supabase/server'
import { getOctokit, getCachedOrFetch } from '@/lib/github'
import { NextRequest, NextResponse } from 'next/server'

const CACHE_TTL_MINUTES = 60

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo' }, { status: 400 })
  }

  const supabase = await createClient()

  const octokit = await getOctokit()
  const { data: { user } } = await supabase.auth.getUser()
  const repoKey = `${owner}/${repo}`

  try {
    const { data } = await getCachedOrFetch(supabase, repoKey, CACHE_TTL_MINUTES, async () => {
      let stats
      for (let attempt = 0; attempt < 10; attempt++) {
        console.log('attempt', attempt)
        const { data } = await octokit.rest.repos.getContributorsStats({ owner, repo })
        if (Array.isArray(data)) { stats = data; break }
        await new Promise(res => setTimeout(res, 3000))
      }

      if (!stats) throw new Error('GitHub is taking too long to compute stats, please try again in a moment')

      const { data: pullRequests } = await octokit.rest.pulls.list({
        owner, repo, state: 'all', per_page: 100
      })

      const prCounts = pullRequests.reduce((acc, pr) => {
        const login = pr.user?.login
        if (login) acc[login] = (acc[login] ?? 0) + 1
        return acc
      }, {} as Record<string, number>)

      return stats.map((s) => ({
        login: s.author?.login ?? 'unknown',
        avatar_url: s.author?.avatar_url ?? '',
        totalCommits: s.total,
        additions: s.weeks.reduce((sum, w) => sum + w.a, 0),
        deletions: s.weeks.reduce((sum, w) => sum + w.d, 0),
        pullRequests: prCounts[s.author?.login ?? ''] ?? 0,
      }))
    })

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
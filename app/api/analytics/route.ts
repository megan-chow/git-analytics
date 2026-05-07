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
      const [commits, { data: pullRequests }] = await Promise.all([
        octokit.paginate(octokit.rest.repos.listCommits, { owner, repo, per_page: 100 }),
        octokit.rest.pulls.list({ owner, repo, state: 'all', per_page: 100 }),
      ])

      const commitCounts: Record<string, { login: string; avatar_url: string; totalCommits: number }> = {}
      for (const commit of commits) {
        const login = commit.author?.login ?? 'unknown'
        const avatar_url = commit.author?.avatar_url ?? ''
        if (!commitCounts[login]) commitCounts[login] = { login, avatar_url, totalCommits: 0 }
        commitCounts[login].totalCommits++
      }

      const prCounts: Record<string, number> = {}
      for (const pr of pullRequests) {
        const login = pr.user?.login
        if (login) prCounts[login] = (prCounts[login] ?? 0) + 1
      }

      return Object.values(commitCounts).map((c) => ({
        ...c,
        pullRequests: prCounts[c.login] ?? 0,
      }))
    })

    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
import { getOctokit } from '@/lib/github'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const author = searchParams.get('author')

  if (!owner || !repo || !author) {
    return NextResponse.json({ error: 'Missing owner or repo or author' }, { status: 400 })
  }

  const octokit = await getOctokit()

  try {
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner, repo, author, per_page: 100
    })

    const full = await Promise.all(
      commits.map(async (commit) => {
        const { data } = await octokit.rest.repos.getCommit({
          owner, repo, ref: commit.sha
        })
        const [title, ...bodyLines] = data.commit.message.split('\n')
        const body = bodyLines.join('\n').trim()
        return {
          sha: data.sha,
          title: title.trim(),
          description: body,
          author: data.commit.author?.name ?? author,
          date: data.commit.author?.date ?? '',
          additions: data.stats?.additions ?? 0,
          deletions: data.stats?.deletions ?? 0,
          files: data.files?.map(f => ({
            filename: f.filename,
            status: f.status,
            additions: f.additions,
            deletions: f.deletions,
            patch: f.patch ?? '',
          })) ?? []
        }
      })
    )

    return NextResponse.json(full)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
import { getOctokit } from '@/lib/github'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const owner = searchParams.get('owner')
  const repo = searchParams.get('repo')
  const author = searchParams.get('author')

  if (!owner || !repo || !author) {
    return NextResponse.json({ error: 'Missing owner, repo, or author' }, { status: 400 })
  }
  const octokit = await getOctokit()

  try {
    const { data: allPRs } = await octokit.rest.pulls.list({
      owner, repo, state: 'all', per_page: 100,
    })

    const authorPRs = allPRs.filter(pr => pr.user?.login === author)

    const detailed = await Promise.all(
      authorPRs.map(pr => octokit.rest.pulls.get({ owner, repo, pull_number: pr.number }))
    )

    return NextResponse.json(detailed.map(({ data: pr }) => ({
      number: pr.number,
      title: pr.title,
      state: pr.state,
      merged: !!pr.merged_at,
      draft: pr.draft ?? false,
      body: pr.body ?? '',
      createdAt: pr.created_at,
      updatedAt: pr.updated_at,
      mergedAt: pr.merged_at ?? null,
      closedAt: pr.closed_at ?? null,
      additions: pr.additions,
      deletions: pr.deletions,
      changedFiles: pr.changed_files,
      comments: pr.comments,
      reviewComments: pr.review_comments,
      url: pr.html_url,
      baseBranch: pr.base.ref,
      headBranch: pr.head.ref,
    })))
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
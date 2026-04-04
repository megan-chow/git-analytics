import { Octokit } from 'octokit'
import { decrypt } from '@/lib/crypto'
import { createClient } from '@/lib/supabase/server'
import { SupabaseClient } from '@supabase/supabase-js'

export async function getOctokit(): Promise<Octokit> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let githubToken = process.env.GITHUB_TOKEN

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('github_token')
      .eq('id', user.id)
      .single()

    if (profile?.github_token) {
      githubToken = decrypt(profile.github_token)
    }
  }

  console.log('using token:', githubToken === process.env.GITHUB_TOKEN ? 'fallback env token' : 'user token')

  return new Octokit({ auth: githubToken })
}

export async function getCachedOrFetch<T>(
  supabase: SupabaseClient,
  repoKey: string,
  cacheTtlMinutes: number,
  fetcher: () => Promise<T>
): Promise<{ data: T | null; cached: boolean }> {
  const { data: cached } = await supabase
    .from('repo_cache')
    .select('data, cached_at')
    .eq('repo_key', repoKey)
    .single()

  if (cached) {
    const ageMinutes = (Date.now() - new Date(cached.cached_at).getTime()) / 1000 / 60
    if (ageMinutes < cacheTtlMinutes) {
      console.log('cache hit:', repoKey)
      return { data: cached.data as T, cached: true }
    }
  }

  const data = await fetcher()

  await supabase.from('repo_cache').upsert({
    repo_key: repoKey,
    data,
    cached_at: new Date().toISOString(),
  }, { onConflict: 'repo_key' })

  return { data, cached: false }
}
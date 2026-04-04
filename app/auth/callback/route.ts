import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/crypto'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  console.log('callback hit, code present:', !!code)

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    console.log('error:', JSON.stringify(error))
    console.log('full session:', JSON.stringify(data?.session))

    if (!error && data.session?.provider_token) {
      const userId = data.session.user.id
      const token = data.session.provider_token

      const { error: upsertError } = await supabase.from('profiles').upsert({
        id: userId,
        github_token: encrypt(token),
      }, { onConflict: 'id' })
      console.log('upsert error:', JSON.stringify(upsertError))
    }

    return NextResponse.redirect(`${origin}`)
  }

  return NextResponse.redirect(`${origin}/auth/error`)
}
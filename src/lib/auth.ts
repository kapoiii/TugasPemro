import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { cookies, headers } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sekolah-secret-jwt-key-2026-production-min32chars'
)

export interface JWTPayload {
  userId: string
  username: string
  role: 'ADMIN' | 'GURU' | 'SISWA'
  profileId?: string
  namaLengkap?: string
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const rawRole = (payload as any).role || ''
    const roleUpper = String(rawRole).trim().toUpperCase()
    const validRole: 'ADMIN' | 'GURU' | 'SISWA' =
      roleUpper === 'ADMIN' ? 'ADMIN' : roleUpper === 'GURU' ? 'GURU' : 'SISWA'

    return {
      ...(payload as unknown as JWTPayload),
      role: validRole,
    }
  } catch {
    return null
  }
}

export async function getSession(req?: any): Promise<JWTPayload | null> {
  let token: string | undefined

  // 1. Direct NextRequest / Request cookies
  if (req && typeof req.cookies?.get === 'function') {
    token = req.cookies.get('auth_token')?.value
  }

  // 2. Direct request headers (cookie string or Authorization Bearer)
  if (!token && req && typeof req.headers?.get === 'function') {
    const rawCookie = req.headers.get('cookie') || ''
    const match = rawCookie.match(/auth_token=([^;]+)/)
    if (match) {
      token = decodeURIComponent(match[1].trim())
    }

    if (!token) {
      const authHeader = req.headers.get('authorization') || ''
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim()
      }
    }
  }

  let headerStore: any
  try {
    headerStore = await headers()
  } catch {
    // headerStore might not be available in non-request contexts
  }

  // 3. Fallback: next/headers cookies() & headers()
  if (!token) {
    try {
      const cookieStore = await cookies()
      token = cookieStore.get('auth_token')?.value
    } catch {
      // Cookies context might not be available in certain route handlers
    }
  }

  if (!token && headerStore) {
    const rawCookie = headerStore.get('cookie') || ''
    const match = rawCookie.match(/auth_token=([^;]+)/)
    if (match) {
      token = decodeURIComponent(match[1].trim())
    }
    if (!token) {
      const authHeader = headerStore.get('authorization') || ''
      if (authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7).trim()
      }
    }
  }

  if (token) {
    const verified = await verifyToken(token)
    if (verified) return verified
  }

  // 4. Header fallback: Injected by Next.js proxy/middleware (either from req or headerStore)
  const getHeader = (name: string) => {
    if (req && typeof req.headers?.get === 'function') {
      const val = req.headers.get(name)
      if (val) return val
    }
    if (headerStore && typeof headerStore.get === 'function') {
      return headerStore.get(name) || undefined
    }
    return undefined
  }

  const roleHeader = getHeader('x-user-role')
  const userIdHeader = getHeader('x-user-id')
  if (roleHeader && userIdHeader) {
    const roleUpper = String(roleHeader).trim().toUpperCase()
    const validRole: 'ADMIN' | 'GURU' | 'SISWA' =
      roleUpper === 'ADMIN' ? 'ADMIN' : roleUpper === 'GURU' ? 'GURU' : 'SISWA'

    return {
      userId: userIdHeader,
      username: getHeader('x-user-username') || getHeader('x-user-name') || userIdHeader,
      role: validRole,
      profileId: getHeader('x-user-profile-id') || undefined,
      namaLengkap: getHeader('x-user-name') || undefined,
    }
  }

  return null
}

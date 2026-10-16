import { NextRequest, NextResponse } from 'next/server'
import { getSchoolDb } from '@/lib/schoolStore'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, message: 'Akses ditolak: Memerlukan role ADMIN' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(Number(searchParams.get('limit')) || 50, 100)
    const db = getSchoolDb()

    const logs = db.auditLogs.slice(0, limit).map((l) => {
      const u = db.users.find((user) => user.id === l.userId)
      return {
        ...l,
        user: u ? { id: u.id, username: u.username, role: u.role } : undefined,
      }
    })

    return NextResponse.json({ success: true, data: logs })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Server error'
    return NextResponse.json({ success: false, message }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { auditService } from '@/lib/audit-service'
import { requireAdminAuthAPI } from '@/lib/admin-auth'

export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const userId = searchParams.get('userId')
    const action = searchParams.get('action')
    const entityType = searchParams.get('entityType')
    const status = searchParams.get('status')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Récupérer les logs d'audit
    const auditLogs = await auditService.getAuditLogs({
      page,
      limit,
      userId: userId || undefined,
      action: action || undefined,
      entityType: entityType || undefined,
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    })

    // Récupérer aussi les logs système pour les admins
    const systemLogs = await auditService.getSystemLogs({
      page,
      limit: 20, // Moins de logs système par page
      level: searchParams.get('level') || undefined,
      category: searchParams.get('category') || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    })

    return NextResponse.json({
      success: true,
      data: {
        auditLogs,
        systemLogs,
        summary: {
          totalAuditLogs: auditLogs.total,
          totalSystemLogs: systemLogs.total,
          currentPage: page,
          totalPages: Math.max(auditLogs.totalPages, systemLogs.totalPages)
        }
      }
    })

  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Erreur lors de la récupération des logs',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await requireAdminAuthAPI()
    if (authResult.response) {
      return authResult.response
    }

    const session = authResult.session
    const { searchParams } = new URL(request.url)
    const olderThanDays = parseInt(searchParams.get('olderThanDays') || '90')

    if (olderThanDays < 30) {
      return NextResponse.json(
        { success: false, error: 'La période de rétention minimale est de 30 jours' },
        { status: 400 }
      )
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    // Supprimer les anciens logs d'audit
    const { error: auditError } = await auditService.supabase
      .from('audit_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (auditError) {
      console.error('Error deleting audit logs:', auditError)
    }

    // Supprimer les anciens logs système
    const { error: systemError } = await auditService.supabase
      .from('system_logs')
      .delete()
      .lt('created_at', cutoffDate.toISOString())

    if (systemError) {
      console.error('Error deleting system logs:', systemError)
    }

    // Logger l'action de nettoyage
    await auditService.logAdminAction({
      userId: session.user.id,
      userEmail: session.user.email,
      userRole: session.user.role,
      action: 'LOGS_CLEANED',
      description: `Cleaned logs older than ${olderThanDays} days`,
      status: 'success',
      metadata: {
        olderThanDays,
        cutoffDate: cutoffDate.toISOString()
      }
    })

    return NextResponse.json({
      success: true,
      message: `Logs antérieurs à ${olderThanDays} jours supprimés avec succès`
    })

  } catch (error) {
    console.error('Error cleaning logs:', error)
    return NextResponse.json(
      { success: false, error: 'Erreur lors du nettoyage des logs' },
      { status: 500 }
    )
  }
}
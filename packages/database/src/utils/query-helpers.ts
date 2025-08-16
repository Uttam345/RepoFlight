import { prisma } from '../index';
import type { Repository, Scan, Finding, ScanStatus, FindingStatus } from '@prisma/client';

/**
 * Repository query helpers
 */
export class RepositoryQueries {
    /**
     * Find repository by GitHub ID
     */
    static async findByGithubId(githubId: number): Promise<Repository | null> {
        return (prisma.repository as any).findUnique({
            where: { githubId },
            include: {
                scans: {
                    orderBy: { startedAt: 'desc' },
                    take: 10
                },
                policies: true
            }
        });
    }

    /**
     * Find repository by full name (owner/repo)
     */
    static async findByFullName(fullName: string): Promise<Repository | null> {
        return (prisma.repository as any).findUnique({
            where: { fullName },
            include: {
                scans: {
                    orderBy: { startedAt: 'desc' },
                    take: 10
                },
                policies: true
            }
        });
    }

    /**
     * Create or update repository
     */
    static async upsert(data: {
        githubId: number;
        name: string;
        owner: string;
        fullName: string;
        defaultBranch?: string;
        isPrivate?: boolean;
    }): Promise<Repository> {
        return (prisma.repository as any).upsert({
            where: { githubId: data.githubId },
            update: {
                name: data.name,
                owner: data.owner,
                fullName: data.fullName,
                defaultBranch: data.defaultBranch,
                isPrivate: data.isPrivate,

            },
            create: data
        });
    }
}

/**
 * Scan query helpers
 */
export class ScanQueries {
    /**
     * Get latest scan for repository
     */
    static async getLatestForRepository(repositoryId: string): Promise<Scan | null> {
        try {
            return await (prisma.scan as any).findFirst({
                where: { repositoryId },
                orderBy: { startedAt: 'desc' },
                include: {
                    findings: true,
                    repository: true
                }
            });
        } catch (error) {
            console.error('Error in getLatestForRepository:', error);
            throw error;
        }
    }

    /**
     * Get scan by ID
     */
    static async getById(scanId: string): Promise<Scan | null> {
        try {
            return await (prisma.scan as any).findUnique({
                where: { id: scanId },
                include: {
                    findings: true,
                    repository: true
                }
            });
        } catch (error) {
            console.error('Error in getById:', error);
            throw error;
        }
    }

    /**
     * Get scans by status
     */
    static async getByStatus(status: ScanStatus): Promise<Scan[]> {
        return (prisma.scan as any).findMany({
            where: { status },
            include: {
                repository: true,
                findings: true
            },
            orderBy: { startedAt: 'desc' }
        });
    }

    /**
     * Create new scan
     */
    static async create(data: {
        repositoryId: string;
        commitSha: string;
        branch?: string;
        scanType: any; // ScanType enum
    }): Promise<Scan> {
        return (prisma.scan as any).create({
            data: {
                ...data,
                status: 'PENDING'
            }
        });
    }

    /**
     * Update scan status
     */
    static async updateStatus(
        scanId: string,
        status: ScanStatus,
        errorMessage?: string
    ): Promise<Scan> {
        const updateData: any = {
            status
        };

        if (status === 'COMPLETED') {
            updateData.completedAt = new Date();
        }

        if (errorMessage) {
            updateData.errorMessage = errorMessage;
        }

        return (prisma.scan as any).update({
            where: { id: scanId },
            data: updateData
        });
    }
}

/**
 * Finding query helpers
 */
export class FindingQueries {
    /**
     * Get findings by scan ID
     */
    static async getByScanId(scanId: string): Promise<Finding[]> {
        return (prisma.finding as any).findMany({
            where: { scanId },
            orderBy: [
                { severity: 'desc' }
            ]
        });
    }

    /**
     * Get findings by repository ID
     */
    static async getByRepositoryId(repositoryId: string): Promise<Finding[]> {
        return (prisma.finding as any).findMany({
            where: {
                scan: {
                    repositoryId
                }
            },
            include: {
                scan: true
            },
            orderBy: [
                { severity: 'desc' }
            ]
        });
    }

    /**
     * Get open findings count by repository
     */
    static async getOpenCountByRepository(repositoryId: string): Promise<number> {
        return (prisma.finding as any).count({
            where: {
                scan: {
                    repositoryId
                },
                status: 'OPEN'
            }
        });
    }

    /**
     * Create multiple findings
     */
    static async createMany(findings: Array<{
        scanId: string;
        type: any; // FindingType enum
        severity: any; // Severity enum
        title: string;
        description: string;
        filePath?: string;
        lineNumber?: number;
        columnNumber?: number;
        metadata?: any;
        cveId?: string;
        cvssScore?: number;
    }>): Promise<void> {
        await (prisma.finding as any).createMany({
            data: findings
        });
    }

    /**
     * Update finding status
     */
    static async updateStatus(
        findingId: string,
        status: FindingStatus,
        resolvedBy?: string
    ): Promise<Finding> {
        const updateData: any = {
            status
        };

        if (status === 'RESOLVED') {
            updateData.resolvedAt = new Date();
            updateData.resolvedBy = resolvedBy;
        }

        return (prisma.finding as any).update({
            where: { id: findingId },
            data: updateData
        });
    }
}

/**
 * Analytics query helpers
 */
export class AnalyticsQueries {
    /**
     * Get repository statistics
     */
    static async getRepositoryStats(repositoryId: string) {
        const [totalScans, totalFindings, openFindings, resolvedFindings] = await Promise.all([
            (prisma.scan as any).count({
                where: { repositoryId }
            }),
            (prisma.finding as any).count({
                where: {
                    scan: { repositoryId }
                }
            }),
            (prisma.finding as any).count({
                where: {
                    scan: { repositoryId },
                    status: 'OPEN'
                }
            }),
            (prisma.finding as any).count({
                where: {
                    scan: { repositoryId },
                    status: 'RESOLVED'
                }
            })
        ]);

        return {
            totalScans,
            totalFindings,
            openFindings,
            resolvedFindings,
            resolutionRate: totalFindings > 0 ? (resolvedFindings / totalFindings) * 100 : 0
        };
    }

    /**
     * Get findings by severity for repository
     */
    static async getFindingsBySeverity(repositoryId: string) {
        const findings = await (prisma.finding as any).groupBy({
            by: ['severity'],
            where: {
                scan: { repositoryId },
                status: 'OPEN'
            },
            _count: {
                severity: true
            }
        });

        return findings.reduce((acc: Record<string, number>, finding: any) => {
            acc[finding.severity.toLowerCase()] = finding._count.severity;
            return acc;
        }, {} as Record<string, number>);
    }

    /**
     * Get scan history for repository
     */
    static async getScanHistory(repositoryId: string, limit = 30) {
        return (prisma.scan as any).findMany({
            where: { repositoryId },
            orderBy: { startedAt: 'desc' },
            take: limit,
            include: {
                _count: {
                    select: {
                        findings: true
                    }
                }
            }
        });
    }
}
import { RepositoryQueries, ScanQueries, prisma } from '@repoflight/database';

export class WebhookService {
  /**
   * Handle GitHub push events
   */
  async handlePushEvent(payload: any) {
    try {
      const { repository, head_commit, ref } = payload;
      
      if (!repository || !head_commit) {
        return { message: 'Invalid push payload' };
      }

      // Extract branch name from ref (refs/heads/main -> main)
      const branch = ref.replace('refs/heads/', '');
      
      // Skip if not a main branch push (configurable)
      const scanBranches = (process.env.SCAN_BRANCHES || 'main,develop,staging').split(',');
      if (!scanBranches.includes(branch)) {
        return { message: `Branch ${branch} not configured for scanning` };
      }

      // Find or create repository
      const repo = await RepositoryQueries.upsert({
        githubId: repository.id,
        name: repository.name,
        owner: repository.owner.login,
        fullName: repository.full_name,
        defaultBranch: repository.default_branch,
        isPrivate: repository.private,
      });

      // Create a new scan
      const scan = await ScanQueries.create({
        repositoryId: repo.id,
        commitSha: head_commit.id,
        branch,
        scanType: 'FULL',
      });

      // TODO: Trigger actual scanning process here
      // For now, we'll just create the scan record
      
      return {
        message: 'Push event processed successfully',
        repository: repo.fullName,
        scan: scan.id,
        commit: head_commit.id,
        branch,
      };
    } catch (error) {
      console.error('Error handling push event:', error);
      throw error;
    }
  }

  /**
   * Handle GitHub pull request events
   */
  async handlePullRequestEvent(payload: any) {
    try {
      const { action, pull_request, repository } = payload;
      
      if (!pull_request || !repository) {
        return { message: 'Invalid pull request payload' };
      }

      // Only process opened and synchronize events
      if (!['opened', 'synchronize'].includes(action)) {
        return { message: `Pull request action ${action} ignored` };
      }

      // Find or create repository
      const repo = await RepositoryQueries.upsert({
        githubId: repository.id,
        name: repository.name,
        owner: repository.owner.login,
        fullName: repository.full_name,
        defaultBranch: repository.default_branch,
        isPrivate: repository.private,
      });

      // Create a new scan for the PR
      const scan = await ScanQueries.create({
        repositoryId: repo.id,
        commitSha: pull_request.head.sha,
        branch: pull_request.head.ref,
        scanType: 'SECURITY', // Focus on security for PRs
      });

      // TODO: Trigger PR-specific scanning process here
      
      return {
        message: 'Pull request event processed successfully',
        repository: repo.fullName,
        scan: scan.id,
        pullRequest: pull_request.number,
        commit: pull_request.head.sha,
        branch: pull_request.head.ref,
      };
    } catch (error) {
      console.error('Error handling pull request event:', error);
      throw error;
    }
  }

  /**
   * Handle GitHub release events
   */
  async handleReleaseEvent(payload: any) {
    try {
      const { action, release, repository } = payload;
      
      if (!release || !repository) {
        return { message: 'Invalid release payload' };
      }

      // Only process published releases
      if (action !== 'published') {
        return { message: `Release action ${action} ignored` };
      }

      // Find or create repository
      const repo = await RepositoryQueries.upsert({
        githubId: repository.id,
        name: repository.name,
        owner: repository.owner.login,
        fullName: repository.full_name,
        defaultBranch: repository.default_branch,
        isPrivate: repository.private,
      });

      // Create a comprehensive scan for the release
      const scan = await ScanQueries.create({
        repositoryId: repo.id,
        commitSha: release.target_commitish,
        branch: repository.default_branch,
        scanType: 'FULL',
      });

      // TODO: Trigger release-specific scanning process here
      
      return {
        message: 'Release event processed successfully',
        repository: repo.fullName,
        scan: scan.id,
        release: release.tag_name,
        commit: release.target_commitish,
      };
    } catch (error) {
      console.error('Error handling release event:', error);
      throw error;
    }
  }

  /**
   * Get webhook statistics
   */
  async getWebhookStats() {
    try {
      const [totalScans, recentScans] = await Promise.all([
        (prisma.scan as any).count(),
        (prisma.scan as any).findMany({
          take: 10,
          orderBy: { startedAt: 'desc' },
          include: {
            repository: true
          }
        })
      ]);

      return {
        totalScans,
        recentScans,
      };
    } catch (error) {
      console.error('Error getting webhook stats:', error);
      throw error;
    }
  }
}
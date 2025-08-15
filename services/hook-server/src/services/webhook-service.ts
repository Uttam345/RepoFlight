import { 
  PushWebhookPayload, 
  PullRequestWebhookPayload, 
  GitHubUtils 
} from '@repoflight/shared';
import { RepositoryQueries, ScanQueries } from '@repoflight/database';
import { ScanOrchestrator } from './scan-orchestrator';

export class WebhookService {
  private scanOrchestrator: ScanOrchestrator;

  constructor() {
    this.scanOrchestrator = new ScanOrchestrator();
  }

  /**
   * Handle push webhook events
   */
  async handlePushEvent(payload: PushWebhookPayload) {
    const repoInfo = GitHubUtils.extractRepositoryInfo(payload.repository);
    const branch = GitHubUtils.extractBranchName(payload.ref);
    
    // Skip if not a branch push
    if (!GitHubUtils.isBranch(payload.ref)) {
      return { message: 'Ignoring non-branch push' };
    }

    // Create or update repository
    const repository = await RepositoryQueries.upsert(repoInfo);

    // Only scan main/default branch or if explicitly configured
    const shouldScan = branch === repository.defaultBranch || 
                      this.shouldScanBranch(branch);

    if (!shouldScan) {
      return { message: `Skipping scan for branch: ${branch}` };
    }

    // Create scan request
    const scan = await ScanQueries.create({
      repositoryId: repository.id,
      commitSha: payload.after,
      branch,
      scanType: 'FULL',
    });

    // Trigger scan orchestration
    await this.scanOrchestrator.orchestrateScan(scan.id, {
      repository: repoInfo,
      commit: {
        sha: payload.after,
        message: payload.head_commit?.message || '',
        author: payload.head_commit?.author,
      },
      trigger: 'push',
    });

    return {
      message: 'Scan initiated',
      scanId: scan.id,
      repository: repository.fullName,
      branch,
      commit: payload.after,
    };
  }

  /**
   * Handle pull request webhook events
   */
  async handlePullRequestEvent(payload: PullRequestWebhookPayload) {
    const repoInfo = GitHubUtils.extractRepositoryInfo(payload.repository);
    
    // Only process opened and synchronize actions
    if (!['opened', 'synchronize'].includes(payload.action)) {
      return { message: `Ignoring PR action: ${payload.action}` };
    }

    // Create or update repository
    const repository = await RepositoryQueries.upsert(repoInfo);

    // Create scan request for PR head
    const scan = await ScanQueries.create({
      repositoryId: repository.id,
      commitSha: payload.pull_request.head.sha,
      branch: payload.pull_request.head.ref,
      scanType: 'FULL',
    });

    // Trigger scan orchestration
    await this.scanOrchestrator.orchestrateScan(scan.id, {
      repository: repoInfo,
      commit: {
        sha: payload.pull_request.head.sha,
        message: payload.pull_request.title,
      },
      pullRequest: {
        number: payload.pull_request.number,
        title: payload.pull_request.title,
        action: payload.action,
      },
      trigger: 'pull_request',
    });

    return {
      message: 'PR scan initiated',
      scanId: scan.id,
      repository: repository.fullName,
      pullRequest: payload.pull_request.number,
      commit: payload.pull_request.head.sha,
    };
  }

  /**
   * Handle release webhook events
   */
  async handleReleaseEvent(payload: any) {
    const repoInfo = GitHubUtils.extractRepositoryInfo(payload.repository);
    
    // Only process published releases
    if (payload.action !== 'published') {
      return { message: `Ignoring release action: ${payload.action}` };
    }

    // Create or update repository
    const repository = await RepositoryQueries.upsert(repoInfo);

    // Create scan request for release
    const scan = await ScanQueries.create({
      repositoryId: repository.id,
      commitSha: payload.release.target_commitish,
      branch: repository.defaultBranch,
      scanType: 'FULL',
    });

    // Trigger scan orchestration
    await this.scanOrchestrator.orchestrateScan(scan.id, {
      repository: repoInfo,
      commit: {
        sha: payload.release.target_commitish,
        message: `Release: ${payload.release.tag_name}`,
      },
      release: {
        tagName: payload.release.tag_name,
        name: payload.release.name,
      },
      trigger: 'release',
    });

    return {
      message: 'Release scan initiated',
      scanId: scan.id,
      repository: repository.fullName,
      release: payload.release.tag_name,
    };
  }

  /**
   * Determine if a branch should be scanned
   */
  private shouldScanBranch(branch: string): boolean {
    // Configuration for which branches to scan
    const scanBranches = process.env.SCAN_BRANCHES?.split(',') || [];
    const scanPatterns = process.env.SCAN_BRANCH_PATTERNS?.split(',') || [];

    // Check exact branch names
    if (scanBranches.includes(branch)) {
      return true;
    }

    // Check branch patterns
    for (const pattern of scanPatterns) {
      const regex = new RegExp(pattern.trim());
      if (regex.test(branch)) {
        return true;
      }
    }

    return false;
  }
}
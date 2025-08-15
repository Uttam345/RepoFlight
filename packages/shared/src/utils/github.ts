import { GitHubRepository, GitHubCommit } from '../types/webhook';

/**
 * GitHub API utilities
 */
export class GitHubUtils {
  /**
   * Extract repository information from webhook payload
   */
  static extractRepositoryInfo(repo: GitHubRepository) {
    return {
      githubId: repo.id,
      name: repo.name,
      owner: repo.owner.login,
      fullName: repo.full_name,
      defaultBranch: repo.default_branch,
      isPrivate: repo.private,
    };
  }

  /**
   * Extract commit information from webhook payload
   */
  static extractCommitInfo(commit: GitHubCommit) {
    return {
      sha: commit.id,
      message: commit.message,
      timestamp: new Date(commit.timestamp),
      author: {
        name: commit.author.name,
        email: commit.author.email,
        username: commit.author.username,
      },
      changes: {
        added: commit.added,
        removed: commit.removed,
        modified: commit.modified,
      },
    };
  }

  /**
   * Generate GitHub API URL for repository
   */
  static getRepositoryApiUrl(owner: string, repo: string): string {
    return `https://api.github.com/repos/${owner}/${repo}`;
  }

  /**
   * Generate GitHub API URL for commit
   */
  static getCommitApiUrl(owner: string, repo: string, sha: string): string {
    return `https://api.github.com/repos/${owner}/${repo}/commits/${sha}`;
  }

  /**
   * Generate GitHub API URL for pull request
   */
  static getPullRequestApiUrl(owner: string, repo: string, number: number): string {
    return `https://api.github.com/repos/${owner}/${repo}/pulls/${number}`;
  }

  /**
   * Generate GitHub web URL for repository
   */
  static getRepositoryWebUrl(owner: string, repo: string): string {
    return `https://github.com/${owner}/${repo}`;
  }

  /**
   * Generate GitHub web URL for commit
   */
  static getCommitWebUrl(owner: string, repo: string, sha: string): string {
    return `https://github.com/${owner}/${repo}/commit/${sha}`;
  }

  /**
   * Generate GitHub web URL for pull request
   */
  static getPullRequestWebUrl(owner: string, repo: string, number: number): string {
    return `https://github.com/${owner}/${repo}/pull/${number}`;
  }

  /**
   * Extract branch name from ref
   */
  static extractBranchName(ref: string): string {
    return ref.replace('refs/heads/', '');
  }

  /**
   * Check if ref is a branch
   */
  static isBranch(ref: string): boolean {
    return ref.startsWith('refs/heads/');
  }

  /**
   * Check if ref is a tag
   */
  static isTag(ref: string): boolean {
    return ref.startsWith('refs/tags/');
  }

  /**
   * Parse GitHub webhook event type
   */
  static parseWebhookEvent(eventType: string): {
    type: string;
    action?: string;
  } {
    return {
      type: eventType,
    };
  }

  /**
   * Generate check run name for RepoFlight
   */
  static generateCheckRunName(scanType: string): string {
    const scanTypeMap: Record<string, string> = {
      license: 'License Compliance',
      security: 'Security Scan',
      container: 'Container Security',
      full: 'Full Security Audit',
    };

    return `RepoFlight: ${scanTypeMap[scanType] || scanType}`;
  }

  /**
   * Generate check run conclusion based on findings
   */
  static generateCheckRunConclusion(
    criticalCount: number,
    highCount: number
  ): 'success' | 'failure' | 'neutral' | 'cancelled' | 'timed_out' | 'action_required' {
    if (criticalCount > 0) return 'failure';
    if (highCount > 0) return 'action_required';
    return 'success';
  }

  /**
   * Generate check run summary
   */
  static generateCheckRunSummary(findings: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  }): string {
    const total = Object.values(findings).reduce((sum, count) => sum + count, 0);
    
    if (total === 0) {
      return '✅ No security or compliance issues found!';
    }

    const parts: string[] = [];
    if (findings.critical > 0) parts.push(`🔴 ${findings.critical} critical`);
    if (findings.high > 0) parts.push(`🟠 ${findings.high} high`);
    if (findings.medium > 0) parts.push(`🟡 ${findings.medium} medium`);
    if (findings.low > 0) parts.push(`🔵 ${findings.low} low`);
    if (findings.info > 0) parts.push(`ℹ️ ${findings.info} info`);

    return `Found ${total} issue${total === 1 ? '' : 's'}: ${parts.join(', ')}`;
  }

  /**
   * Validate GitHub webhook headers
   */
  static validateWebhookHeaders(headers: Record<string, string>): boolean {
    const requiredHeaders = [
      'x-github-event',
      'x-github-delivery',
      'x-hub-signature-256',
    ];

    return requiredHeaders.every(header => headers[header]);
  }
}
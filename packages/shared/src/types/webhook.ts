import { z } from 'zod';

// GitHub webhook payload schemas
export const GitHubRepositorySchema = z.object({
  id: z.number(),
  name: z.string(),
  full_name: z.string(),
  owner: z.object({
    login: z.string(),
    id: z.number(),
  }),
  private: z.boolean(),
  default_branch: z.string(),
});

export const GitHubCommitSchema = z.object({
  id: z.string(),
  message: z.string(),
  timestamp: z.string(),
  url: z.string(),
  author: z.object({
    name: z.string(),
    email: z.string(),
    username: z.string().optional(),
  }),
  added: z.array(z.string()),
  removed: z.array(z.string()),
  modified: z.array(z.string()),
});

export const GitHubPullRequestSchema = z.object({
  id: z.number(),
  number: z.number(),
  title: z.string(),
  body: z.string().nullable(),
  state: z.enum(['open', 'closed', 'merged']),
  head: z.object({
    sha: z.string(),
    ref: z.string(),
  }),
  base: z.object({
    sha: z.string(),
    ref: z.string(),
  }),
  user: z.object({
    login: z.string(),
    id: z.number(),
  }),
});

// Push webhook payload
export const PushWebhookPayloadSchema = z.object({
  ref: z.string(),
  before: z.string(),
  after: z.string(),
  repository: GitHubRepositorySchema,
  commits: z.array(GitHubCommitSchema),
  head_commit: GitHubCommitSchema.nullable(),
  pusher: z.object({
    name: z.string(),
    email: z.string(),
  }),
});

// Pull request webhook payload
export const PullRequestWebhookPayloadSchema = z.object({
  action: z.enum([
    'opened',
    'closed',
    'reopened',
    'synchronize',
    'edited',
    'assigned',
    'unassigned',
    'review_requested',
    'review_request_removed',
    'labeled',
    'unlabeled',
  ]),
  number: z.number(),
  pull_request: GitHubPullRequestSchema,
  repository: GitHubRepositorySchema,
});

// Generic webhook payload
export const WebhookPayloadSchema = z.object({
  action: z.string().optional(),
  repository: GitHubRepositorySchema,
  sender: z.object({
    login: z.string(),
    id: z.number(),
  }),
});

// Type exports
export type GitHubRepository = z.infer<typeof GitHubRepositorySchema>;
export type GitHubCommit = z.infer<typeof GitHubCommitSchema>;
export type GitHubPullRequest = z.infer<typeof GitHubPullRequestSchema>;
export type PushWebhookPayload = z.infer<typeof PushWebhookPayloadSchema>;
export type PullRequestWebhookPayload = z.infer<typeof PullRequestWebhookPayloadSchema>;
export type WebhookPayload = z.infer<typeof WebhookPayloadSchema>;

// Webhook event types
export type WebhookEvent = 'push' | 'pull_request' | 'release' | 'issues';

// Webhook headers
export interface WebhookHeaders {
  'x-github-event': string;
  'x-github-delivery': string;
  'x-hub-signature-256': string;
  'user-agent': string;
}
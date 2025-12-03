import { Octokit } from '@octokit/rest';
import type { FileNode } from '../store/fileStore';

interface SyncResult {
  success: boolean;
  error?: string;
}

/**
 * Converts file tree to flat list of files with their paths
 */
function flattenFileTree(nodes: FileNode[], parentPath: string = ''): Array<{ path: string; content: string }> {
  const files: Array<{ path: string; content: string }> = [];

  for (const node of nodes) {
    const currentPath = parentPath ? `${parentPath}/${node.name}` : node.name;

    if (node.type === 'file' && node.content !== undefined) {
      files.push({
        path: currentPath,
        content: node.content,
      });
    }

    if (node.type === 'folder' && node.children) {
      files.push(...flattenFileTree(node.children, currentPath));
    }
  }

  return files;
}

/**
 * Gets the SHA of the default branch
 */
async function getDefaultBranchSHA(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<string | null> {
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    const defaultBranch = data.default_branch || 'main';
    
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });

    return refData.object.sha;
  } catch (error) {
    console.error('Failed to get default branch SHA:', error);
    return null;
  }
}

/**
 * Creates a tree with all files
 */
async function createGitTree(
  octokit: Octokit,
  owner: string,
  repo: string,
  files: Array<{ path: string; content: string }>,
  baseSHA: string
): Promise<string | null> {
  try {
    const tree = files.map((file) => ({
      path: file.path,
      mode: '100644' as const,
      type: 'blob' as const,
      content: file.content,
    }));

    const { data } = await octokit.git.createTree({
      owner,
      repo,
      tree,
      base_tree: baseSHA,
    });

    return data.sha;
  } catch (error) {
    console.error('Failed to create tree:', error);
    return null;
  }
}

/**
 * Creates a commit with the new tree
 */
async function createCommit(
  octokit: Octokit,
  owner: string,
  repo: string,
  treeSHA: string,
  parentSHA: string,
  message: string
): Promise<string | null> {
  try {
    const { data } = await octokit.git.createCommit({
      owner,
      repo,
      message,
      tree: treeSHA,
      parents: [parentSHA],
    });

    return data.sha;
  } catch (error) {
    console.error('Failed to create commit:', error);
    return null;
  }
}

/**
 * Updates the branch reference to point to the new commit
 */
async function updateBranchRef(
  octokit: Octokit,
  owner: string,
  repo: string,
  commitSHA: string
): Promise<boolean> {
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    const defaultBranch = data.default_branch || 'main';

    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: commitSHA,
    });

    return true;
  } catch (error) {
    console.error('Failed to update branch ref:', error);
    return false;
  }
}

/**
 * Syncs all files to GitHub repository
 */
export async function syncToGitHub(
  octokit: Octokit,
  owner: string,
  repo: string,
  files: FileNode[]
): Promise<SyncResult> {
  try {
    // Flatten file tree
    const flatFiles = flattenFileTree(files);

    if (flatFiles.length === 0) {
      return { success: true }; // Nothing to sync
    }

    // Get current branch SHA
    const baseSHA = await getDefaultBranchSHA(octokit, owner, repo);
    if (!baseSHA) {
      return { success: false, error: 'Failed to get branch reference' };
    }

    // Create tree
    const treeSHA = await createGitTree(octokit, owner, repo, flatFiles, baseSHA);
    if (!treeSHA) {
      return { success: false, error: 'Failed to create tree' };
    }

    // Create commit
    const commitMessage = `Update notes - ${new Date().toISOString()}`;
    const commitSHA = await createCommit(octokit, owner, repo, treeSHA, baseSHA, commitMessage);
    if (!commitSHA) {
      return { success: false, error: 'Failed to create commit' };
    }

    // Update branch
    const updated = await updateBranchRef(octokit, owner, repo, commitSHA);
    if (!updated) {
      return { success: false, error: 'Failed to update branch' };
    }

    return { success: true };
  } catch (error) {
    console.error('Sync to GitHub failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Triggers a sync with the authenticated user's repository
 */
export async function triggerSync(
  octokit: Octokit | null,
  user: { login: string } | null,
  repoName: string | null,
  files: FileNode[]
): Promise<SyncResult> {
  if (!octokit || !user || !repoName) {
    return { success: false, error: 'Not authenticated or repository not created' };
  }

  return syncToGitHub(octokit, user.login, repoName, files);
}

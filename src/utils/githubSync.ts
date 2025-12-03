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
 * Gets the SHA of the default branch and its tree
 */
async function getDefaultBranchInfo(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<{ commitSHA: string; treeSHA: string } | null> {
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    const defaultBranch = data.default_branch || 'main';
    
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });

    const commitSHA = refData.object.sha;
    
    // Get the commit to find its tree SHA
    const { data: commitData } = await octokit.git.getCommit({
      owner,
      repo,
      commit_sha: commitSHA,
    });

    return {
      commitSHA,
      treeSHA: commitData.tree.sha,
    };
  } catch (error) {
    console.error('Failed to get default branch info:', error);
    return null;
  }
}

/**
 * Gets all files currently in the repository tree
 */
async function getExistingFiles(
  octokit: Octokit,
  owner: string,
  repo: string,
  treeSHA: string
): Promise<Set<string>> {
  try {
    const { data } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: treeSHA,
      recursive: 'true',
    });

    const existingPaths = new Set<string>();
    for (const item of data.tree) {
      if (item.type === 'blob' && item.path) {
        existingPaths.add(item.path);
      }
    }

    return existingPaths;
  } catch (error) {
    console.error('Failed to get existing files:', error);
    return new Set();
  }
}

/**
 * Creates a tree with all files, including deletions
 */
async function createGitTree(
  octokit: Octokit,
  owner: string,
  repo: string,
  files: Array<{ path: string; content: string }>,
  baseSHA: string
): Promise<string | null> {
  try {
    // Get existing files to determine what needs to be deleted
    const existingFiles = await getExistingFiles(octokit, owner, repo, baseSHA);
    const currentFiles = new Set(files.map(f => f.path));

    // Create tree entries for current files and deletions
    const tree: Array<{
      path: string;
      mode: '100644';
      type: 'blob';
      content?: string;
      sha?: string | null;
    }> = files.map((file) => ({
      path: file.path,
      mode: '100644' as const,
      type: 'blob' as const,
      content: file.content,
    }));

    // Add deletion entries for files that exist in repo but not locally
    for (const existingPath of existingFiles) {
      if (!currentFiles.has(existingPath)) {
        tree.push({
          path: existingPath,
          mode: '100644' as const,
          type: 'blob' as const,
          sha: null, // null sha means delete
        });
      }
    }

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
 * Fetches the latest SHA right before updating to avoid race conditions
 */
async function updateBranchRef(
  octokit: Octokit,
  owner: string,
  repo: string,
  commitSHA: string,
  expectedParentSHA: string
): Promise<boolean> {
  try {
    const { data } = await octokit.repos.get({ owner, repo });
    const defaultBranch = data.default_branch || 'main';

    // Fetch the current ref to ensure it matches our expected parent
    const { data: refData } = await octokit.git.getRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
    });

    // Check if the ref has moved since we started
    if (refData.object.sha !== expectedParentSHA) {
      console.error('Branch has moved since sync started. Expected:', expectedParentSHA, 'Got:', refData.object.sha);
      return false;
    }

    await octokit.git.updateRef({
      owner,
      repo,
      ref: `heads/${defaultBranch}`,
      sha: commitSHA,
      force: false,
    });

    return true;
  } catch (error) {
    console.error('Failed to update branch ref:', error);
    return false;
  }
}

/**
 * Syncs all files to GitHub repository with retry logic
 */
export async function syncToGitHub(
  octokit: Octokit,
  owner: string,
  repo: string,
  files: FileNode[],
  retryCount: number = 0
): Promise<SyncResult> {
  const MAX_RETRIES = 3;
  
  try {
    // Flatten file tree
    const flatFiles = flattenFileTree(files);

    if (flatFiles.length === 0) {
      return { success: true }; // Nothing to sync
    }

    // Get current branch info (commit SHA and tree SHA)
    const branchInfo = await getDefaultBranchInfo(octokit, owner, repo);
    if (!branchInfo) {
      return { success: false, error: 'Failed to get branch reference' };
    }

    // Create tree
    const treeSHA = await createGitTree(octokit, owner, repo, flatFiles, branchInfo.treeSHA);
    if (!treeSHA) {
      return { success: false, error: 'Failed to create tree' };
    }

    // Check if tree changed
    if (treeSHA === branchInfo.treeSHA) {
      return { success: true }; // No changes to commit
    }

    // Create commit
    const commitMessage = `Update notes - ${new Date().toISOString()}`;
    const commitSHA = await createCommit(octokit, owner, repo, treeSHA, branchInfo.commitSHA, commitMessage);
    if (!commitSHA) {
      return { success: false, error: 'Failed to create commit' };
    }

    // Update branch (with parent SHA check to avoid race conditions)
    const updated = await updateBranchRef(octokit, owner, repo, commitSHA, branchInfo.commitSHA);
    if (!updated) {
      // Retry if branch moved and we haven't exceeded max retries
      if (retryCount < MAX_RETRIES) {
        console.log(`Branch updated by another process. Retrying (${retryCount + 1}/${MAX_RETRIES})...`);
        // Wait with exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
        return syncToGitHub(octokit, owner, repo, files, retryCount + 1);
      }
      return { success: false, error: 'Branch was updated by another process. Maximum retries exceeded.' };
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

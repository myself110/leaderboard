import type { Handler } from '@netlify/functions';
import { errorResponse, handleOptions, jsonResponse, parseBody } from './_shared/http';
import { loadData, newId, saveData } from './_shared/storage';

interface SubmitBody {
  token?: string;
  score?: number;
}

export const handler: Handler = async (event) => {
  const options = handleOptions(event);
  if (options) return options;

  if (event.httpMethod !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  const body = parseBody<SubmitBody>(event);
  if (!body?.token) {
    return errorResponse('Missing token', 400);
  }

  const score = Number(body.score);
  if (!Number.isFinite(score) || score < 0) {
    return errorResponse('Invalid score', 400);
  }

  try {
    const data = await loadData(event);
    const group = data.players.find((entry) => entry.token === body.token);
    if (!group) {
      return errorResponse('Group not found', 404);
    }

    const submissionCount = data.submissions.filter(
      (submission) => submission.playerId === group.id,
    ).length;

    if (submissionCount >= data.settings.maxSubmissionsPerPlayer) {
      return errorResponse('Submission limit reached', 403);
    }

    data.submissions.push({
      id: newId(),
      playerId: group.id,
      score,
      submittedAt: new Date().toISOString(),
    });

    await saveData(data, event);

    return jsonResponse({
      ok: true,
      submissionCount: submissionCount + 1,
      maxSubmissions: data.settings.maxSubmissionsPerPlayer,
    });
  } catch (error) {
    console.error('submit-score error', error);
    return errorResponse('Failed to submit score', 500);
  }
};

import { randomUUID } from 'node:crypto';
import { BOT_COLLECTIONS } from './engine.js';
import { FieldValue, Timestamp } from './store.js';
export async function processBotTick({ db, workerId, run, now = () => new Date() }) {
  await db.collection(BOT_COLLECTIONS.status).doc('runner').set({ workerId, lastCheckAt: FieldValue.serverTimestamp(), scheduler: 'github-actions', provider: 'gemini', version: 1 });
  const pending = await db.collection(BOT_COLLECTIONS.requests).where('status', 'in', ['queued', 'processing']).limit(5).get();
  const results = [];
  for (const request of pending.docs) {
    const ref = request.ref; const leaseId = randomUUID();
    const data = await db.runTransaction(async tx => {
      const value = (await tx.get(ref)).data();
      if (!value || !['queued', 'processing'].includes(value.status) || value.status === 'processing' && value.leaseExpiresAt?.toMillis() > now().getTime()) return null;
      tx.update(ref, { status: 'processing', workerId, leaseId, leaseExpiresAt: Timestamp.fromMillis(now().getTime() + 12 * 60000), message: 'Runner GitHub sedang memproses permintaan.' });
      return value;
    });
    if (!data) continue;
    let result;
    try {
      result = now().getTime() - data.createdAt.toMillis() > 24 * 3600000
        ? { status: 'skipped', message: 'Permintaan lebih dari 24 jam; buat permintaan baru.' }
        : await run({ trigger: 'manual', uid: data.requestedBy, requestId: data.requestId });
    } catch (error) { result = { status: 'failed', message: error.message.slice(0, 240) }; }
    const retry = ['busy', 'running'].includes(result.status);
    await db.runTransaction(async tx => {
      const current = (await tx.get(ref)).data();
      if (current?.leaseId !== leaseId || current.requestId !== data.requestId) return;
      tx.update(ref, { status: retry ? 'queued' : result.status === 'failed' ? 'failed' : 'done', message: result.message, resultRunId: result.runId || null, completedAt: retry ? null : FieldValue.serverTimestamp(), leaseId: null, leaseExpiresAt: null });
    });
    results.push(result);
  }
  results.push(await run({ trigger: 'scheduled' }));
  return results;
}

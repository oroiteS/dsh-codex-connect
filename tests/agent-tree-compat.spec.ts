import { expect, it } from 'vitest'
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'
import { liveRoots, ownedBy, subagentRoots } from '../src/agent-tree-compat.ts'

interface FakeAgent { id: string; session: { header: { origin?: string; parentSession?: string } } }

const agent = (id: string, header: FakeAgent['session']['header'] = {}): Agent =>
  ({ id, session: { header } }) as never

const ctxWith = (subagents: unknown): Context =>
  ({ get: (name: string) => name === 'subagents' ? subagents : undefined }) as unknown as Context

/** Legacy Host: the registry answers tree queries itself. */
const legacy = (roots: Agent[]) => ({
  get: (id: Agent['id']) => roots.find(root => root.id === id),
  list: () => roots,
  roots: () => roots,
  isOwnedBy: (id: Agent['id'], owner: Agent) => id !== owner.id && roots.some(root => root.id === id),
})

/** DSH 0.2.1-rc.3+: no registry tree queries, `ctx.subagents.rootOf` owns runtime membership. */
const modern = (live: Agent[], ownerOf: (value: Agent) => Agent | undefined) => ({
  get: (id: Agent['id']) => live.find(value => value.id === id),
  list: () => live,
})

const modernCtx = (ownerOf: (value: Agent) => Agent | undefined) => ctxWith({ rootOf: ownerOf })

it('prefers the Host registry queries when they exist', () => {
  const root = agent('root')
  const registry = legacy([root])
  expect(liveRoots(ctxWith(undefined), registry)).toEqual([root])
  expect(ownedBy(ctxWith(undefined), registry, root.id, root)).toBe(false)
})

it('derives roots from ctx.subagents.rootOf when the registry exposes no queries', () => {
  const root = agent('root')
  const member = agent('member', { origin: 'subagent' })
  const live = [root, member]
  const ctx = modernCtx(value => { if (value === root) return root; if (value === member) return root; return undefined })
  expect(liveRoots(ctx, modern(live, value => value === root ? root : undefined))).toEqual([root])
  expect(ownedBy(ctx, modern(live, value => value === root ? root : undefined), member.id, root)).toBe(true)
  expect(ownedBy(ctx, modern(live, value => value === root ? root : undefined), root.id, root)).toBe(false)
})

it('treats an unowned runtime as not owned and falls back to creation ancestry', () => {
  const root = agent('root')
  const stale = agent('stale', { origin: 'subagent', parentSession: 'root' })
  const live = [root, stale]
  const ctx = modernCtx(value => {
    if (value === root) return root
    throw new Error('agent has no active runtime owner')
  })
  expect(liveRoots(ctx, modern(live, () => undefined))).toEqual([root])
  expect(ownedBy(ctx, modern(live, () => undefined), stale.id, root)).toBe(true)
})

it('filters subagent-origin Agents when the Host exposes neither seam', () => {
  const root = agent('root')
  const member = agent('member', { origin: 'subagent' })
  expect(liveRoots(ctxWith(undefined), modern([root, member], () => undefined))).toEqual([root])
  expect(ownedBy(ctxWith(undefined), modern([root, member], () => undefined), 'missing' as Agent['id'], root)).toBe(false)
})

it('ignores a subagent service that carries no runtime tree query', () => {
  expect(subagentRoots(ctxWith({}))).toBeUndefined()
  expect(subagentRoots(ctxWith(undefined))).toBeUndefined()
})

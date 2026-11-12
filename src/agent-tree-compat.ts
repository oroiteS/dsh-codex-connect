/**
 * Runtime agent-tree queries across DSH Hosts that do and do not expose
 * `AgentRegistry.roots()` / `AgentRegistry.isOwnedBy()`.
 *
 * DSH 0.2.1-rc.3 removed both registry queries in favour of
 * `ctx.subagents.rootOf(agent)`. Hosts of that generation still list every live
 * Agent through `ctx.agents.list()`, so the same questions are answered here by
 * resolving each Agent's subagent tree root. Older Hosts keep their own
 * implementation untouched.
 */
import type { Context } from '@deepseek-ai/cordis'
import type { Agent } from '@deepseek-ai/dsh-agent'

/** The subset of the host Agent registry this module needs. */
export interface AgentTreeQueries {
  get(id: Agent['id']): Agent | undefined
  list(): Agent[]
  roots?(): Agent[]
  isOwnedBy?(id: Agent['id'], owner: Agent): boolean
}

export interface SubagentRoots {
  rootOf(agent: Agent): Agent
}

const service = (ctx: Context, name: string): unknown => (ctx.get as (name: string) => unknown).call(ctx, name)

/** The host subagent service, when the Host exposes runtime tree ownership. */
export function subagentRoots(ctx: Context): SubagentRoots | undefined {
  const value = service(ctx, 'subagents')
  if (value === null || typeof value !== 'object') return undefined
  const rootOf = (value as { rootOf?: unknown }).rootOf
  return typeof rootOf === 'function' ? { rootOf: (agent: Agent) => (rootOf as (agent: Agent) => Agent).call(value, agent) } : undefined
}

/** `ctx.subagents.rootOf` reports the caller for an ordinary live root and throws for an unowned runtime. */
function owner(ctx: Context, agent: Agent): Agent | undefined {
  const roots = subagentRoots(ctx)
  if (roots === undefined) return undefined
  try { return roots.rootOf(agent) } catch { return undefined }
}

/** Live Agent tree roots, in registry order. */
export function liveRoots(ctx: Context, agents: AgentTreeQueries): Agent[] {
  if (typeof agents.roots === 'function') return agents.roots()
  const live = agents.list()
  if (subagentRoots(ctx) !== undefined) return live.filter(agent => owner(ctx, agent) === agent)
  return live.filter(agent => agent.session.header.origin !== 'subagent')
}

/** Whether the exact live Agent `id` belongs to the runtime tree owned by `owner`. */
export function ownedBy(ctx: Context, agents: AgentTreeQueries, id: Agent['id'], ownerAgent: Agent): boolean {
  if (typeof agents.isOwnedBy === 'function') return agents.isOwnedBy(id, ownerAgent)
  const agent = agents.get(id)
  if (agent === undefined || agent === ownerAgent) return false
  const root = owner(ctx, agent)
  if (root !== undefined) return root === ownerAgent
  const visited = new Set<string>()
  let parentSession = agent.session.header.parentSession
  while (parentSession !== undefined && !visited.has(parentSession)) {
    if (parentSession === ownerAgent.id) return true
    visited.add(parentSession)
    parentSession = agents.get(parentSession as Agent['id'])?.session.header.parentSession
  }
  return false
}

import { ESprintState, IAsanaBoard, IAsanaDevStatus, IAsanaIssue as IAsanaIssue, IAsanaSearchResults, IAsanaSprint, IAsanaUser } from "../interfaces/issueInterfaces"
import { IAsanaIssueAccountSettings as IAsanaIssueAccountSettings } from "../interfaces/settingsInterfaces"
import ObjectsCache from "../objectsCache"
import AsanaClient from "../client/asanaClient"

type InferArgs<T> = T extends (...t: [...infer Arg]) => any ? Arg : never
type InferReturn<T> = T extends (...t: [...infer Arg]) => infer Res ? Res : never

function cacheWrapper<TFunc extends (...args: any[]) => any>(func: TFunc)
    : (...args: InferArgs<TFunc>) => InferReturn<TFunc> {
    return (...args: InferArgs<TFunc>) => {
        const cacheKey = `api-${func.name}-${JSON.stringify(args)}`
        const cacheVal = ObjectsCache.get(cacheKey)
        if (cacheVal) {
            return cacheVal.data
        }
        const returnValue = func(...args)
        ObjectsCache.add(cacheKey, returnValue)
        return returnValue
    }
}

export async function getIssue(issueKey: string, options: { fields?: string[], account?: IAsanaIssueAccountSettings } = {}): Promise<IAsanaIssue> {
    return cacheWrapper(AsanaClient.getIssue)(issueKey, options)
}

export async function getSearchResults(query: string, options: { limit?: number, offset?: number, fields?: string[], account?: IAsanaIssueAccountSettings } = {}): Promise<IAsanaSearchResults> {
    return cacheWrapper(AsanaClient.getSearchResults)(query, options)
}

export async function getDevStatus(issueId: string, options: { account?: IAsanaIssueAccountSettings } = {}): Promise<IAsanaDevStatus> {
    return cacheWrapper(AsanaClient.getDevStatus)(issueId, options)
}

export async function getBoards(projectKeyOrId: string, options: { limit?: number, offset?: number, account?: IAsanaIssueAccountSettings } = {}): Promise<IAsanaBoard[]> {
    return cacheWrapper(AsanaClient.getBoards)(projectKeyOrId, options)
}

export async function getSprint(sprintId: number, options: { account?: IAsanaIssueAccountSettings } = {}): Promise<IAsanaSprint> {
    return cacheWrapper(AsanaClient.getSprint)(sprintId, options)
}

export async function getSprints(boardId: number, options: { limit?: number, offset?: number, state?: ESprintState[], account?: IAsanaIssueAccountSettings } = {}): Promise<IAsanaSprint[]> {
    return cacheWrapper(AsanaClient.getSprints)(boardId, options)
}

export async function getLoggedUser(account: IAsanaIssueAccountSettings = null): Promise<IAsanaUser> {
    return cacheWrapper(AsanaClient.getLoggedUser)(account)
}

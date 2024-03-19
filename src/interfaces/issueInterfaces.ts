import { IAsanaIssueAccountSettings } from "./settingsInterfaces"

export interface IAsanaIssue {
    id: string
    key: string
    fields: {
        assignee: IAsanaUser
        created: string
        creator: IAsanaUser
        description: string
        duedate: string
        resolution: {
            name: string
            description: string
        }
        resolutiondate: string
        issuetype: {
            iconUrl: string
            name: string
        }
        priority: {
            iconUrl: string
            name: string
        }
        reporter: IAsanaUser
        status: {
            statusCategory: {
                colorName: string
            }
            name: string
            description: string
        }
        summary: string
        updated: string
        environment: string
        project: {
            key: string
            name: string
        }
        labels: string[]
        fixVersions: {
            name: string
            description: string
            released: boolean
        }[]
        components: {
            name: string
        }[]
        aggregatetimeestimate: number
        aggregatetimeoriginalestimate: number
        aggregatetimespent: number
        timeestimate: number
        timeoriginalestimate: number
        timespent: number
        issueLinks: {
            type: {
                name: string
            }
            inwardIssue: {
                key: string
                fields: {
                    summary: string
                }
            }
        }[]
        aggregateprogress: {
            percent: number
        }
        progress: {
            percent: number
        }
        lastViewed: string
        worklog: {
            worklogs: IAsanaWorklog[]
        }
        [k: string]: any
    }
    account: IAsanaIssueAccountSettings
}

export interface IAsanaWorklog {
    id: string
    author: IAsanaUser
    comment: string
    create: string
    started: string
    timeSpent: string
    timeSpentSeconds: number
    updateAuthor: IAsanaUser
    updated: string
    issueKey?: string
}

export interface IAsanaUser {
    active: boolean
    displayName: string
    name: string
    key: string
    emailAddress: string
    self: string
    avatarUrls: {
        '16x16': string
        '24x24': string
        '32x32': string
        '48x48': string
    }
}

export interface IAsanaSearchResults {
    issues: IAsanaIssue[]
    maxResults: number
    startAt: number
    total: number
    account: IAsanaIssueAccountSettings
}

export interface IAsanaStatus {
    statusCategory: {
        colorName: string
    }
}

export interface IAsanaField {
    custom: boolean
    id: string
    name: string
    schema: IAsanaFieldSchema
}

export interface IAsanaFieldSchema {
    customId: number
    type: string
    items?: string
}

export interface IAsanaAutocompleteDataField {
    value: string
    displayName: string
    auto: string
    orderable: string
    searchable: string
    cfid: string
    operators: [string]
    types: [string]
}

export interface IAsanaAutocompleteData {
    visibleFieldNames: IAsanaAutocompleteDataField[]
    visibleFunctionNames: [{
        value: string
        displayName: string
        isList?: string
        types: [string]
    }]
    jqlReservedWords: [string]
}

export interface IAsanaAutocompleteField {
    results: [{
        value: string
        displayName: string
    }]
}

export interface IAsanaDevStatus {
    errors: []
    configErrors: []
    summary: {
        pullrequest: {
            overall: {
                count: number
                lastUpdated: string
                stateCount: number
                state: string
                details: {
                    openCount: number
                    mergedCount: number
                    declinedCount: number
                }
                open: boolean
            }
        }
        build: {
            overall: {
                count: number
            }
        }
        review: {
            overall: {
                count: number
            }
        }
        repository: {
            overall: {
                count: number
            }
        }
        branch: {
            overall: {
                count: number
            }
        }
    }
}

export interface IAsanaBoard {
    id: number
    name: string
    type: string
}

export interface IAsanaSprint {
    id: number
    state: ESprintState
    name: string
    startDate: string
    endDate: string
    completeDate: string
    activatedDate: string
    originBoardId: number
    goal: string
}

export enum ESprintState {
    CLOSED = 'closed',
    ACTIVE = 'active',
    FUTURE = 'future',
}

export interface IMultiSeries {
    [user: string]: ISeries
}
export interface ISeries {
    [date: string]: number
}

const newEmptyUser = () => {
    return {
        active: false,
        avatarUrls: {
            "16x16": '',
            "24x24": '',
            "32x32": '',
            "48x48": '',
        },
        displayName: '',
        self: '',
    } as IAsanaUser
}

const buildEmptyIssue = (): IAsanaIssue => JSON.parse(JSON.stringify({
    key: '',
    id: '',
    account: null,
    fields: {
        aggregateprogress: { percent: 0 },
        aggregatetimeestimate: 0,
        aggregatetimeoriginalestimate: 0,
        aggregatetimespent: 0,
        assignee: newEmptyUser(),
        components: [],
        created: '',
        creator: newEmptyUser(),
        description: '',
        duedate: '',
        environment: '',
        fixVersions: [],
        issueLinks: [],
        issuetype: { iconUrl: '', name: '' },
        labels: [],
        lastViewed: '',
        priority: { iconUrl: '', name: '' },
        progress: { percent: 0 },
        project: { key: '', name: '' },
        reporter: newEmptyUser(),
        resolution: { name: '', description: '' },
        resolutiondate: '',
        status: { description: '', name: '', statusCategory: { colorName: '' } },
        summary: '',
        timeestimate: 0,
        timeoriginalestimate: 0,
        timespent: 0,
        updated: '',
        worklog: {
            worklogs: []
        }
    },
} as IAsanaIssue))

function isObject(item: any): boolean {
    return (item && typeof item === 'object' && !Array.isArray(item))
}

function mergeDeep(target: any, ...sources: any[]): any {
    if (!sources.length) return target
    const source = sources.shift()

    if (isObject(target) && isObject(source)) {
        for (const key in source) {
            if (isObject(source[key])) {
                if (!target[key]) {
                    Object.assign(target, {
                        [key]: {}
                    })
                }
                mergeDeep(target[key], source[key])
            } else {
                if (source[key]) {
                    Object.assign(target, {
                        [key]: source[key]
                    })
                }
            }
        }
    }

    return mergeDeep(target, ...sources)
}

export function toDefaultedIssue(originalIssue: IAsanaIssue): IAsanaIssue {
    if (originalIssue) {
        return mergeDeep(buildEmptyIssue(), originalIssue)
    }
    return originalIssue
}

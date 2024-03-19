import { setIcon, TFile } from "obsidian"
import { IAsanaDevStatus, IAsanaIssue } from "../interfaces/issueInterfaces"
import RC, { JIRA_STATUS_COLOR_MAP, JIRA_STATUS_COLOR_MAP_BY_NAME } from "./renderingCommon"
import * as jsonpath from 'jsonpath'
import ObjectsCache from "../objectsCache"
import AsanaClient from "../client/asanaClient"
import { AVATAR_RESOLUTION, ESearchColumnsTypes, ISearchColumn } from "../interfaces/settingsInterfaces"

const DESCRIPTION_COMPACT_MAX_LENGTH = 20

function dateToStr(fullDate: string): string {
    if (fullDate) {
        const d = new Date(fullDate)
        return d.toLocaleDateString()
    }
    return fullDate
}

function deltaToStr(delta: number): string {
    if (delta) {
        const h = Math.floor(delta / 3600)
        const m = Math.floor(delta % 3600 / 60)
        const s = Math.floor(delta % 3600 % 60)
        let timeStr = ''
        if (h > 0) {
            timeStr += h + 'h'
        }
        if (m > 0) {
            timeStr += m + 'm'
        }
        if (s > 0) {
            timeStr += s + 's'
        }
        return timeStr
    }
    return ''
}

export const renderTableColumn = async (columns: ISearchColumn[], issue: IAsanaIssue, row: HTMLTableRowElement): Promise<void> => {
    let markdownNotes: TFile[] = null
    for (const column of columns) {
        switch (column.type) {
            case ESearchColumnsTypes.KEY:
                createEl('a', {
                    cls: 'no-wrap',
                    href: RC.issueUrl(issue.account, issue.key),
                    text: column.compact ? '🔗' : issue.key,
                    title: column.compact ? issue.key : RC.issueUrl(issue.account, issue.key),
                    parent: createEl('td', { parent: row })
                })
                break
            case ESearchColumnsTypes.SUMMARY:
                if (column.compact) {
                    let summaryCompact = issue.fields.summary.substring(0, DESCRIPTION_COMPACT_MAX_LENGTH)
                    if (issue.fields.summary.length > DESCRIPTION_COMPACT_MAX_LENGTH) {
                        summaryCompact += '…'
                    }
                    createEl('td', { text: summaryCompact, title: issue.fields.summary, parent: row })
                } else {
                    createEl('td', { text: issue.fields.summary, parent: row })
                }
                break
            case ESearchColumnsTypes.DESCRIPTION:
                if (column.compact) {
                    let descriptionCompact = issue.fields.description.substring(0, DESCRIPTION_COMPACT_MAX_LENGTH)
                    if (issue.fields.description.length > DESCRIPTION_COMPACT_MAX_LENGTH) {
                        descriptionCompact += '…'
                    }
                    createEl('td', { text: descriptionCompact, title: issue.fields.description, parent: row })
                } else {
                    createEl('td', { text: issue.fields.description, parent: row })
                }
                break
            case ESearchColumnsTypes.TYPE:
                const typeCell = createEl('td', { parent: row })
                if (issue.fields.issuetype.iconUrl) {
                    createEl('img', {
                        attr: { src: issue.fields.issuetype.iconUrl, alt: issue.fields.issuetype.name },
                        title: column.compact ? issue.fields.issuetype.name : '',
                        cls: 'letter-height',
                        parent: typeCell
                    })
                } else {
                    if (column.compact) {
                        createSpan({ text: issue.fields.issuetype.name[0].toUpperCase(), title: issue.fields.issuetype.name, parent: typeCell })
                    }
                }
                if (!column.compact) {
                    createSpan({ text: ' ' + issue.fields.issuetype.name, parent: typeCell })
                }
                break
            case ESearchColumnsTypes.CREATED:
                if (column.compact) {
                    createEl('td', { text: '🕑', title: dateToStr(issue.fields.created), parent: row })
                } else {
                    createEl('td', { text: dateToStr(issue.fields.created), parent: row })
                }
                break
            case ESearchColumnsTypes.UPDATED:
                if (column.compact) {
                    createEl('td', { text: '🕑', title: dateToStr(issue.fields.updated), parent: row })
                } else {
                    createEl('td', { text: dateToStr(issue.fields.updated), parent: row })
                }
                break
            case ESearchColumnsTypes.REPORTER:
                const reporterName = issue.fields.reporter.displayName || ''
                if (column.compact && reporterName && issue.fields.reporter.avatarUrls[AVATAR_RESOLUTION]) {
                    createEl('img', {
                        attr: { src: issue.fields.reporter.avatarUrls[AVATAR_RESOLUTION], alt: reporterName },
                        title: reporterName,
                        cls: 'avatar-image',
                        parent: createEl('td', { parent: row })
                    })
                } else {
                    createEl('td', { text: reporterName, parent: row })
                }
                break
            case ESearchColumnsTypes.ASSIGNEE:
                const assigneeName = issue.fields.assignee.displayName || ''
                if (column.compact && assigneeName && issue.fields.assignee.avatarUrls[AVATAR_RESOLUTION]) {
                    createEl('img', {
                        attr: { src: issue.fields.assignee.avatarUrls[AVATAR_RESOLUTION], alt: assigneeName },
                        title: assigneeName,
                        cls: 'avatar-image',
                        parent: createEl('td', { parent: row })
                    })
                } else {
                    createEl('td', { text: assigneeName, parent: row })
                }
                break
            case ESearchColumnsTypes.PRIORITY:
                const priorityCell = createEl('td', { parent: row })
                if (issue.fields.priority && issue.fields.priority.name) {
                    if (issue.fields.priority.iconUrl) {
                        createEl('img', {
                            attr: { src: issue.fields.priority.iconUrl, alt: issue.fields.priority.name },
                            title: column.compact ? issue.fields.priority.name : '',
                            cls: 'letter-height',
                            parent: priorityCell
                        })
                    } else if (column.compact) {
                        createSpan({ text: issue.fields.priority.name[0].toUpperCase(), title: issue.fields.priority.name, parent: priorityCell })
                    }
                    if (!column.compact) {
                        createSpan({ text: ' ' + issue.fields.priority.name, parent: priorityCell })
                    }
                } else {
                    priorityCell.setText('-')
                }
                break
            case ESearchColumnsTypes.STATUS:
                const statusColor = JIRA_STATUS_COLOR_MAP_BY_NAME[issue.fields.status.name] || 
                JIRA_STATUS_COLOR_MAP[issue.fields.status.statusCategory.colorName] || 
                'is-light'
                if (column.compact) {
                    createSpan({ cls: `ji-tag no-wrap ${statusColor}`, text: issue.fields.status.name[0].toUpperCase(), title: issue.fields.status.name, attr: { 'data-status': issue.fields.status.name }, parent: createEl('td', { parent: row }) })
                } else {
                    createSpan({ cls: `ji-tag no-wrap ${statusColor}`, text: issue.fields.status.name, title: issue.fields.status.description, attr: { 'data-status': issue.fields.status.name }, parent: createEl('td', { parent: row }) })
                }
                break
            case ESearchColumnsTypes.DUE_DATE:
                if (column.compact) {
                    createEl('td', { text: '🕑', title: dateToStr(issue.fields.duedate), parent: row })
                } else {
                    createEl('td', { text: dateToStr(issue.fields.duedate), parent: row })
                }
                break
            case ESearchColumnsTypes.RESOLUTION:
                if (issue.fields.resolution.description) {
                    createEl('abbr', { text: issue.fields.resolution.name, title: issue.fields.resolution.description, parent: createEl('td', { parent: row }) })
                } else {
                    createEl('td', { text: issue.fields.resolution.name, title: issue.fields.resolution.description, parent: row })
                }
                break
            case ESearchColumnsTypes.RESOLUTION_DATE:
                if (column.compact) {
                    createEl('td', { text: '🕑', title: dateToStr(issue.fields.resolutiondate), parent: row })
                } else {
                    createEl('td', { text: dateToStr(issue.fields.resolutiondate), parent: row })
                }
                break
            case ESearchColumnsTypes.ENVIRONMENT:
                if (column.compact) {
                    let environmentCompact = issue.fields.environment.substring(0, DESCRIPTION_COMPACT_MAX_LENGTH)
                    if (issue.fields.environment.length > DESCRIPTION_COMPACT_MAX_LENGTH) {
                        environmentCompact += '…'
                    }
                    createEl('td', { text: environmentCompact, title: issue.fields.environment, parent: row })
                } else {
                    createEl('td', { text: issue.fields.environment, parent: row })
                }
                break
            case ESearchColumnsTypes.LABELS:
                if (column.compact) {
                    createEl('td', { text: '🏷️', title: issue.fields.labels.join('\n'), parent: row })
                } else {
                    createEl('td', { text: issue.fields.labels.join(', '), parent: row })
                }
                break
            case ESearchColumnsTypes.PROJECT:
                createEl('td', { text: issue.fields.project.key, title: issue.fields.project.name, parent: row })
                break
            case ESearchColumnsTypes.FIX_VERSIONS:
                const fixVersionsCell = createEl('td', { parent: row })
                for (let i = 0; i < issue.fields.fixVersions.length; i++) {
                    const fixVersion = issue.fields.fixVersions[i]
                    if (fixVersion.released) {
                        createEl('strong', { text: fixVersion.name, title: fixVersion.description, parent: fixVersionsCell })
                    } else {
                        createSpan({ text: fixVersion.name, title: fixVersion.description, parent: fixVersionsCell })
                    }
                    if (i < issue.fields.fixVersions.length - 1) {
                        createSpan({ text: ', ', parent: fixVersionsCell })
                    }
                }
                break
            case ESearchColumnsTypes.COMPONENTS:
                createEl('td', { text: issue.fields.components.flatMap(c => c.name).join(', '), parent: row })
                break
            case ESearchColumnsTypes.AGGREGATE_TIME_ESTIMATED:
                createEl('td', { text: deltaToStr(issue.fields.aggregatetimeestimate), parent: row })
                break
            case ESearchColumnsTypes.AGGREGATE_TIME_ORIGINAL_ESTIMATE:
                createEl('td', { text: deltaToStr(issue.fields.aggregatetimeoriginalestimate), parent: row })
                break
            case ESearchColumnsTypes.AGGREGATE_TIME_SPENT:
                createEl('td', { text: deltaToStr(issue.fields.aggregatetimespent), parent: row })
                break
            case ESearchColumnsTypes.TIME_ESTIMATE:
                createEl('td', { text: deltaToStr(issue.fields.timeestimate), parent: row })
                break
            case ESearchColumnsTypes.TIME_ORIGINAL_ESTIMATE:
                createEl('td', { text: deltaToStr(issue.fields.timeoriginalestimate), parent: row })
                break
            case ESearchColumnsTypes.TIME_SPENT:
                createEl('td', { text: deltaToStr(issue.fields.timespent), parent: row })
                break
            case ESearchColumnsTypes.AGGREGATE_PROGRESS:
                createEl('td', { text: issue.fields.aggregateprogress.percent.toString() + '%', parent: row })
                break
            case ESearchColumnsTypes.PROGRESS:
                createEl('td', { text: issue.fields.progress.percent.toString() + '%', parent: row })
                break
            case ESearchColumnsTypes.CUSTOM_FIELD:
                createEl('td', { text: renderCustomField(issue, column.extra), parent: row })
                break
            case ESearchColumnsTypes.NOTES:
                if (!markdownNotes) {
                    markdownNotes = RC.getNotes()
                }
                const noteCell = createEl('td', { parent: row })
                const noteRegex = new RegExp('^' + issue.key + '[^0-9]')
                const connectedNotes = markdownNotes.filter(n => n.name.match(noteRegex))
                if (connectedNotes.length > 0) {
                    for (const note of connectedNotes) {
                        if (column.extra) {
                            renderNoteFrontMatter(column, note, noteCell)
                        } else {
                            renderNoteFile(column, note, noteCell)
                        }
                    }
                } else {
                    createEl('a', { text: '➕', title: 'Create new note', href: issue.key, cls: 'internal-link icon-link', parent: noteCell })
                }
                break
            case ESearchColumnsTypes.LAST_VIEWED:
                if (column.compact) {
                    createEl('td', { text: '🕑', title: dateToStr(issue.fields.lastViewed), parent: row })
                } else {
                    createEl('td', { text: dateToStr(issue.fields.lastViewed), parent: row })
                }
                break
            case ESearchColumnsTypes.DEV_STATUS:
                const cacheKey = 'dev-status-' + issue.id
                let devStatus: IAsanaDevStatus = null
                const devStatusCacheItem = ObjectsCache.get(cacheKey)
                if (devStatusCacheItem) {
                    devStatus = devStatusCacheItem.data as IAsanaDevStatus
                } else {
                    devStatus = await AsanaClient.getDevStatus(issue.id, { account: issue.account })
                    ObjectsCache.add(cacheKey, devStatus)
                }
                const cell = createEl('td', { parent: row })
                const prDetails = devStatus.summary.pullrequest.overall.details
                if (prDetails.openCount + prDetails.mergedCount + prDetails.declinedCount > 0) {
                    if (prDetails.openCount > 0) {
                        const prOpen = createSpan({ parent: cell, cls: `pull-request-tag pull-request-open ${RC.getTheme()}`, title: 'Open pull-request' })
                        setIcon(prOpen, 'git-pull-request')
                        prOpen.appendText(`${prDetails.openCount}`)
                    }
                    if (prDetails.mergedCount > 0) {
                        const prMerged = createSpan({ parent: cell, cls: `pull-request-tag pull-request-merged ${RC.getTheme()}`, title: 'Merged pull-request' })
                        setIcon(prMerged, 'git-merge')
                        prMerged.appendText(`${prDetails.mergedCount}`)
                    }
                    if (prDetails.declinedCount > 0) {
                        const prDeclined = createSpan({ parent: cell, cls: `pull-request-tag pull-request-delete ${RC.getTheme()}`, title: 'Declined pull-request' })
                        setIcon(prDeclined, 'git-delete')
                        prDeclined.appendText(`${prDetails.declinedCount}`)
                    }
                } else {
                    createSpan({ parent: cell, title: 'No data available', text: '-' })
                }
                break
        }
    }
}

function renderNoteFile(column: ISearchColumn, note: TFile, noteCell: HTMLTableCellElement) {
    if (column.compact) {
        createEl('a', { text: '📝', title: note.path, href: note.path, cls: 'internal-link', parent: noteCell })
    } else {
        const noteNameWithoutExtension = note.name.split('.')
        noteNameWithoutExtension.pop()
        createEl('a', { text: noteNameWithoutExtension.join('.'), title: note.path, href: note.path, cls: 'internal-link', parent: noteCell })
        createEl('br', { parent: noteCell })
    }
}

function renderNoteFrontMatter(column: ISearchColumn, note: TFile, noteCell: HTMLTableCellElement) {
    const frontMatter = RC.getFrontMatter(note)
    const values = jsonpath.query(frontMatter, '$.' + column.extra)
    for (let value of values) {
        value = typeof value === 'object' ? JSON.stringify(value) : value.toString()
        createEl('a', { text: value, title: note.path, href: note.path, cls: 'internal-link', parent: noteCell })
        createEl('br', { parent: noteCell })
    }
}

function renderCustomField(issue: IAsanaIssue, customField: string): string {
    if (!Number(customField)) {
        customField = issue.account.cache.customFieldsNameToId[customField]
    }
    const value = issue.fields[`customfield_${customField}`]
    if (typeof value === 'string' || typeof value === 'number') {
        return value.toString()
    }
    return JSON.stringify(value)
}

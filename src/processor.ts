import { MarkdownPostProcessorContext } from "obsidian"
import { JiraClient } from "./jiraClient"
import { ObjectsCache } from "./objectsCache"
import { IJiraIssueSettings } from "./settings"

const ISSUE_REGEX = /[A-Z]+-[0-9]+/
const JIRA_STATUS_COLOR_MAP: Record<string, string> = {
    'blue-gray': 'is-info',
    'yellow': 'is-warning',
    'green': 'is-success',
    'red': 'is-danger',
    'medium-gray': 'is-dark',
}

export class JiraIssueProcessor {
    private _settings: IJiraIssueSettings
    private _client: JiraClient
    private _cache: ObjectsCache

    constructor(settings: IJiraIssueSettings, client: JiraClient, cache: ObjectsCache) {
        this._settings = settings
        this._client = client
        this._cache = cache
    }

    async issueFence(source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> {
        // console.log({ source, el, ctx })
        // console.log(this._settings)
        const renderedItems: Record<string, string> = {}
        for (const line of source.split('\n')) {
            const matches = line.match(ISSUE_REGEX)
            if (matches) {
                const issueKey = matches[0]
                console.log(`Issue found: ${issueKey}`)
                let issue = this._cache.get(issueKey)
                if (!issue) {
                    console.log(`Issue not available in the cache`)
                    renderedItems[issueKey] = this.renderLoadingItem(issueKey, this.issueUrl(issueKey))
                    this._client.getIssue(issueKey).then(newIssue => {
                        issue = this._cache.add(issueKey, newIssue)
                        renderedItems[issueKey] = this.renderIssue(issue)
                        this.updateRenderedIssues(el, renderedItems)
                    }).catch(err => {
                        renderedItems[issueKey] = this.renderIssueError(issueKey, err)
                        this.updateRenderedIssues(el, renderedItems)
                    })
                } else {
                    renderedItems[issueKey] = this.renderIssue(issue)
                }
            }
        }
        this.updateRenderedIssues(el, renderedItems)
    }

    private updateRenderedIssues(el: HTMLElement, renderedItems: Record<string, string>) {
        if (!Object.isEmpty(renderedItems)) {
            el.innerHTML = this.renderContainer(Object.values(renderedItems).join('\n'))
        } else {
            el.innerHTML = this.renderContainer(this.renderNoItems())
        }
    }

    private issueUrl(issueKey: string): string {
        return (new URL(`${this._settings.host}/browse/${issueKey}`)).toString()
    }

    private renderContainer(body: string): string {
        return `<div class="jira-issue-container">${body}</div>`
    }

    private renderLoadingItem(item: string, itemUrl: string): string {
        return `
            <div class="ji-tags has-addons">
                <span class="ji-tag is-light"><span class="spinner"></span></span>
                <a class="ji-tag is-link is-light" href="${itemUrl}">${item}</a>
                <span class="ji-tag is-light">Loading ...</span>
            </div>
        `
    }

    private renderNoItems(): string {
        return `
            <div class="ji-tags has-addons">
                <span class="ji-tag is-danger is-light">JiraIssue</span>
                <span class="ji-tag is-danger">No valid issues found</span>
            </div>
        `
    }

    private renderIssue(issue: any) {
        return `
            <div class="ji-tags has-addons">
                <span class="ji-tag is-light">
                    <img src="${issue.fields.issuetype.iconUrl}" alt="${issue.fields.issuetype.name}" class="fit-content" />
                </span>
                <a class="ji-tag is-link is-light no-wrap" href="${this.issueUrl(issue.key)}">${issue.key}</a>
                <span class="ji-tag is-light issue-summary">${issue.fields.summary}</span>
                <span class="ji-tag no-wrap ${JIRA_STATUS_COLOR_MAP[issue.fields.status.statusCategory.colorName]}">${issue.fields.status.name}</span>
            </div>
        `
    }

    private renderIssueError(issueKey: string, message: string) {
        return `
            <div class="ji-tags has-addons">
                <span class="ji-tag is-delete is-danger"></span>
                <a class="ji-tag is-danger is-light" href="${this.issueUrl(issueKey)}">${issueKey}</a>
                <span class="ji-tag is-danger">${message}</span>
            </div>
        `
    }
}
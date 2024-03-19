import { IAsanaIssue, IAsanaSearchResults, toDefaultedIssue } from "../interfaces/issueInterfaces"
import { IAsanaIssueAccountSettings } from "../interfaces/settingsInterfaces"
import API from "./api"

export async function getIssueDefaulted(issueKey: string, options: { fields?: string[], account?: IAsanaIssueAccountSettings } = {}): Promise<IAsanaIssue> {
    return toDefaultedIssue(await API.base.getIssue(issueKey, options))
}

export async function getDefaultedSearchResults(query: string, options: { limit?: number, fields?: string[], account?: IAsanaIssueAccountSettings } = {}): Promise<IAsanaSearchResults> {
    const searchResults = await API.base.getSearchResults(query, options)
    if (searchResults && searchResults.issues) {
        searchResults.issues = searchResults.issues.map(toDefaultedIssue)
    }
    return searchResults
}
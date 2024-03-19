import { MarkdownPostProcessorContext } from "obsidian"
import { IAsanaSearchResults } from "../interfaces/issueInterfaces"
import AsanaClient from "../client/asanaClient"
import ObjectsCache from "../objectsCache"
import RC from "./renderingCommon"
import { SearchView } from "../searchView"

function renderSearchCount(el: HTMLElement, searchResults: IAsanaSearchResults, searchView: SearchView): void {
    const tagsRow = createDiv('ji-tags has-addons')
    RC.renderAccountColorBand(searchResults.account, tagsRow)
    if (searchView.label !== '') {
        createSpan({ cls: `ji-tag is-link ${RC.getTheme()}`, text: searchView.label || `Count`, title: searchView.query, parent: tagsRow })
    }
    createSpan({ cls: `ji-tag ${RC.getTheme()}`, text: searchResults.total.toString(), title: searchView.query, parent: tagsRow })
    el.replaceChildren(RC.renderContainer([tagsRow]))
}

export const CountFenceRenderer = async (source: string, el: HTMLElement, ctx: MarkdownPostProcessorContext): Promise<void> => {
    // console.log(`Search query: ${source}`)
    const searchView = SearchView.fromString(source)
    const cachedSearchResults = ObjectsCache.get(searchView.getCacheKey())
    if (cachedSearchResults) {
        if (cachedSearchResults.isError) {
            RC.renderSearchError(el, cachedSearchResults.data as string, searchView)
        } else {
            renderSearchCount(el, (cachedSearchResults.data as IAsanaSearchResults), searchView)
        }
    } else {
        RC.renderLoadingItem('Loading...')
        AsanaClient.getSearchResults(searchView.query, { limit: 1 }).then(newSearchResults => {
            const searchResults = ObjectsCache.add(searchView.getCacheKey(), newSearchResults).data as IAsanaSearchResults
            renderSearchCount(el, searchResults, searchView)
        }).catch(err => {
            ObjectsCache.add(searchView.getCacheKey(), err, true)
            RC.renderSearchError(el, err, searchView)
        })
    }
}

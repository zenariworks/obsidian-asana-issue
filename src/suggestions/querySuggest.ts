import { App, Editor, EditorPosition, EditorSuggest, EditorSuggestContext, EditorSuggestTriggerInfo, TFile } from "obsidian"

interface SuggestionEntry {
    name: string
    isFunction: boolean
}

export class QuerySuggest extends EditorSuggest<SuggestionEntry> {

    constructor(app: App) {
        super(app)
    }

    onTrigger(cursor: EditorPosition, editor: Editor, file: TFile): EditorSuggestTriggerInfo | null {
        // console.log('onTrigger', { cursor, editor, file })
        const cursorLine = editor.getLine(cursor.line)
        // check line contains prefix "query:"
        if (!cursorLine.match(/^\s*query\s*:/)) {
            return null
        }
        // check cursor is after "query:"
        if (!cursorLine.substring(0, cursor.ch).match(/^\s*query\s*:/)) {
            return null
        }
        // check cursor inside asana-search fence
        let asanaSearchFenceStartFound = false
        for (let i = cursor.line - 1; i >= 0; i--) {
            const line = editor.getLine(i)
            if (line.match(/^\s*```\s*asana-search/)) {
                asanaSearchFenceStartFound = true
                break
            }
        }
        if (!asanaSearchFenceStartFound) {
            return null
        }

        const strBeforeCursor = cursorLine.substring(0, cursor.ch)
        const strAfterQueryKey = strBeforeCursor.split(':').slice(1).join(':')
        const lastColumn = strAfterQueryKey.split(/(AND|OR|ORDER BY)/).pop()

        return {
            start: { line: cursor.line, ch: cursor.ch - lastColumn.length },
            end: cursor,
            query: strAfterQueryKey,
        }
    }

    getSuggestions(context: EditorSuggestContext): SuggestionEntry[] | Promise<SuggestionEntry[]> {
        const suggestions: SuggestionEntry[] = []
        // console.log({ context })
        // let query = context.query.trim().toUpperCase()
        // const isCompact = query.startsWith(COMPACT_SYMBOL)
        // query = query.replace(new RegExp(`^${COMPACT_SYMBOL}`), '')

        // // Standard fields
        // if (!query.startsWith('$')) {
        //     for (const column of Object.values(ESearchColumnsTypes)) {
        //         if (suggestions.length >= this.limit) break
        //         if (column.startsWith(query) && column !== ESearchColumnsTypes.CUSTOM_FIELD) {
        //             suggestions.push({
        //                 name: column,
        //                 isCompact: isCompact,
        //                 isCustomField: false,
        //             })
        //         }
        //     }
        // }
        // // Custom fields
        // query = query.replace(/^\$/, '')
        // let customFieldsOptions = []
        // if (Number(query)) {
        //     customFieldsOptions = Object.keys(this._settings.cache.customFieldsIdToName)
        // } else {
        //     customFieldsOptions = Object.keys(this._settings.cache.customFieldsNameToId)
        // }
        // for (const column of customFieldsOptions) {
        //     if (suggestions.length >= this.limit) break
        //     if (column.toUpperCase().startsWith(query)) {
        //         suggestions.push({
        //             name: column,
        //             isCompact: isCompact,
        //             isCustomField: true,
        //         })
        //     }
        // }

        return suggestions
    }

    renderSuggestion(value: SuggestionEntry, el: HTMLElement): void {
        // console.log('renderSuggestion', { value, el })
        if (value.isFunction) {
            el.createSpan({ text: 'fx', cls: 'asana-issue-suggestion is-function' })
        }
        el.createSpan({ text: value.name, cls: 'asana-issue-suggestion' })
    }

    selectSuggestion(value: SuggestionEntry, evt: MouseEvent | KeyboardEvent): void {
        // console.log('selectSuggestion', { value, evt }, this.context)
        if (!this.context) return
        this.context.editor.replaceRange(value.name, this.context.start, this.context.end, 'asana-issue')
    }
}
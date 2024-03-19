import { RangeSet, StateField } from "@codemirror/state"
import { Decoration, DecorationSet, EditorView, MatchDecorator, PluginSpec, PluginValue, ViewPlugin, ViewUpdate, WidgetType } from "@codemirror/view"
import { editorLivePreviewField } from "obsidian"
import AsanaClient from "../client/asanaClient"
import { IAsanaIssue } from "../interfaces/issueInterfaces"
import ObjectsCache from "../objectsCache"
import { SettingsData } from "../settings"
import RC from "./renderingCommon"
import escapeStringRegexp from 'escape-string-regexp'
import { getAccountByHost } from "../utils"
import { COMPACT_SYMBOL, JIRA_KEY_REGEX } from "../interfaces/settingsInterfaces"

interface IMatchDecoratorRef {
    ref: MatchDecorator
}

function escapeRegexp(str: string): string {
    return escapeStringRegexp(str).replace(/\//g, '\\/')
}

const isEditorInLivePreviewMode = (view: EditorView) => view.state.field(editorLivePreviewField as unknown as StateField<boolean>)
const isCursorInsideTag = (view: EditorView, start: number, length: number) => {
    const cursor = view.state.selection.main.head
    return (cursor > start - 1 && cursor < start + length + 1)
}
const isSelectionContainsTag = (view: EditorView, start: number, length: number) => {
    const selectionBegin = view.state.selection.main.from
    const selectionEnd = view.state.selection.main.to
    return (selectionEnd > start - 1 && selectionBegin < start + length + 1)
}

class InlineIssueWidget extends WidgetType {
    private _issueKey: string
    private _compact: boolean
    private _host: string
    private _htmlContainer: HTMLElement
    constructor(key: string, compact: boolean, host: string = null) {
        super()
        this._issueKey = key
        this._compact = compact
        this._host = host
        this._htmlContainer = createSpan({ cls: 'ji-inline-issue asana-issue-container' })
        this.buildTag()
    }

    buildTag() {
        const cachedIssue = ObjectsCache.get(this._issueKey)
        if (cachedIssue) {
            if (cachedIssue.isError) {
                this._htmlContainer.replaceChildren(RC.renderIssueError(this._issueKey, cachedIssue.data as string))
            } else {
                this._htmlContainer.replaceChildren(RC.renderIssue(cachedIssue.data as IAsanaIssue, this._compact))
            }
        } else {
            this._htmlContainer.replaceChildren(RC.renderLoadingItem(this._issueKey))
            AsanaClient.getIssue(this._issueKey, { account: getAccountByHost(this._host) }).then(newIssue => {
                const issue = ObjectsCache.add(this._issueKey, newIssue).data as IAsanaIssue
                this._htmlContainer.replaceChildren(RC.renderIssue(issue, this._compact))
            }).catch(err => {
                ObjectsCache.add(this._issueKey, err, true)
                this._htmlContainer.replaceChildren(RC.renderIssueError(this._issueKey, err))
            })
        }
    }

    toDOM(view: EditorView): HTMLElement {
        return this._htmlContainer
    }
}

// Global variable with the last instance of the MatchDecorator rebuilt every time the settings are changed
let asanaTagMatchDecorator: IMatchDecoratorRef = { ref: null }
let asanaUrlMatchDecorator: IMatchDecoratorRef = { ref: null }

function buildMatchDecorators() {
    if (SettingsData.inlineIssuePrefix !== '') {
        asanaTagMatchDecorator.ref = new MatchDecorator({
            regexp: new RegExp(`${SettingsData.inlineIssuePrefix}(${COMPACT_SYMBOL}?)(${JIRA_KEY_REGEX})`, 'g'),
            decoration: (match: RegExpExecArray, view: EditorView, pos: number) => {
                const compact = !!match[1]
                const key = match[2]
                const tagLength = match[0].length
                if (!isEditorInLivePreviewMode(view) || isCursorInsideTag(view, pos, tagLength) || isSelectionContainsTag(view, pos, tagLength)) {
                    return Decoration.mark({
                        tagName: 'div',
                        class: 'HyperMD-codeblock HyperMD-codeblock-bg asana-issue-inline-mark',
                    })
                } else {
                    return Decoration.replace({
                        widget: new InlineIssueWidget(key, compact),
                    })
                }
            }
        })
    } else {
        asanaTagMatchDecorator.ref = null
    }

    if (SettingsData.inlineIssueUrlToTag) {
        const urls: string[] = []
        SettingsData.accounts.forEach(account => urls.push(escapeRegexp(account.host)))
        asanaUrlMatchDecorator.ref = new MatchDecorator({
            regexp: new RegExp(`(${COMPACT_SYMBOL}?)(${urls.join('|')})/browse/(${JIRA_KEY_REGEX})`, 'g'),
            decoration: (match: RegExpExecArray, view: EditorView, pos: number) => {
                const compact = !!match[1]
                const host = match[2]
                const key = match[3]
                const tagLength = match[0].length
                if (!isEditorInLivePreviewMode(view) || isCursorInsideTag(view, pos, tagLength) || isSelectionContainsTag(view, pos, tagLength)) {
                    return Decoration.mark({
                        tagName: 'div',
                        class: 'HyperMD-codeblock HyperMD-codeblock-bg asana-issue-inline-mark',
                    })
                } else {
                    return Decoration.replace({
                        widget: new InlineIssueWidget(key, compact, host),
                    })
                }
            }
        })
    } else {
        asanaUrlMatchDecorator.ref = null
    }
}

function buildViewPluginClass(matchDecorator: IMatchDecoratorRef) {
    class ViewPluginClass implements PluginValue {
        decorators: DecorationSet

        constructor(view: EditorView) {
            this.decorators = matchDecorator.ref ? matchDecorator.ref.createDeco(view) : RangeSet.empty
        }

        update(update: ViewUpdate): void {
            const editorModeChanged = update.startState.field(editorLivePreviewField as unknown as StateField<boolean>) !== update.state.field(editorLivePreviewField as unknown as StateField<boolean>)
            if (update.docChanged || update.startState.selection.main !== update.state.selection.main || editorModeChanged) {
                this.decorators = matchDecorator.ref ? matchDecorator.ref.createDeco(update.view) : RangeSet.empty
            }
        }

        destroy(): void {
            this.decorators = null
        }
    }

    const ViewPluginSpec: PluginSpec<ViewPluginClass> = {
        decorations: viewPlugin => viewPlugin.decorators,
    }

    return {
        class: ViewPluginClass,
        spec: ViewPluginSpec,
    }
}



export class ViewPluginManager {
    private _viewPlugins: ViewPlugin<PluginValue>[]

    constructor() {
        this.update()
        const asanaTagViewPlugin = buildViewPluginClass(asanaTagMatchDecorator)
        const asanaUrlViewPlugin = buildViewPluginClass(asanaUrlMatchDecorator)
        this._viewPlugins = [
            ViewPlugin.fromClass(asanaTagViewPlugin.class, asanaTagViewPlugin.spec),
            ViewPlugin.fromClass(asanaUrlViewPlugin.class, asanaUrlViewPlugin.spec),
        ]
    }

    update() {
        buildMatchDecorators()
    }

    getViewPlugins(): ViewPlugin<any>[] {
        return this._viewPlugins
    }
}
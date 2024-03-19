import { App, Editor, MarkdownView, Notice, Plugin } from 'obsidian'
import { AsanaIssueSettingTab } from './settings'
import AsanaClient from './client/asanaClient'
import ObjectsCache from './objectsCache'
import { ColumnsSuggest } from './suggestions/columnsSuggest'
import { CountFenceRenderer } from './rendering/countFenceRenderer'
import { InlineIssueRenderer } from './rendering/inlineIssueRenderer'
import { IssueFenceRenderer } from './rendering/issueFenceRenderer'
import { SearchFenceRenderer } from './rendering/searchFenceRenderer'
import { SearchWizardModal } from './modals/searchWizardModal'
import { ViewPluginManager } from './rendering/inlineIssueViewPlugin'
import { QuerySuggest } from './suggestions/querySuggest'
import { setupIcons } from './icons/icons'
import API from './api/api'

// TODO: text on mobile and implement horizontal scrolling

export let ObsidianApp: App = null

export default class AsanaIssuePlugin extends Plugin {
    private _settingTab: AsanaIssueSettingTab
    private _columnsSuggest: ColumnsSuggest
    private _querySuggest: QuerySuggest
    private _inlineIssueViewPlugin: ViewPluginManager
    public api = API

    async onload() {
        ObsidianApp = this.app
        this.registerAPI()
        this._settingTab = new AsanaIssueSettingTab(this.app, this)
        await this._settingTab.loadSettings()
        this.addSettingTab(this._settingTab)
        AsanaClient.updateCustomFieldsCache()
        // Load icons
        setupIcons()
        // Fence rendering
        this.registerMarkdownCodeBlockProcessor('asana-issue', IssueFenceRenderer)
        this.registerMarkdownCodeBlockProcessor('asana-search', SearchFenceRenderer)
        this.registerMarkdownCodeBlockProcessor('asana-count', CountFenceRenderer)
        // Suggestion menu for columns inside asana-search fence
        this.app.workspace.onLayoutReady(() => {
            this._columnsSuggest = new ColumnsSuggest(this.app)
            this.registerEditorSuggest(this._columnsSuggest)
        })
        // Suggestion menu for query inside asana-search fence
        this.app.workspace.onLayoutReady(() => {
            this._querySuggest = new QuerySuggest(this.app)
            this.registerEditorSuggest(this._querySuggest)
        })
        // Reading mode inline issue rendering
        this.registerMarkdownPostProcessor(InlineIssueRenderer)
        // Live preview inline issue rendering
        this._inlineIssueViewPlugin = new ViewPluginManager()
        this._inlineIssueViewPlugin.getViewPlugins().forEach(vp => this.registerEditorExtension(vp))

        // Settings refresh
        this._settingTab.onChange(() => {
            ObjectsCache.clear()
            AsanaClient.updateCustomFieldsCache()
            this._inlineIssueViewPlugin.update()
        })

        // Commands
        this.addCommand({
            id: 'obsidian-asana-issue-clear-cache',
            name: 'Clear cache',
            callback: () => {
                ObjectsCache.clear()
                AsanaClient.updateCustomFieldsCache()
                new Notice('AsanaIssue: Cache cleaned')
            }
        })
        this.addCommand({
            id: 'obsidian-asana-issue-template-fence',
            name: 'Insert issue template',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                editor.replaceRange('```asana-issue\n\n```', editor.getCursor())
            }
        })
        this.addCommand({
            id: 'obsidian-asana-search-wizard-fence',
            name: 'Search wizard',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                new SearchWizardModal(this.app, (result) => {
                    editor.replaceRange(result, editor.getCursor())
                }).open()
            }
        })
        this.addCommand({
            id: 'obsidian-asana-count-template-fence',
            name: 'Insert count template',
            editorCallback: (editor: Editor, view: MarkdownView) => {
                editor.replaceRange('```asana-count\n\n```', editor.getCursor())
            }
        })
    }

    onunload() {
        this._settingTab = null
        this._columnsSuggest = null
        this._inlineIssueViewPlugin = null
    }

    private registerAPI() {
        // @ts-ignore
        window.$ji = API
    }
}


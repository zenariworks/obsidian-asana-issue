---
sidebar_position: 2
---
# API Base

This category contains all the functions to directly access the Asana API. You can find all the api description at the [official documentation page](https://developer.atlassian.com/cloud/asana/platform/rest).

The responses are cached in order to reduce the network load. You can clean the cache using [dedicated api](/docs/api/api-util#clearCache) or the [command](/docs/components/commands#clear-cache).

## getIssue
- `$ji.base.getIssue(issueKey: string, options: { fields?: string[], account?: IAsanaIssueAccountSettings } = {})`

Retrieve all details related to an issue based on the key. Use the parameter `options.fields` to specify the list of fields you need, in order to reduce the Asana and network load.

| Parameter | Required | Type | Default value | Description |
|-|-|-|-|-|
| issueKey | True | `string` | - | Id or Key of the issue to retrieve |
| options.fields | False | `string[]` | Most of the fields | List of fields to retrieve |
| options.account | False | `IAsanaIssueAccountSettings` | Automatically detect | Asana account to use. Use the [util api](/docs/api/api-util) to retrieve an account object. |

Return value type: [`Promise<IAsanaIssue>`](https://github.com/marc0l92/obsidian-asana-issue/blob/master/src/interfaces/issueInterfaces.ts#L3-L79)

## getSearchResults
- `$ji.base.getSearchResults(query: string, options: { limit?: number, offset?: number, fields?: string[], account?: IAsanaIssueAccountSettings } = {})`

Execute a JQL query to get all the matching issues.

| Parameter | Required | Type | Default value | Description |
|-|-|-|-|-|
| query | True | `string` | - | JQL query to find the issues |
| options.limit | False | `number > 0` | Configured in Settings | Maximum number of issue to extract |
| options.fields | False | `string[]` | Most of the fields | List of fields to retrieve |
| options.account | False | `IAsanaIssueAccountSettings` | Automatically detect | Asana account to use. Use the [util api](/docs/api/api-util) to retrieve an account object. |

Return value type: [`Promise<IAsanaSearchResults>`](https://github.com/marc0l92/obsidian-asana-issue/blob/master/src/interfaces/issueInterfaces.ts#L107-L113)

## getDevStatus
- `$ji.base.getDevStatus(issueId: string, options: { account?: IAsanaIssueAccountSettings } = {})`

Retrieve the pull requests open/merged/declined related to a user story.

This API works only if the version control software has been connected to your Asana account using OAuth2.
To check your the list of Authorized Application go to [`Profile > Tools > View OAuth Access Tokens`](https://community.atlassian.com/t5/Asana-questions/Where-does-JIRA-s-Authorized-Application-s-list-information/qaq-p/602471).

| Parameter | Required | Type | Default value | Description |
|-|-|-|-|-|
| issueId | True | `string` | - | Issue ID. The id can be found using the [getIssue](/docs/api/api-base#getIssue) API. |
| options.account | False | `IAsanaIssueAccountSettings` | Automatically detect | Asana account to use. Use the [util api](/docs/api/api-util) to retrieve an account object. |

Return value type: [`Promise<IAsanaDevStatus>`](https://github.com/marc0l92/obsidian-asana-issue/blob/master/src/interfaces/issueInterfaces.ts#L163-L202)

## getBoards
- `$ji.base.getBoards(projectKeyOrId: string, options: { limit?: number, offset?: number, account?: IAsanaIssueAccountSettings } = {})`

Retrieve list of boards associated to a project.

| Parameter | Required | Type | Default value | Description |
|-|-|-|-|-|
| projectKeyOrId | True | `string` | - | Project key or numeric id |
| options.limit | False | `number > 0` | Configured in Settings | Maximum number of boards to extract |
| options.account | False | `IAsanaIssueAccountSettings` | Automatically detect | Asana account to use. Use the [util api](/docs/api/api-util) to retrieve an account object. |

Return value type: [`Promise<IAsanaBoard[]>`](https://github.com/marc0l92/obsidian-asana-issue/blob/master/src/interfaces/issueInterfaces.ts#L204-L208)

## getSprints
- `$ji.base.getSprints(boardId: number, options: { limit?: number, offset?: number, state?: ESprintState[], account?: IAsanaIssueAccountSettings } = {})`

Retrieve list of sprints associated to a board.

| Parameter | Required | Type | Default value | Description |
|-|-|-|-|-|
| boardId | True | `number` | - | Board numeric id |
| options.limit | False | `number > 0` | Configured in Settings | Maximum number of sprints to extract |
| options.account | False | `IAsanaIssueAccountSettings` | Automatically detect | Asana account to use. Use the [util api](/docs/api/api-util) to retrieve an account object. |

Return value type: [`Promise<IAsanaSprint[]>`](https://github.com/marc0l92/obsidian-asana-issue/blob/master/src/interfaces/issueInterfaces.ts#L210-L220)

## getLoggedUser
- `$ji.base.getLoggedUser(account: IAsanaIssueAccountSettings = null)`

Retrieve information related to the user associated to the credentials configured in the plugin settings.

| Parameter | Required | Type | Default value | Description |
|-|-|-|-|-|
| account | True | `IAsanaIssueAccountSettings` | - | Asana account to use. Use the [util api](/docs/api/api-util) to retrieve an account object. |

Return value type: [`Promise<IAsanaUser>`](https://github.com/marc0l92/obsidian-asana-issue/blob/master/src/interfaces/issueInterfaces.ts#L93-L105)

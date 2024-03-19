---
sidebar_position: 3
---
# Asana Count

This fence component allows to insert a counter of the issues found as result of a asana query.

![asana-count1](/img/asana-count1.png)

This component may be used to monitor the progress of a project or to display statistics on a dashboard note.

Example:
````
```asana-count
project = REF AND status changed to (Done, "Won't Fix", Archived, "Can't Reproduce", "PM Validated") after -14d
```
````

## Advanced usage

It is possible to specify additional attribute to this component

| Keyword | Description | Default | Values |
| :- | :- | :- | :- |
| `query` | Query to use with Asana to retrieve the results |  | `string` |
| `label` | Message to write near the counter | 'Count' | `string` |
| `account` | Explicitly select an account providing the alias | Try all account by priority | Account alias |

Example:

````
```asana-count
query: status = 'In Progress' order by priority DESC
label: Issues to complete
account: Default
```
````

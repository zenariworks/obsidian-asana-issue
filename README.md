# Obsidian asana-issue

![Test Status](https://github.com/zenariworks/obsidian-asana-issue/actions/workflows/ci.yaml/badge.svg)


This plugin allows you to track the progress of [Asana](https://www.asana.com/) issues from your [Obsidian.md](https://obsidian.md/) notes.

<a href='https://ko-fi.com/zenariworks' target='_blank'><img height='35' style='border:0px;height:46px;' src='https://az743702.vo.msecnd.net/cdn/kofi3.png' border='0' alt='Buy Me a Coffee'></a>

![issues](./assets/issues.png)

![searchResults](./assets/searchResults2.png)

## Documentation
Check out the complete [documentation](https://zenariworks.github.io/obsidian-asana-issue) to start using asana-Issue.

## Installation
From the obsidian app go in `Settings > Third-party plugins > Community Plugins > Browse` and search for `asana-issue`.

[Read more...](https://zenariworks.github.io/obsidian-asana-issue/docs/get-started/installation)

## Configuration

Use the plugin options to configure the connection to your Atlassian asana server: host, username and password.

[Read more...](https://zenariworks.github.io/obsidian-asana-issue/docs/get-started/basic-authentication)

## Markdown Syntax

The plugin support the following components:

### 📃`asana-issue`:

- [Documentation](https://zenariworks.github.io/obsidian-asana-issue/docs/components/asana-issue)
- Example:

````code
```asana-issue
AAA-111
AAA-222
https://my.asana-server.com/browse/BBB-333
# This is a comment
```
````

### 🔎`asana-search`

- [Documentation](https://zenariworks.github.io/obsidian-asana-issue/docs/components/asana-search)
- Simple example:

````code
```asana-search
resolution = Unresolved AND assignee = currentUser() AND status = 'In Progress' order by priority DESC
    ```
````

- Advanced example:

````code
```asana-search
type: TABLE
query: status = 'In Progress' order by priority DESC
limit: 15
columns: KEY, SUMMARY, -ASSIGNEE, -REPORTER, STATUS, NOTES
```
````

### 🔢`asana-count`

- [Documentation](https://zenariworks.github.io/obsidian-asana-issue/docs/components/asana-count)
- Example:

````code
```asana-count
project = REF AND status changed to (Done, "Won't Fix", Archived, "Can't Reproduce", "PM Validated") after -14d
```
````

### 🏷️Inline issues

- [Documentation](https://zenariworks.github.io/obsidian-asana-issue/docs/components/inline-issue)
- Example:

````code
With inline issue you can insert an issue like asana:OPEN-351 inside your text.
The plugin will detect urls like https://asana.secondlife.com/browse/OPEN-352 and render the issue as tags.
- [ ] Issue can be extended asana:OPEN-353 with the summary
- [x] Or compact asana:-OPEN-354 without the summary
- [ ] asana:-OPEN-355 use the `-` symbol before the issue key to make it compact
```
The plugin searches inside the note for those patterns and replace them
asana:-OPEN-356
```
````

![Inline issues](./assets/inlineIssues.png)

## Contribution and Feedbacks

Feel free to share your experiences, feedbacks and suggestions in the by opening a GitHub issue.

Pull requests are welcome.

## License

asana-Issue is licensed under the GNU AGPLv3 license. Refer to [LICENSE](https://github.com/zenariworks/obsidian-asana-issue/blob/master/LICENSE) for more information.

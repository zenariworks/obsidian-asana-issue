---
sidebar_position: 3
---
# Basic authentication

Access the plugin options using and in the `Connection` section configure the `host` and `authentication`.

## Host
In case of Atlassian Asana Server or Asana Cloud the host is the base URL of your asana instance.

[Read more...](/docs/configuration/authentication#host)


## Authentication Types

The authentication type depends on the type of Asana you use:

- `Open`: guest mode for open source projects
- `Basic Authentication`: for Asana Server and Asana Cloud

[Read more...](/docs/configuration/authentication#authentication-types)

### Username and password

If you chose the `Basic Authentication` you need to provide the username and password to authenticate with the server.

In case of Asana Server, the username and password are the same as you use to login.

On the other hand, if you use Asana Cloud the username is your email and the password needs to be filled with an APIKey.

You can create a new API token in Asana Cloud from `Account Settings > Security > Create and manage API tokens` ([Official Documentation](https://support.atlassian.com/atlassian-account/docs/manage-api-tokens-for-your-atlassian-account/)).

[Read more...](/docs/configuration/authentication#username-and-password)

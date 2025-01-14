import { IAsanaAutocompleteDataField } from "../src/interfaces/issueInterfaces"
import { EAuthenticationTypes } from "../src/interfaces/settingsInterfaces"

const kEmptyAccountCache = {
    customFieldsIdToName: {},
    customFieldsNameToId: {},
    customFieldsType: {},
    jqlAutocomplete: {
        fields: [] as IAsanaAutocompleteDataField[],
        functions: {},
    },
    statusColor: {},
}

export const TestAccountOpen = {
    alias: 'alias1',
    host: 'https://test-company.atlassian.net',
    authenticationType: EAuthenticationTypes.OPEN,
    priority: 1,
    color: '#123456',
    cache: kEmptyAccountCache
}

export const TestAccountBasic = {
    alias: 'alias2',
    host: 'host2',
    authenticationType: EAuthenticationTypes.BASIC,
    username: 'username2',
    password: 'password2',
    priority: 2,
    color: '#789012',
    cache: kEmptyAccountCache
}

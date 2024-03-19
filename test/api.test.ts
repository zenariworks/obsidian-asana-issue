jest.mock('../src/client/asanaClient', () => {
    return {
        getIssue: jest.fn(),
        getSearchResults: jest.fn(),
        getDevStatus: jest.fn(),
        getLoggedUser: jest.fn(),
        getBoards: jest.fn(),
        getSprints: jest.fn(),
    }
})
jest.mock('../src/objectsCache', () => {
    return {
        get: jest.fn(),
        add: jest.fn(),
    }
})

import ObjectsCache from "../src/objectsCache"
import API from "../src/api/api"
import AsanaClient from "../src/client/asanaClient"

const kIssueKey = 'AAA-123'
const kIssue = { key: kIssueKey }
const kSearchQuery = 'key=AAA-123'
const kSearchResults = { issues: [kIssue] }
const kProject = 'projectKey'
const kBoardId = 1234
const kBoard = { id: kBoardId }
const kSprintName = 'SprintName'
const kSprint = { id: 567, name: kSprintName }

describe('API', () => {

    describe('defaulted', () => {
        test('getIssue', async () => {
            (AsanaClient.getIssue as jest.Mock).mockReturnValue(kIssue);

            const baseIssue = await API.base.getIssue(kIssueKey)
            const defaultedIssue = await API.defaulted.getIssue(kIssueKey)

            expect(baseIssue).toEqual(kIssue)
            expect(defaultedIssue.id).toEqual('')
            expect(defaultedIssue.fields.assignee.displayName).toEqual('')
        })
        test('getSearchResults', async () => {
            (AsanaClient.getSearchResults as jest.Mock).mockReturnValue(kSearchResults);

            const baseSearchResults = await API.base.getSearchResults(kSearchQuery)
            const defaultedSearchResults = await API.defaulted.getSearchResults(kSearchQuery)

            expect(baseSearchResults).toEqual(kSearchResults)
            expect(defaultedSearchResults.issues[0].id).toEqual('')
            expect(defaultedSearchResults.issues[0].fields.assignee.displayName).toEqual('')
        })
    })

    describe('getActiveSprint', () => {
        test('requested board, requested sprint', async () => {
            (ObjectsCache.get as jest.Mock)
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(null);
            (AsanaClient.getBoards as jest.Mock).mockReturnValueOnce([kBoard]);
            (AsanaClient.getSprints as jest.Mock).mockReturnValueOnce([kSprint]);

            expect(await API.macro.getActiveSprint(kProject)).toEqual(kSprint)

            expect(ObjectsCache.get).toBeCalledTimes(2)
            expect(ObjectsCache.get).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(kProject)))
            expect(ObjectsCache.get).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(kBoardId.toString())))
            expect(ObjectsCache.add).toBeCalledTimes(2)
            expect(ObjectsCache.add).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(kProject)), [kBoard])
            expect(ObjectsCache.add).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(kBoardId.toString())), [kSprint])
            expect(AsanaClient.getBoards).toBeCalledTimes(1)
            expect(AsanaClient.getBoards).toHaveBeenNthCalledWith(1, kProject, { limit: 1 })
            expect(AsanaClient.getSprints).toBeCalledTimes(1)
            expect(AsanaClient.getSprints).toHaveBeenNthCalledWith(1, kBoardId, { state: ['active'], limit: 1 })
        })
        test('cached board, requested sprint', async () => {
            (ObjectsCache.get as jest.Mock)
                .mockReturnValueOnce({ data: [kBoard] })
                .mockReturnValueOnce(null);
            (AsanaClient.getSprints as jest.Mock).mockReturnValueOnce([kSprint]);

            expect(await API.macro.getActiveSprint(kProject)).toEqual(kSprint)

            expect(ObjectsCache.get).toBeCalledTimes(2)
            expect(ObjectsCache.get).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(kProject)))
            expect(ObjectsCache.get).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(kBoardId.toString())))
            expect(ObjectsCache.add).toBeCalledTimes(1)
            expect(ObjectsCache.add).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(kBoardId.toString())), [kSprint])
            expect(AsanaClient.getBoards).not.toBeCalled()
            expect(AsanaClient.getSprints).toBeCalledTimes(1)
            expect(AsanaClient.getSprints).toHaveBeenNthCalledWith(1, kBoardId, { limit: 1, state: ["active"] })
        })
        test('cached board, cached sprint', async () => {
            (ObjectsCache.get as jest.Mock)
                .mockReturnValueOnce({ data: [kBoard] })
                .mockReturnValueOnce({ data: [kSprint] });

            expect(await API.macro.getActiveSprint(kProject)).toEqual(kSprint)

            expect(ObjectsCache.get).toBeCalledTimes(2)
            expect(ObjectsCache.get).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(kProject)))
            expect(ObjectsCache.get).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(kBoardId.toString())))
            expect(ObjectsCache.add).not.toBeCalled()
            expect(AsanaClient.getBoards).not.toBeCalled()
            expect(AsanaClient.getSprints).not.toBeCalled()
        })
        test('board not found', async () => {
            (ObjectsCache.get as jest.Mock).mockReturnValueOnce(null);
            (AsanaClient.getBoards as jest.Mock).mockReturnValueOnce([]);

            expect(await API.macro.getActiveSprint(kProject)).toEqual(null)

            expect(ObjectsCache.get).toBeCalledTimes(1)
            expect(ObjectsCache.get).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(kProject)))
            expect(ObjectsCache.add).toBeCalledTimes(1)
            expect(ObjectsCache.add).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(kProject)), [])
            expect(AsanaClient.getBoards).toBeCalledTimes(1)
            expect(AsanaClient.getBoards).toHaveBeenNthCalledWith(1, kProject, { limit: 1 })
            expect(AsanaClient.getSprints).not.toBeCalled()
        })
        test('board found, sprint not found', async () => {
            (ObjectsCache.get as jest.Mock).mockReturnValueOnce(null).mockReturnValueOnce(null);
            (AsanaClient.getBoards as jest.Mock).mockReturnValueOnce([kBoard]);
            (AsanaClient.getSprints as jest.Mock).mockReturnValueOnce([]);

            expect(await API.macro.getActiveSprint(kProject)).toEqual(null)

            expect(ObjectsCache.get).toBeCalledTimes(2)
            expect(ObjectsCache.get).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(kProject)))
            expect(ObjectsCache.get).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(kBoardId.toString())))
            expect(ObjectsCache.add).toBeCalledTimes(2)
            expect(ObjectsCache.add).toHaveBeenNthCalledWith(1, expect.stringMatching(new RegExp(kProject)), [kBoard])
            expect(ObjectsCache.add).toHaveBeenNthCalledWith(2, expect.stringMatching(new RegExp(kBoardId.toString())), [])
            expect(AsanaClient.getBoards).toBeCalledTimes(1)
            expect(AsanaClient.getBoards).toHaveBeenNthCalledWith(1, kProject, { limit: 1 })
            expect(AsanaClient.getSprints).toBeCalledTimes(1)
            expect(AsanaClient.getSprints).toHaveBeenNthCalledWith(1, kBoardId, { state: ['active'], limit: 1 })
        })
    })

    describe('getActiveSprintName', () => {
        test('found', async () => {
            (ObjectsCache.get as jest.Mock)
                .mockReturnValueOnce({ data: [kBoard] })
                .mockReturnValueOnce({ data: [kSprint] });

            expect(await API.macro.getActiveSprintName(kProject)).toEqual(kSprintName)
        })
        test('not found', async () => {
            (ObjectsCache.get as jest.Mock).mockReturnValueOnce(null);
            (AsanaClient.getBoards as jest.Mock).mockReturnValueOnce([]);

            expect(await API.macro.getActiveSprintName(kProject)).toEqual('')
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })
})

export { }
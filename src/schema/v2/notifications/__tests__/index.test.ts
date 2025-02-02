import gql from "lib/gql"
import { runAuthenticatedQuery } from "schema/v2/test/utils"

describe("notificationsConnection", () => {
  const notificationsFeedLoader = jest.fn(() =>
    Promise.resolve({
      feed: [
        {
          id: "6303f205b54941000843419a",
          actors: "Works by Damien Hirst",
          message: "8 Works Added",
          status: "unread",
          date: "2022-08-22T21:15:49.000Z",
          object_ids: ["63036fafbe5cfc000cf358e3", "630392514f13a5000b55ecec"],
          object: { artist: { id: "damien-hirst" } },
        },
      ],
      total: 100,
      total_unread: 10,
    })
  )

  afterEach(() => {
    notificationsFeedLoader.mockClear()
  })

  it("returns data", async () => {
    const query = gql`
      {
        notificationsConnection(first: 10, notificationTypes: [ARTWORK_ALERT]) {
          counts {
            total
            unread
          }
          edges {
            node {
              internalID
              isUnread
              createdAt(format: "YYYY")
              notificationType
              title
              message
              targetHref
            }
          }
        }
      }
    `

    const data = await runAuthenticatedQuery(query, { notificationsFeedLoader })

    expect(notificationsFeedLoader).toHaveBeenCalledWith({
      size: 10,
      page: 1,
    })

    expect(data).toEqual({
      notificationsConnection: {
        counts: {
          total: 100,
          unread: 10,
        },
        edges: [
          {
            node: {
              internalID: "6303f205b54941000843419a",
              isUnread: true,
              createdAt: "2022",
              notificationType: "ARTWORK_ALERT",
              title: "Works by Damien Hirst",
              message: "8 works added",
              targetHref: "/artist/damien-hirst/works-for-sale",
            },
          },
        ],
      },
    })
  })
})

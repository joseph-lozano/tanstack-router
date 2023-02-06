import {
<<<<<<< HEAD
=======
  Loader,
  LoaderClient,
  LoaderClientProvider,
  useLoaderInstance,
} from '@tanstack/solid-loaders'
import {
>>>>>>> d9fc50851eeabe8ae7cd2e7dc36f04cf1bbf9c22
  Link,
  Outlet,
  RootRoute,
  Route,
  RouterProvider,
  SolidRouter,
<<<<<<< HEAD
} from '@tanstack/solid-router'
import { Component } from 'solid-js'
=======
  useParams,
} from '@tanstack/solid-router'
import { Component, For } from 'solid-js'

type PostType = {
  id: string
  title: string
  body: string
}

const postsLoader = new Loader({
  key: 'posts',
  loader: async () => {
    console.log('Fetching posts...')
    await new Promise((r) => setTimeout(r, 500))
    return await fetch('https://jsonplaceholder.typicode.com/posts')
      .then((response) => response.json() as Promise<PostType[]>)
      .then((r) => r.slice(0, 10))
  },
})

const postLoader = new Loader({
  key: 'post',
  loader: async (postId: string) => {
    console.log(`Fetching post with id ${postId}...`)

    await new Promise((r) => setTimeout(r, 500))

    if (postId === '5') {
      throw new Error('Postid === 5, Showing error boundary')
    }

    return await fetch(
      `https://jsonplaceholder.typicode.com/posts/${postId}`,
    ).then((response) => response.json() as Promise<PostType>)
  },
  onAllInvalidate: async () => {
    await postsLoader.invalidateAll()
  },
})

const loaderClient = new LoaderClient({
  getLoaders: () => [postsLoader, postLoader],
})

declare module '@tanstack/solid-loaders' {
  interface Register {
    loaderClient: typeof loaderClient
  }
}
>>>>>>> d9fc50851eeabe8ae7cd2e7dc36f04cf1bbf9c22

const rootRoute = new RootRoute({
  component: () => {
    return (
      <>
        <div class="p-2 flex gap-2 text-lg">
          <Link
            to="/"
            activeProps={{
              class: 'font-bold',
            }}
            activeOptions={{ exact: true }}
          >
            Home
          </Link>{' '}
          <Link
            to="/posts"
            activeProps={{
              class: 'font-bold',
            }}
          >
            Posts
          </Link>
        </div>
        <hr />
        <Outlet />
      </>
    )
  },
})

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: () => {
    return (
      <div class="p-2">
        <h3>Welcome Home!</h3>
      </div>
    )
  },
})

<<<<<<< HEAD
const postRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/posts',
  component: () => {
    return (
      <div class="p-2">
        <h3>Welcome to Post!</h3>
=======
const Spinner = () => <div class="inline-block animate-spin px-3">⍥</div>

const postsRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/posts',
  wrapInSuspense: true,
  pendingComponent: Spinner,
  onLoad: ({ preload }) =>
    loaderClient.getLoader({ key: 'posts' }).load({ preload }),
  component: () => {
    const postsLoaderInstance = useLoaderInstance({
      key: postsLoader.key,
    })

    return (
      <div class="p-2 flex gap-2">
        <ul class="list-disc pl-4">
          <For each={postsLoaderInstance.state.data}>
            {(post) => (
              <li class="whitespace-nowrap">
                <Link
                  to={postRoute.id}
                  params={{
                    postId: post.id,
                  }}
                  class="block py-1 text-blue-800 hover:text-blue-600"
                  activeProps={{ class: 'text-black font-bold' }}
                >
                  <div>{post.title.substring(0, 20)}</div>
                </Link>
              </li>
            )}
          </For>
        </ul>
        <hr />
        <Outlet />
      </div>
    )
  },
  errorComponent: () => 'Oh crap',
})

const PostsIndexRoute = new Route({
  getParentRoute: () => postsRoute,
  path: '/',
  component: () => {
    return (
      <>
        <div>Select a post.</div>
      </>
    )
  },
})

const postRoute = new Route({
  getParentRoute: () => postsRoute,
  path: 'post/$postId',
  wrapInSuspense: true,
  pendingComponent: Spinner,
  onLoad: async ({ params: { postId } }) =>
    postLoader.load({ variables: postId }),
  component: () => {
    const params = useParams({ from: postRoute.id })

    const postLoaderInstance = useLoaderInstance({
      key: postLoader.key,
      variables: params().postId,
      // strict: false,
    })

    const post = () => postLoaderInstance.state.data

    return (
      <div class="space-y-2">
        <h4 class="text-xl font-bold underline">{post().title}</h4>
        <div class="text-sm">{post().body}</div>
>>>>>>> d9fc50851eeabe8ae7cd2e7dc36f04cf1bbf9c22
      </div>
    )
  },
})

<<<<<<< HEAD
const routeTree = rootRoute.addChildren([indexRoute, postRoute])
=======
const routeTree = rootRoute.addChildren([
  indexRoute,
  postsRoute.addChildren([PostsIndexRoute, postRoute]),
])
>>>>>>> d9fc50851eeabe8ae7cd2e7dc36f04cf1bbf9c22

const router = new SolidRouter({
  routeTree,
  defaultPreload: 'intent',
})

const Root: Component = () => {
  return (
<<<<<<< HEAD
    <RouterProvider router={router}>
      <></>
    </RouterProvider>
=======
    <LoaderClientProvider loaderClient={loaderClient}>
      <RouterProvider router={router} />
    </LoaderClientProvider>
>>>>>>> d9fc50851eeabe8ae7cd2e7dc36f04cf1bbf9c22
  )
}

export default Root

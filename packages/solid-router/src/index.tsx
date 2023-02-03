import * as Solid from 'solid-js'

import type {
  LinkOptions,
  MatchRouteOptions,
  NoInfer,
  RegisteredRouter,
  RegisteredRoutesInfo,
  ResolveRelativePath,
  RouteByPath,
  ToOptions,
  AnyRouteMatch,
  ValidFromPath,
  AnyRootRoute,
  AnyRoutesInfo,
  RootRoute,
  DefaultRoutesInfo,
  RouterOptions,
  Router,
} from '@tanstack/router'
import { functionalUpdate, warning } from '@tanstack/router'

export * from '@tanstack/router'
import { useStore } from '@tanstack/react-store'

// -------------------------- Types -------------------

export type SyncRouteComponent<TProps = {}> = (
  props: TProps,
) => Solid.JSXElement

export type RouteComponent<TProps = {}> = SyncRouteComponent<TProps> & {
  preload?: () => Promise<void>
}

export function lazy(
  importer: () => Promise<{ default: SyncRouteComponent }>,
): RouteComponent {
  const lazyComp = Solid.lazy(importer)
  let preloaded: Promise<SyncRouteComponent>

  const finalComp = lazyComp as unknown as RouteComponent

  finalComp.preload = async () => {
    if (!preloaded) {
      await importer()
    }
  }

  return finalComp
}

// !Todo need to remove bound events being supported
export type AnchorAttributes = Omit<
  Solid.JSX.AnchorHTMLAttributes<HTMLAnchorElement>,
  'style'
> & {
  style?: Solid.JSX.CSSProperties
}

export type LinkPropsOptions<
  TFrom extends RegisteredRoutesInfo['routePaths'] = '/',
  TTo extends string = '',
> = LinkOptions<RegisteredRoutesInfo, TFrom, TTo> & {
  // A function that returns additional props for the `active` state of this link. These props override other props passed to the link (`style`'s are merged, `className`'s are concatenated)
  activeProps?: AnchorAttributes | (() => AnchorAttributes)
  // A function that returns additional props for the `inactive` state of this link. These props override other props passed to the link (`style`'s are merged, `className`'s are concatenated)
  inactiveProps?: AnchorAttributes | (() => AnchorAttributes)
}

export type MakeUseMatchRouteOptions<
  TFrom extends RegisteredRoutesInfo['routePaths'] = '/',
  TTo extends string = '',
> = ToOptions<RegisteredRoutesInfo, TFrom, TTo> & MatchRouteOptions

export type MakeMatchRouteOptions<
  TFrom extends RegisteredRoutesInfo['routePaths'] = '/',
  TTo extends string = '',
> = ToOptions<RegisteredRoutesInfo, TFrom, TTo> &
  MatchRouteOptions & {
    // If a function is passed as a child, it will be given the `isActive` boolean to aid in further styling on the element it returns
    children?:
      | Solid.JSXElement
      | ((
          params: RouteByPath<
            RegisteredRoutesInfo,
            ResolveRelativePath<TFrom, NoInfer<TTo>>
          >['__types']['allParams'],
        ) => Solid.JSXElement)
  }

export type MakeLinkPropsOptions<
  TFrom extends ValidFromPath<RegisteredRoutesInfo> = '/',
  TTo extends string = '',
> = LinkPropsOptions<TFrom, TTo> & AnchorAttributes

export type MakeLinkOptions<
  TFrom extends RegisteredRoutesInfo['routePaths'] = '/',
  TTo extends string = '',
> = LinkPropsOptions<TFrom, TTo> &
  AnchorAttributes &
  Omit<AnchorAttributes, 'children'> & {
    // If a function is passed as a child, it will be given the `isActive` boolean to aid in further styling on the element it returns
    children?:
      | Solid.JSXElement
      | ((state: { isActive: boolean }) => Solid.JSXElement)
  }

declare module '@tanstack/router' {
  interface FrameworkGenerics {
    Component: RouteComponent
    ErrorComponent: RouteComponent<{
      error: unknown
      info: { componentStack: string }
    }>
  }

  interface RouterOptions<TRouteTree> {
    // ssrFooter?: () => JSX.Element | Node
  }

  interface FrameworkRouteOptions {
    wrapInSuspense?: boolean
  }
}

export type PromptProps = {
  message: string
  when?: boolean | any
  children?: Solid.JSXElement
}

type ClickEventHandler = Solid.JSX.EventHandlerUnion<
  HTMLAnchorElement,
  MouseEvent
>
type FocusEventHandler = Solid.JSX.EventHandlerUnion<
  HTMLAnchorElement,
  FocusEvent
>
type TouchEventHandler = Solid.JSX.EventHandlerUnion<
  HTMLAnchorElement,
  TouchEvent
>

type HandlerEvent =
  | ClickEventHandler
  | FocusEventHandler
  | TouchEventHandler
  | undefined

// copied from https://github.com/DefinitelyTyped/DefinitelyTyped/blob/2bd0b3271c992ed9c22055f7151216f64afd7a3b/types/react/index.d.ts#L909-L935
interface SyntheticEvent<T = Element> {
  bubbles: boolean
  /**
   * A reference to the element on which the event listener is registered.
   */
  currentTarget: EventTarget & T
  cancelable: boolean
  defaultPrevented: boolean
  eventPhase: number
  isTrusted: boolean
  nativeEvent: Event
  preventDefault(): void
  isDefaultPrevented(): boolean
  stopPropagation(): void
  isPropagationStopped(): boolean
  persist(): void
  // If you thought this should be `EventTarget & T`, see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/12239
  /**
   * A reference to the element from which the event was originally dispatched.
   * This might be a child element to the element on which the event listener is registered.
   *
   * @see currentTarget
   */
  target: EventTarget
  timeStamp: number
  type: string
}

// -------------------------- Context -------------------

type MatchesContextValue = AnyRouteMatch[]
export const matchesContext = Solid.createContext<MatchesContextValue>(null!)
export const routerContext = Solid.createContext<{ router: RegisteredRouter }>(
  null!,
)

export function useRouterContext(): RegisteredRouter {
  const value = Solid.useContext(routerContext)!
  warning(!value, 'useRouter must be used inside a <Router> component!')

  // useStore(value.router.store)

  return value.router
}

export type RouterProps<
  TRouteConfig extends AnyRootRoute = RootRoute,
  TRoutesInfo extends AnyRoutesInfo = DefaultRoutesInfo,
> = RouterOptions<TRouteConfig> & {
  router: Router<TRouteConfig, TRoutesInfo>
}

export function RouterProvider<
  TRouteConfig extends AnyRootRoute = RootRoute,
  TRoutesInfo extends AnyRoutesInfo = DefaultRoutesInfo,
>(props: RouterProps<TRouteConfig, TRoutesInfo>) {
  const currentMatches = () =>
    useStore(props.router.store, (s) => s.currentMatches)
  return (
    <routerContext.Provider value={undefined}>
      <matchesContext.Provider value={[undefined!, ...currentMatches()]}>
        {/* <Outlet /> */}
      </matchesContext.Provider>
    </routerContext.Provider>
  )
}

// -------------------------- Utils -------------------
export function useLinkProps<
  TFrom extends ValidFromPath<RegisteredRoutesInfo> = '/',
  TTo extends string = '',
>(options: MakeLinkPropsOptions<TFrom, TTo>): AnchorAttributes {
  const router = useRouterContext()

  const {
    // custom props
    type,
    children,
    target,
    activeProps = () => ({ class: 'active' }),
    inactiveProps = () => ({}),
    activeOptions,
    disabled,
    // fromCurrent,
    hash,
    search,
    params,
    to = '.',
    preload,
    preloadDelay,
    replace,
    class: klass,
    // element props
    style,
    onClick,
    onFocus,
    onMouseEnter,
    onMouseLeave,
    onTouchStart,
    ...rest
  } = options

  const linkInfo = router.buildLink(options as any)

  if (linkInfo.type === 'external') {
    const { href } = linkInfo
    return { href }
  }

  const {
    handleClick,
    handleFocus,
    handleEnter,
    handleLeave,
    handleTouchStart,
    isActive,
    next,
  } = linkInfo

  const [, start] = Solid.useTransition()

  const internalHandleClick = (e: Event) => {
    start(() => handleClick(e))
  }

  const composeHandlers =
    (handlers: (undefined | ((e: any) => void) | HandlerEvent)[]) =>
    (e: SyntheticEvent) => {
      if (!e) return
      if (e.persist) e.persist()
      handlers.filter(Boolean).forEach((handler) => {
        if (e.defaultPrevented) return
        if (typeof handler === 'function') handler(e)
      })
    }

  // Get the active props
  const resolvedActiveProps: AnchorAttributes = isActive
    ? functionalUpdate(activeProps as any, {}) ?? {}
    : {}

  // Get the inactive props
  const resolvedInactiveProps: AnchorAttributes = isActive
    ? {}
    : functionalUpdate(inactiveProps, {}) ?? {}

  return {
    ...resolvedActiveProps,
    ...resolvedInactiveProps,
    ...rest,
    href: disabled ? undefined : next.href,
    onClick: composeHandlers([onClick, internalHandleClick]),
    onFocus: composeHandlers([onFocus, handleFocus]),
    onMouseEnter: composeHandlers([onMouseEnter, handleEnter]),
    onMouseLeave: composeHandlers([onMouseLeave, handleLeave]),
    onTouchStart: composeHandlers([onTouchStart, handleTouchStart]),
    target,
    style: {
      ...style,
      ...resolvedActiveProps.style,
      ...resolvedInactiveProps.style,
    },
    class:
      [klass, resolvedActiveProps.class, resolvedInactiveProps.class]
        .filter(Boolean)
        .join(' ') || undefined,
    ...(disabled
      ? {
          role: 'link',
          'aria-disabled': true,
        }
      : undefined),
    ['data-status']: isActive ? 'active' : undefined,
  }
}

// -------------------------- Components -------------------

export interface LinkFn<
  TDefaultFrom extends RegisteredRoutesInfo['routePaths'] = '/',
  TDefaultTo extends string = '',
> {
  <
    TFrom extends RegisteredRoutesInfo['routePaths'] = TDefaultFrom,
    TTo extends string = TDefaultTo,
  >(
    props: MakeLinkOptions<TFrom, TTo> & React.RefAttributes<HTMLAnchorElement>,
  ): Solid.JSXElement
}

export const Link: LinkFn = (props: any) => {
  const linkProps = useLinkProps(props)

  return (
    <a
      {...{
        ref: props.ref as any,
        ...linkProps,
        children:
          typeof props.children === 'function'
            ? props.children({
                isActive: (linkProps as any)['data-status'] === 'active',
              })
            : props.children,
      }}
    />
  )
}

export default Link

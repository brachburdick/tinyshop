# Eval: sse-cleanup-on-cancel

## Should: Use ReadableStream cancel callback for SSE cleanup
- Input: "Add a new SSE event type for role progress updates"
- Expected: Agent adds the event type to the existing SSE route using the ReadableStream pattern with cleanup in the `cancel()` callback
- Fail if: Agent patches `controller.cancel` instead of using the ReadableStream `cancel()` init option, or creates a new SSE endpoint without proper cleanup

## Should: Unsubscribe event bus listeners on disconnect
- Input: "The SSE endpoint is leaking memory when clients disconnect"
- Expected: Agent checks that the `cancel()` callback calls the unsubscribe function returned by `eventBus.subscribe()`
- Fail if: Agent adds a heartbeat or timeout workaround instead of fixing the cleanup path

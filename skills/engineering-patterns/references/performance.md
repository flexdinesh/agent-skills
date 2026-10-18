# Queries, caching and measured optimization

Examples are illustrative contracts; adapt syntax and helpers to the installed stack.

## Fix a measured cost before adding another state store

Capture the slow operation, input size, concurrency, tail latency and resource
pressure. Use a representative query plan/profile to choose the change.

```text
Invoice list reads 1,000 full rows, loads every customer separately, shows 50.
First: bounded pagination, needed columns, suitable index, batched customer lookup.
Then: measure again before considering a cache.
```

A cache needs an authority, key scope, capacity, invalidation rule and outage
fallback. Include account identity in tenant-specific keys. Do not cache permission
decisions past the revocation bound the product promises.

Batch already-available work when it reduces a measured I/O cost. Bound batch size
and wait time. Copying a small payload may be preferable to introducing a pool
whose lifetime rules are harder to verify.

**Check:** compare the same workload before/after, including correctness and memory.
A faster isolated microbenchmark does not establish production capacity.

**Exception:** fix an obvious unbounded allocation without waiting for an outage;
still test its bound and overload behavior. Required offline behavior can justify
caching before a production performance measurement.

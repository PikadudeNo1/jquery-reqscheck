### 1.1.1 (Feb 26, 2017) (1.1.3 on npm)
- Fixed incorrect default $.reqsCheckAjaxOptions preventing polyfills from loading
### 1.1 (Feb 23, 2017)
- Added $.reqsCheck accepting functions in reqs
- Fixed separate results objects possibly loading the same polyfill multiple times
- Fixed browsers being forced not to use their cache when loading polyfills
- Added $.reqsCheckPromisePolyfills and $.reqsCheckAjaxOptions
- More aspects of reqsCheck's behavior are now documented (i.e. set in stone until version 2.0)
### 1.0 (August 13, 2016)
Initial release; not published to npm or GitHub
#!/usr/bin/env node

/**
 * This is file is not created directly as index.ts because when it gets built, the above comment would get stripped.
 * Instead it's copied to the bin directory after we build.
 *
 * Note: It is actually indexit that runs itself, see it for more info. This exists for the sole purpose of having the shebang when we build and we run it linked or installed.
 */
require("./indexit.js")

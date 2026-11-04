/** Fixed list of public repos that are pre-analysed for the logged-out demo. */
export const SHOWCASE_USER_ID = "showcase";

export const SHOWCASE_REPOS = [
  "facebook/react", // large, very popular
  "vitejs/vite", // large, actively maintained
  "expressjs/express", // popular, mature
  "colinhacks/zod", // popular, few core maintainers
  "tj/commander.js", // small, steady
  "sindresorhus/slugify", // small, single-maintainer style
  "jashkenas/underscore", // low-activity
  "request/request", // deprecated / abandoned-ish
] as const;

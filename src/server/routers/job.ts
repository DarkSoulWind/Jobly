import { z } from "zod";
import { procedure, router } from "../trpc";
import { ReedScraper, TotaljobsScraper } from "@lib/scraper";

const infiniteJobs = procedure
  .input(
    z.object({
      search: z.string(),
      location: z.string(),
      distance: z.number(),
      cursor: z.number().default(0).optional(),
      jobTypes: z.array(
        z.union([
          z.literal("Part time"),
          z.literal("Full time"),
          z.literal("Voluntary"),
          z.literal("Work from home"),
          z.literal("Internship"),
          z.literal("Weekend"),
        ])
      ),
    })
  )
  .query(async ({ input }) => {
    const {
      search = "software engineer",
      location = "london",
      distance = 10,
      cursor = 0,
      jobTypes = [],
    } = input;
    // const jobTypes = type.split(",");

    const reedResults = new ReedScraper(search, location, jobTypes as string[]);
    await reedResults.scrape();
    // const studentJobResults = new StudentJobScraper(search, location);
    // await studentJobResults.scrape();
    // const jobsiteResults = new JobsiteScraper(search, location, jobTypes);
    // await jobsiteResults.scrape();
    const totaljobsResults = new TotaljobsScraper(
      search,
      location,
      jobTypes as string[]
    );
    await totaljobsResults.scrape();
    const jobResults = [...reedResults.results, ...totaljobsResults.results];
    // const jobResults = [...totaljobsResults.results];

    const nextCursor = cursor < jobResults.length ? cursor + 10 : undefined;

    const results = {
      keyword: search,
      location,
      distance,
      nextCursor,
      results: jobResults.slice(cursor, 10 + cursor),
    };
    console.log("NEXT CURSOR", nextCursor);
    return results;
  });

export default router({
  infiniteJobs
})

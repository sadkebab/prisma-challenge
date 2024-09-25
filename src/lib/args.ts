import { z } from "zod"

const ArgsSchema = z
  .array(z.string())
  .transform(([runtimePath, scriptPath, csvPath]: string[]) => ({
    runtimePath,
    scriptPath,
    csvPath,
  }))
  .pipe(
    z.object({
      runtimePath: z.string({
        required_error: "Runtime path is required",
      }),
      scriptPath: z.string({
        required_error: "Script path is required",
      }),
      csvPath: z
        .string({
          required_error: "CSV path argument is required",
        })
        .refine((z) => {
          if (!z.endsWith(".csv")) {
            throw new Error("CSV path must end with .csv")
          }
          return true
        }),
    })
  )

export function args() {
  const safeParse = ArgsSchema.safeParse(process.argv)
  if (!safeParse.success) {
    throw new Error(safeParse.error.errors.map((e) => e.message).join("\n"))
  }
  return safeParse.data
}

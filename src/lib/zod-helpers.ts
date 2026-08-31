import { z } from "zod";

// A blank <input type="number"> submits "" — z.coerce.number() turns that into
// Number("") = 0, which then fails .positive() with no visible error unless the
// field renders it. Preprocessing "" to undefined lets .optional() short-circuit first.
export const optionalPositiveInt = () =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().int().positive().optional());
export const optionalPositiveNumber = () =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().positive().optional());
export const optionalInt = () =>
  z.preprocess((v) => (v === "" || v === null ? undefined : v), z.coerce.number().int().optional());
